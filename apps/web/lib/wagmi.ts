import { http } from 'viem'
import { createConfig } from '@wagmi/core'
import { baseSepolia, mainnet } from 'viem/chains'
import { injected } from '@wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia, mainnet],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
