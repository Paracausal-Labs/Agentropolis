import {
  NitroliteClient,
  WalletStateSigner,
  createAuthRequestMessage,
  createAuthVerifyMessage,
  parseAnyRPCResponse,
  generateRequestId,
  RPCMethod,
  createEIP712AuthMessageSigner,
  createECDSAMessageSigner,
} from '@erc7824/nitrolite'
import type {
  NitroliteClientConfig,
  MessageSigner,
  RPCResponse,
  AuthChallengeResponse,
  AssetsResponse,
} from '@erc7824/nitrolite'
import type { PublicClient, WalletClient, Chain, Account, Transport, Address, Hex } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { YELLOW_CONTRACTS, YELLOW_CLEARNODE_URL, YELLOW_CHAIN_ID, YELLOW_DEFAULTS } from './constants'

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

// Ephemeral session key for signing non-auth RPC messages (no wallet prompts)
let sessionPrivateKey: Hex | null = null

function getOrCreateSessionKey(): { privateKey: Hex; address: Address } {
  if (!sessionPrivateKey) {
    sessionPrivateKey = generatePrivateKey()
  }
  const account = privateKeyToAccount(sessionPrivateKey)
  return { privateKey: sessionPrivateKey, address: account.address }
}

export function createMessageSigner(_walletClient: WalletClient<Transport, Chain, Account>): MessageSigner {
  const { privateKey } = getOrCreateSessionKey()
  return createECDSAMessageSigner(privateKey)
}

/**
 * Fetch Clearnode config.
 * 
 * The sandbox clearnode (clearnet-sandbox.yellow.com) sends an `assets` welcome
 * message on connect instead of supporting `get_config`. We detect this and build
 * a ClearnodeConfig from the assets response + hardcoded contract addresses.
 * 
 * For production clearnodes, `get_config` may still work — we try to parse
 * whatever the first message is and handle both cases.
 */
