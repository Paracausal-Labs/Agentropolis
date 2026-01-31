'use client'

import { useAccount, useConnect, useDisconnect, useSwitchChain, Connector } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'

export function ConnectButton() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const isWrongChain = isConnected && chain?.id !== baseSepolia.id
  
  const handleConnect = (connector: Connector) => {
    connect({ connector })
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        {isWrongChain && (
          <button
            onClick={() => switchChain({ chainId: baseSepolia.id })}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Switch to Base Sepolia
          </button>
        )}
        <span className="text-sm text-gray-400">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  const injectedConnector = connectors.find(c => c.id === 'injected')

  return (
    <button
      onClick={() => injectedConnector && handleConnect(injectedConnector)}
      disabled={isPending || !injectedConnector}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 font-semibold"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
