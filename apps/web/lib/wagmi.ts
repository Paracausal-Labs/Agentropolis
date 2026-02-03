import { http } from 'viem'
import { createConfig } from '@wagmi/core'
import { baseSepolia, mainnet, sepolia } from 'viem/chains'
import { injected } from '@wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia, sepolia, mainnet],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