export async function getClearnodeConfig(): Promise<ClearnodeConfig> {
  if (cachedConfig) return cachedConfig

  const isSandbox = YELLOW_CLEARNODE_URL.includes('sandbox')

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(YELLOW_CLEARNODE_URL)
    const timeout = setTimeout(() => {
      ws.close()
      reject(new Error('Clearnode config fetch timeout'))
    }, 10000)

    ws.onopen = () => {
      // Sandbox sends `assets` welcome automatically — no need to send anything.
      // For non-sandbox, we could send get_config, but for now we wait for
      // whatever the server sends first.
      console.log('[Yellow] Connected to clearnode, waiting for config/assets...')
    }

    ws.onmessage = (event) => {
      clearTimeout(timeout)
      try {
        const raw = typeof event.data === 'string' ? event.data : String(event.data)
        const response = parseAnyRPCResponse(raw)

        if (response.method === RPCMethod.Assets || response.method === RPCMethod.GetAssets) {
          // Sandbox: build config from assets welcome message
          const assetsResp = response as AssetsResponse
          const assets = assetsResp.params?.assets || []
          
          console.log('[Yellow] Received assets welcome:', assets.length, 'assets')

          // Extract chain info from assets — use the first asset's chainId
          const chainIds = [...new Set(assets.map(a => a.chainId))]

          cachedConfig = {
            // Sandbox doesn't provide a broker address in the assets message.
            // The broker is the clearnode itself — its address will be provided
            // in the auth_challenge flow. Use a placeholder for now.
            brokerAddress: YELLOW_CONTRACTS.CUSTODY as Address,
            networks: chainIds.map(chainId => ({
              chainId,
              name: chainId === YELLOW_CHAIN_ID ? 'Base Sepolia' : `Chain ${chainId}`,
              custodyAddress: YELLOW_CONTRACTS.CUSTODY,
              adjudicatorAddress: YELLOW_CONTRACTS.ADJUDICATOR,
            }))
          }

          console.log('[Yellow] Clearnode config (from assets):', cachedConfig)
          ws.close()
          resolve(cachedConfig)
        } else if (response.method === RPCMethod.GetConfig) {
          // Production clearnode: standard get_config response
          const configResp = response as { params: { brokerAddress: Address; networks: Array<{ chainId: number; name: string; custodyAddress: Address; adjudicatorAddress: Address }> } }

          if (!configResp.params?.brokerAddress) {
            ws.close()
            reject(new Error('Invalid config response: missing brokerAddress'))
            return
          }

          cachedConfig = {
            brokerAddress: configResp.params.brokerAddress,
            networks: (configResp.params.networks || []).map(n => ({
              chainId: n.chainId,
              name: n.name,
              custodyAddress: n.custodyAddress,
              adjudicatorAddress: n.adjudicatorAddress,
            }))
          }

          console.log('[Yellow] Clearnode config (from get_config):', cachedConfig)
          ws.close()
          resolve(cachedConfig)
        } else {
          // Unknown first message — if sandbox, use defaults
          console.warn('[Yellow] Unexpected first message:', response.method)
          if (isSandbox) {
            cachedConfig = {
              brokerAddress: YELLOW_CONTRACTS.CUSTODY as Address,
              networks: [{
                chainId: YELLOW_CHAIN_ID,
                name: 'Base Sepolia',
                custodyAddress: YELLOW_CONTRACTS.CUSTODY,
                adjudicatorAddress: YELLOW_CONTRACTS.ADJUDICATOR,
              }]
            }
            console.log('[Yellow] Using sandbox defaults:', cachedConfig)
            ws.close()
            resolve(cachedConfig)
          } else {
            ws.close()
            reject(new Error(`Unexpected clearnode response: ${response.method}`))
          }
        }
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

  const earlyMessages: MessageEvent[] = []
  let routerReady = false

  const ws = await new Promise<WebSocket>((resolve, reject) => {
    const socket = new WebSocket(YELLOW_CLEARNODE_URL)
    const timer = setTimeout(() => {
      socket.close()
      reject(new Error('WebSocket connection timeout'))
    }, 10_000)

    // Buffer any messages that arrive before the router takes over
    socket.onmessage = (event) => {
      if (!routerReady) {
        earlyMessages.push(event)
      }
    }

    socket.onopen = () => { clearTimeout(timer); resolve(socket) }
    socket.onerror = (e) => { clearTimeout(timer); reject(e) }
  })

  const router = new WebSocketRouter(ws)

  // Handle server-initiated pushes (assets welcome, pings, balance updates)
  router.onPush((msg) => {
    if (msg.method === RPCMethod.Ping) {
      const pongData = JSON.stringify({
        res: [msg.requestId ?? 0, 'pong', {}, Math.floor(Date.now() / 1000)],
        sig: [],
      })
      router.sendNoWait(pongData)
    } else if (msg.method === RPCMethod.Assets) {
      console.log('[Yellow] Received assets push (welcome)')
    } else {
      console.log('[Yellow] Server push:', msg.method)
    }
  })

  routerReady = true
  ws.onmessage = null

  for (const event of earlyMessages) {
    ws.dispatchEvent(new MessageEvent('message', { data: event.data }))
  }

  const sessionKey = getOrCreateSessionKey()
  const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 86400)
  const allowances = [
    { asset: 'ytest.usd', amount: YELLOW_DEFAULTS.DEPOSIT_AMOUNT.toString() },
  ]

  const authSigner = createEIP712AuthMessageSigner(
    walletClient as unknown as Parameters<typeof createEIP712AuthMessageSigner>[0],
    {
      scope: 'app',
      session_key: sessionKey.address,
      expires_at: expiresAt,
      allowances,
    },
    { name: 'Agentropolis' }
  )
  const messageSigner = createMessageSigner(walletClient)

  await new Promise(r => setTimeout(r, 200))

  const authReqId = generateRequestId()
  const authRequestMsg = await createAuthRequestMessage(
    {
      address: userAddress,
      session_key: sessionKey.address,
      application: 'Agentropolis',
      allowances,
      expires_at: expiresAt,
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

  const authVerifyId = generateRequestId()
  const authVerifyMsg = await createAuthVerifyMessage(
    authSigner,
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
