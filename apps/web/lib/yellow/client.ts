import {
  NitroliteClient,
  WalletStateSigner,
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createGetConfigMessageV2,
  parseAnyRPCResponse,
  parseGetConfigResponse,
  generateRequestId,
  RPCMethod,
  createEIP712AuthMessageSigner,
} from '@erc7824/nitrolite'
import type {
  NitroliteClientConfig,
  MessageSigner,
  RPCResponse,
  AuthChallengeResponse,
} from '@erc7824/nitrolite'
import type { PublicClient, WalletClient, Chain, Account, Transport, Address } from 'viem'
import { YELLOW_CONTRACTS, YELLOW_CLEARNODE_URL, YELLOW_CHAIN_ID } from './constants'

export { YELLOW_CLEARNODE_URL }
export { NitroliteClient, WalletStateSigner }
export type { NitroliteClientConfig, MessageSigner }

type NitroliteWalletClient = NitroliteClientConfig['walletClient']

// ─── Clearnode Config ───────────────────────────────────────────────────

export interface ClearnodeConfig {
  brokerAddress: Address
  networks: Array<{
    chainId: number
    name: string
    custodyAddress: Address
    adjudicatorAddress: Address
  }>
}

let cachedConfig: ClearnodeConfig | null = null

// ─── WebSocket Router ───────────────────────────────────────────────────

type PendingRequest = {
  resolve: (response: RPCResponse) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
}

type ServerPushHandler = (response: RPCResponse) => void

/**
 * Multiplexed WebSocket message router.
 * Routes responses by requestId for request/response pairs.
 * Delegates server-initiated pushes (no matching requestId) to a push handler.
 */
export class WebSocketRouter {
  private ws: WebSocket
  private pending = new Map<number, PendingRequest>()
  private pushHandler: ServerPushHandler | null = null
  private defaultTimeout: number

  constructor(ws: WebSocket, opts?: { defaultTimeout?: number }) {
    this.ws = ws
    this.defaultTimeout = opts?.defaultTimeout ?? 30_000

    this.ws.addEventListener('message', this.onMessage)
    this.ws.addEventListener('close', this.onClose)
  }

  private onMessage = (event: MessageEvent) => {
    const raw = typeof event.data === 'string' ? event.data : String(event.data)

    let parsed: RPCResponse
    try {
      parsed = parseAnyRPCResponse(raw)
    } catch {
      console.warn('[WsRouter] Failed to parse message:', raw.substring(0, 200))
      return
    }

    const reqId = parsed.requestId
    if (reqId !== undefined && this.pending.has(reqId)) {
      const { resolve, timer } = this.pending.get(reqId)!
      clearTimeout(timer)
      this.pending.delete(reqId)
      resolve(parsed)
      return
    }

    // Server-initiated push (balance updates, channel updates, pings, etc.)
    if (this.pushHandler) {
      this.pushHandler(parsed)
    } else {
      console.log('[WsRouter] Unhandled push:', parsed.method ?? 'unknown')
    }
  }

  private onClose = () => {
    for (const [, { reject, timer }] of this.pending) {
      clearTimeout(timer)
      reject(new Error('WebSocket closed'))
    }
    this.pending.clear()
  }

  /** Send a pre-serialized RPC message and wait for the matching response. */
  send(message: string, requestId: number, timeout?: number): Promise<RPCResponse> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId)
        reject(new Error(`RPC timeout (id=${requestId})`))
      }, timeout ?? this.defaultTimeout)

      this.pending.set(requestId, { resolve, reject, timer })
      this.ws.send(message)
    })
  }

  /** Fire-and-forget send (no response tracking). */
  sendNoWait(message: string): void {
    this.ws.send(message)
  }

  onPush(handler: ServerPushHandler): void {
    this.pushHandler = handler
  }

  get socket(): WebSocket {
    return this.ws
  }

  get isOpen(): boolean {
    return this.ws.readyState === WebSocket.OPEN
  }

  dispose(): void {
    this.ws.removeEventListener('message', this.onMessage)
    this.ws.removeEventListener('close', this.onClose)
    for (const [, { timer }] of this.pending) clearTimeout(timer)
    this.pending.clear()
    this.ws.close()
  }
}

