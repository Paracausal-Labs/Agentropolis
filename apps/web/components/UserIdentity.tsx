'use client'

import { useState, useEffect } from 'react'
import { useAccount, useEnsName, useEnsAvatar, useWalletClient } from 'wagmi'
import { sepolia } from 'viem/chains'
import { writeAgentConfig, getDefaultAgentConfig } from '@/lib/ens/textRecords'

export function UserIdentity() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const { data: ensName } = useEnsName({
    address,
    chainId: sepolia.id,
  })
  
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: sepolia.id,
  })

  const handleSaveToENS = async () => {
    if (!ensName || !walletClient) return
    if (walletClient.chain?.id !== sepolia.id) {
      console.warn('[ENS] Switch wallet to Ethereum Sepolia to save text records.')
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return
    }
    
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const config = getDefaultAgentConfig()
      const txHash = await writeAgentConfig(ensName, config, walletClient)
      console.log('[ENS] Config saved:', txHash)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      console.error('[ENS] Failed to save config:', err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  // Return null consistently on both server and client until mounted
  if (!mounted || !isConnected || !address) {
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
      {ensName && (
        <button
          onClick={handleSaveToENS}
          disabled={isSaving}
          className={`ml-2 px-2 py-1 text-xs rounded transition-colors ${
            saveStatus === 'success' 
              ? 'bg-green-600 text-white' 
              : saveStatus === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } disabled:opacity-50`}
        >
          {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Failed' : 'Save to ENS'}
        </button>
      )}
    </div>
  )
}
