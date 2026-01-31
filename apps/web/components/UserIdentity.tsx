'use client'

import { useAccount, useEnsName, useEnsAvatar } from 'wagmi'
import { mainnet } from 'viem/chains'

export function UserIdentity() {
  const { address, isConnected } = useAccount()
  
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  })
  
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: mainnet.id,
  })

  if (!isConnected || !address) {
    return null
  }

  const displayName = ensName || `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <div className="flex items-center gap-3">
      {ensAvatar ? (
        <img 
          src={ensAvatar} 
          alt={displayName}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
      )}
      <span className="text-sm font-medium text-gray-300">
        {displayName}
      </span>
    </div>
  )
}