// ─── Auth + Connection ──────────────────────────────────────────────────

/**
 * Create a MessageSigner from a WalletClient for RPC message signing.
 * This is used by createAppSessionMessage, createSubmitAppStateMessage, etc.
 */
export function createMessageSigner(walletClient: WalletClient<Transport, Chain, Account>): MessageSigner {
  return createEIP712AuthMessageSigner(
    walletClient as unknown as Parameters<typeof createEIP712AuthMessageSigner>[0],
    {
      scope: 'app',
      session_key: walletClient.account.address,
      expires_at: BigInt(Math.floor(Date.now() / 1000) + 86400),
      allowances: [],
    },
    { name: 'Agentropolis' }
  )
}

/**
 * Fetch Clearnode config using the SDK's get_config RPC.
 * Uses a temporary WebSocket since we don't have an auth'd connection yet.
 */
export async function getClearnodeConfig(): Promise<ClearnodeConfig> {
  if (cachedConfig) return cachedConfig

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(YELLOW_CLEARNODE_URL)
    const timeout = setTimeout(() => {
      ws.close()
      reject(new Error('Clearnode config fetch timeout'))
    }, 10000)

    ws.onopen = () => {
      // get_config is unauthenticated — use V2 (no signer needed)
      const msg = createGetConfigMessageV2()
      ws.send(msg)
    }

    ws.onmessage = (event) => {
      clearTimeout(timeout)
      try {
        const response = parseGetConfigResponse(event.data as string)

        if (!response.params?.brokerAddress) {
          ws.close()
          reject(new Error('Invalid config response: missing brokerAddress'))
          return
        }

        cachedConfig = {
          brokerAddress: response.params.brokerAddress,
          networks: (response.params.networks || []).map(n => ({
            chainId: n.chainId,
            name: n.name,
            custodyAddress: n.custodyAddress,
            adjudicatorAddress: n.adjudicatorAddress,
          }))
        }

        console.log('[Yellow] Clearnode config:', cachedConfig)
        ws.close()
        resolve(cachedConfig)
      } catch (e) {
        ws.close()
        reject(e)
      }
    }

    ws.onerror = (err) => {
      clearTimeout(timeout)
      console.error('[Yellow] Config fetch error:', err)
      reject(err)
    }
  })
}

/**
 * Open a WebSocket to the Clearnode, perform auth handshake, and return
 * an authenticated { router, messageSigner, brokerAddress }.
 *
 * Auth flow:
 *   1. Connect WebSocket
 *   2. Send auth_request → receive auth_challenge
 *   3. Sign challenge → send auth_verify → receive auth_verify (success)
 *   4. Return authenticated router
 */
