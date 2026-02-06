import { NitroliteClient, WalletStateSigner } from '@erc7824/nitrolite'
import type { NitroliteClientConfig } from '@erc7824/nitrolite'
import type { PublicClient, WalletClient, Chain, Account, Transport, Address } from 'viem'
import { YELLOW_CONTRACTS, YELLOW_CLEARNODE_URL, YELLOW_CHAIN_ID } from './constants'

export { YELLOW_CLEARNODE_URL }
export { NitroliteClient, WalletStateSigner }
export type { NitroliteClientConfig }

type NitroliteWalletClient = NitroliteClientConfig['walletClient']

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

export async function getClearnodeConfig(): Promise<ClearnodeConfig> {
  if (cachedConfig) return cachedConfig

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(YELLOW_CLEARNODE_URL)
    const timeout = setTimeout(() => {
      ws.close()
      reject(new Error('Clearnode config fetch timeout'))
    }, 10000)

    ws.onopen = () => {
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'get_config',
        params: {}
      }
      ws.send(JSON.stringify(request))
    }

    ws.onmessage = (event) => {
      clearTimeout(timeout)
      try {
        const response = JSON.parse(event.data)
        if (response.error) {
          ws.close()
          reject(new Error(response.error.message || 'Config fetch failed'))
          return
        }

        const result = response.result || response
        cachedConfig = {
          brokerAddress: result.broker_address as Address,
          networks: (result.networks || []).map((n: { chain_id: number; name: string; custody_address: string; adjudicator_address: string }) => ({
            chainId: n.chain_id,
            name: n.name,
            custodyAddress: n.custody_address as Address,
            adjudicatorAddress: n.adjudicator_address as Address,
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
