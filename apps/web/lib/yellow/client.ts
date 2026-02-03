import { NitroliteClient, WalletStateSigner } from '@erc7824/nitrolite'
import type { NitroliteClientConfig } from '@erc7824/nitrolite'
import type { PublicClient, WalletClient, Chain, Account, Transport } from 'viem'
import { YELLOW_CONTRACTS, YELLOW_CLEARNODE_URL, YELLOW_CHAIN_ID } from './constants'

export { YELLOW_CLEARNODE_URL }
export { NitroliteClient, WalletStateSigner }
export type { NitroliteClientConfig }

type NitroliteWalletClient = NitroliteClientConfig['walletClient']

export function createNitroliteClient(
  publicClient: PublicClient,
  walletClient: WalletClient<Transport, Chain, Account>
): NitroliteClient | null {
  if (!walletClient.account) {
    console.warn('[Yellow] No account connected')
    return null
  }

  const typedWalletClient = walletClient as unknown as NitroliteWalletClient
  const stateSigner = new WalletStateSigner(typedWalletClient)

  return new NitroliteClient({
    publicClient,
    walletClient: typedWalletClient,
    stateSigner,
    addresses: {
      custody: YELLOW_CONTRACTS.CUSTODY,
      adjudicator: YELLOW_CONTRACTS.CUSTODY,
    },
    chainId: YELLOW_CHAIN_ID,
    challengeDuration: BigInt(86400),
  })
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
  return (
    process.env.NEXT_PUBLIC_YELLOW_MOCK === 'true' ||
    typeof window === 'undefined'
  )
}