export async function connectAndAuth(
  walletClient: WalletClient<Transport, Chain, Account>,
): Promise<{
  router: WebSocketRouter
  messageSigner: MessageSigner
  brokerAddress: Address
}> {
  const config = await getClearnodeConfig()
  const userAddress = walletClient.account.address
  const brokerAddress = config.brokerAddress

  const ws = await new Promise<WebSocket>((resolve, reject) => {
    const socket = new WebSocket(YELLOW_CLEARNODE_URL)
    const timer = setTimeout(() => {
      socket.close()
      reject(new Error('WebSocket connection timeout'))
    }, 10_000)
    socket.onopen = () => { clearTimeout(timer); resolve(socket) }
    socket.onerror = (e) => { clearTimeout(timer); reject(e) }
  })

  const router = new WebSocketRouter(ws)
  const messageSigner = createMessageSigner(walletClient)

  // Step 1: Send auth_request
  const authReqId = generateRequestId()
  const authRequestMsg = await createAuthRequestMessage(
    {
      address: userAddress,
      session_key: userAddress,
      application: 'Agentropolis',
      allowances: [],
      expires_at: BigInt(Math.floor(Date.now() / 1000) + 86400),
      scope: 'app',
    },
    authReqId,
  )

  console.log('[Yellow] Sending auth_request...')
  const challengeResponse = await router.send(authRequestMsg, authReqId, 10_000)

  if (challengeResponse.method !== RPCMethod.AuthChallenge) {
    router.dispose()
    throw new Error(`Expected auth_challenge, got ${challengeResponse.method}`)
  }

  const challenge = challengeResponse as AuthChallengeResponse

  // Step 2: Sign and send auth_verify
  const authVerifyId = generateRequestId()
  const authVerifyMsg = await createAuthVerifyMessage(
    messageSigner,
    challenge,
    authVerifyId,
  )

  console.log('[Yellow] Sending auth_verify...')
  const verifyResponse = await router.send(authVerifyMsg, authVerifyId, 10_000)

  if (verifyResponse.method === RPCMethod.Error) {
    router.dispose()
    const errorParams = verifyResponse as unknown as { params?: { error?: string } }
    throw new Error(`Auth failed: ${errorParams.params?.error ?? 'unknown'}`)
  }

  if (verifyResponse.method !== RPCMethod.AuthVerify) {
    router.dispose()
    throw new Error(`Expected auth_verify response, got ${verifyResponse.method}`)
  }

  console.log('[Yellow] Authenticated with clearnode as', userAddress)

  // Handle server-initiated pings
  router.onPush((msg) => {
    if (msg.method === RPCMethod.Ping) {
      const pongData = JSON.stringify({
        res: [msg.requestId ?? 0, 'pong', {}, Math.floor(Date.now() / 1000)],
        sig: [],
      })
      router.sendNoWait(pongData)
    }
  })

  return { router, messageSigner, brokerAddress }
}

export async function createNitroliteClient(
  publicClient: PublicClient,
  walletClient: WalletClient<Transport, Chain, Account>
): Promise<NitroliteClient | null> {
  if (!walletClient.account) {
    console.warn('[Yellow] No account connected')
    return null
  }

  try {
    const config = await getClearnodeConfig()
    const networkConfig = config.networks.find(n => n.chainId === YELLOW_CHAIN_ID)
    
    const typedWalletClient = walletClient as unknown as NitroliteWalletClient
    const stateSigner = new WalletStateSigner(typedWalletClient)

    const client = new NitroliteClient({
      publicClient,
      walletClient: typedWalletClient,
      stateSigner,
      addresses: {
        custody: networkConfig?.custodyAddress || YELLOW_CONTRACTS.CUSTODY,
        adjudicator: networkConfig?.adjudicatorAddress || YELLOW_CONTRACTS.ADJUDICATOR,
      },
      chainId: YELLOW_CHAIN_ID,
      challengeDuration: BigInt(86400),
    })

    console.log('[Yellow] NitroliteClient created with broker:', config.brokerAddress)
    return client
  } catch (err) {
    console.error('[Yellow] Failed to create client:', err)
    const typedWalletClient = walletClient as unknown as NitroliteWalletClient
    const stateSigner = new WalletStateSigner(typedWalletClient)

    return new NitroliteClient({
      publicClient,
      walletClient: typedWalletClient,
      stateSigner,
      addresses: {
        custody: YELLOW_CONTRACTS.CUSTODY,
        adjudicator: YELLOW_CONTRACTS.ADJUDICATOR,
      },
      chainId: YELLOW_CHAIN_ID,
      challengeDuration: BigInt(86400),
    })
  }
}

/** @deprecated Use connectAndAuth() instead. Kept for backward compatibility. */
export function connectToClearnode(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(YELLOW_CLEARNODE_URL)

    ws.onopen = () => {
      console.log('[Yellow] Connected to clearnode')
      resolve(ws)
    }

    ws.onerror = (err) => {
      console.error('[Yellow] Connection error:', err)
      reject(err)
    }
  })
}

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_YELLOW_MOCK === 'true'
}
