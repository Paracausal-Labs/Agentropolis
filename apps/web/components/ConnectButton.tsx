'use client'

import { useAccount, useConnect, useDisconnect, useSwitchChain, Connector } from 'wagmi'
import { baseSepolia } from 'viem/chains'
import { UserIdentity } from './UserIdentity'
import { showToast } from './ErrorToast'

export function ConnectButton() {
  const { isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  // CHAIN CONSTRAINT: Trading/Yellow = Base Sepolia, ENS writes = Ethereum Sepolia (separate flow)
  const isWrongChain = isConnected && chain?.id !== baseSepolia.id

  const handleConnect = (connector: Connector) => {
    connect(
      { connector },
      {
        onError: (err) => {
          if (err.message.includes('rejected')) {
            showToast('Connection cancelled by user', 'warning')
          } else {
            showToast('Failed to connect wallet', 'error')
          }
        },
      }
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        {isWrongChain && (
          <button
            onClick={() => switchChain({ chainId: baseSepolia.id })}
            className="px-3 py-1.5 bg-[#FCEE0A] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#FF00FF] hover:text-white transition-all"
          >
            Switch Chain
          </button>
        )}
        <UserIdentity />
        <button
          onClick={() => disconnect()}
          className="px-3 py-1.5 bg-[#FF3366]/20 text-[#FF3366] border border-[#FF3366]/50 text-xs font-bold uppercase tracking-wider hover:bg-[#FF3366] hover:text-white transition-all"
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
      className="px-4 py-2 bg-[#FCEE0A] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#FF00FF] hover:text-white transition-all disabled:opacity-50"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
