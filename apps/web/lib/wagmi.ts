import { http } from 'viem'
import { createConfig } from '@wagmi/core'
import { baseSepolia, mainnet, sepolia } from 'viem/chains'
import { injected } from '@wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia, sepolia, mainnet],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || undefined),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
