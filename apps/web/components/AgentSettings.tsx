'use client'

import { useState, useEffect } from 'react'
import { useAccount, useEnsName, useWalletClient } from 'wagmi'
import { sepolia } from 'viem/chains'
import { writeAgentConfig, useAgentConfig } from '@/lib/ens/textRecords'

interface AgentSettingsProps {
  isOpen: boolean
  onClose: () => void
}

function SettingsModal({ isOpen, onClose }: AgentSettingsProps) {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { data: ensName } = useEnsName({ address, chainId: sepolia.id })
  const { config, isLoading: configLoading } = useAgentConfig(ensName)

  const [endpoint, setEndpoint] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (config?.agentEndpoint) {
      setEndpoint(config.agentEndpoint)
      // Sync ENS endpoint to localStorage for CouncilScene direct read
      localStorage.setItem('agentEndpoint', config.agentEndpoint)
    }
  }, [config?.agentEndpoint])

  const handleSave = async () => {
    if (!ensName || !walletClient) return

    if (walletClient.chain?.id !== sepolia.id) {
      setErrorMessage('Switch wallet to Ethereum Sepolia to save')
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')
    setErrorMessage('')

    try {
      await writeAgentConfig(ensName, { agentEndpoint: endpoint || undefined }, walletClient)
      // Sync to localStorage so CouncilScene can read it immediately
      if (endpoint) {
        localStorage.setItem('agentEndpoint', endpoint)
      } else {
        localStorage.removeItem('agentEndpoint')
      }
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      console.error('[Settings] Failed to save:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save')
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = () => {
    setEndpoint('')
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative bg-gray-900 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Agent Settings</h2>

        {!isConnected ? (
          <p className="text-gray-400">Connect your wallet to configure agent settings.</p>
        ) : !ensName ? (
          <p className="text-gray-400">
            You need an ENS name on Sepolia to save settings.{' '}
            <a
              href="https://app.ens.domains"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Get one here
            </a>
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="endpoint" className="block text-sm font-medium text-gray-300 mb-2">
                External Agent Endpoint
              </label>
              <input
                id="endpoint"
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://your-agent.example.com/propose"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={configLoading}
              />
              <p className="mt-2 text-xs text-gray-500">
                Configure an external agent endpoint for BYOA (Bring Your Own Agent)
              </p>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3">
              <p className="text-xs text-yellow-300">
                <span className="font-semibold">Note:</span> External agents may charge a fee (~$0.01 USDC per
                proposal via x402 micropayments).
              </p>
            </div>

            {config?.agentEndpoint && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-400">
                  <span className="font-medium text-gray-300">Current:</span>{' '}
                  <span className="break-all">{config.agentEndpoint}</span>
                </p>
              </div>
            )}

            {saveStatus === 'error' && errorMessage && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
                <p className="text-xs text-red-300">{errorMessage}</p>
              </div>
            )}

            {saveStatus === 'success' && (
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3">
                <p className="text-xs text-green-300">Settings saved to ENS successfully!</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving || configLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save to ENS'}
              </button>
              <button
                onClick={handleClear}
                disabled={isSaving || !endpoint}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 font-medium rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function AgentSettingsButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { isConnected } = useAccount()

  if (!isConnected) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
        title="Agent Settings"
        aria-label="Agent Settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
