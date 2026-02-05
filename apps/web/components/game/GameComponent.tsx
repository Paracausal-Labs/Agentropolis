'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import Phaser from 'phaser'
import { CityScene } from './scenes/CityScene'
import { CouncilScene } from './scenes/CouncilScene'
import { useSession } from '@/components/SessionProvider'
import { formatYtestUsd, YELLOW_DEFAULTS } from '@/lib/yellow/constants'
import type { TokenLaunchProposal } from '@agentropolis/shared'

declare global {
  interface Window {
    agentropolis?: {
      chargeAgentDeploy: () => Promise<{ success: boolean; error?: string }>
      getBalance: () => string
      isSessionActive: () => boolean
    }
  }
}

interface TokenLaunchResult {
  status: 'idle' | 'pending' | 'success' | 'error'
  txHash?: string
  tokenAddress?: string
  error?: string
}

export default function GameComponent() {
  const gameRef = useRef<Phaser.Game | null>(null)
  const { state, chargeAgentDeploy } = useSession()
  const [tokenLaunch, setTokenLaunch] = useState<TokenLaunchResult>({ status: 'idle' })

  const handleChargeAgentDeploy = useCallback(async () => {
    if (state.status !== 'active') {
      return { success: false, error: 'Session not active. Start a Yellow session first.' }
    }

    const result = await chargeAgentDeploy()
    
    if (!result.success) {
      console.log('[GameComponent] Agent deploy charge failed:', result.error)
      return { success: false, error: result.error }
    }

    console.log(`[GameComponent] Agent deploy charged: ${formatYtestUsd(YELLOW_DEFAULTS.AGENT_DEPLOY_COST)} ytest.USD`)
    return { success: true }
  }, [state.status, chargeAgentDeploy])

  const handleTokenLaunch = useCallback(async (proposal: TokenLaunchProposal) => {
    console.log('[GameComponent] Token launch approved:', proposal.tokenSymbol)
    setTokenLaunch({ status: 'pending' })

    try {
      const response = await fetch('/api/agents/launch-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Token launch failed')
      }

      setTokenLaunch({
        status: 'success',
        txHash: data.result?.txHash,
        tokenAddress: data.result?.tokenAddress,
      })
      console.log('[GameComponent] Token launch successful:', data.result)
    } catch (err) {
      console.error('[GameComponent] Token launch error:', err)
      setTokenLaunch({ status: 'error', error: String(err) })
    }

    setTimeout(() => setTokenLaunch({ status: 'idle' }), 8000)
  }, [])

  useEffect(() => {
    window.agentropolis = {
      chargeAgentDeploy: handleChargeAgentDeploy,
      getBalance: () => state.balance,
      isSessionActive: () => state.status === 'active',
    }

    return () => {
      delete window.agentropolis
    }
  }, [handleChargeAgentDeploy, state.balance, state.status])

  useEffect(() => {
    if (gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'game-container',
      scene: [CityScene, CouncilScene],
      backgroundColor: '#1a1a2e',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    }

    gameRef.current = new Phaser.Game(config)
    
    gameRef.current.events.on('openCouncil', (agents?: Array<{ id: string; name: string }>) => {
      gameRef.current?.scene.start('CouncilScene', { agents: agents ?? [] })
    })

    gameRef.current.events.on('tokenLaunchApproved', handleTokenLaunch)

    return () => {
      if (gameRef.current) {
        gameRef.current.events.off('tokenLaunchApproved', handleTokenLaunch)
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [handleTokenLaunch])

  return (
    <>
      <div id="game-container" className="w-full h-screen" />
      {tokenLaunch.status !== 'idle' && (
        <div className="fixed bottom-4 left-4 z-50 bg-gray-800 rounded-lg p-4 shadow-xl max-w-sm">
          {tokenLaunch.status === 'pending' && (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-purple-500">Launching token...</span>
            </div>
          )}
          {tokenLaunch.status === 'success' && (
            <div className="text-green-500">
              <div className="font-bold">Token Launched!</div>
              {tokenLaunch.tokenAddress && (
                <div className="text-sm truncate">Address: {tokenLaunch.tokenAddress}</div>
              )}
              {tokenLaunch.txHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${tokenLaunch.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline hover:text-green-400"
                >
                  View on BaseScan →
                </a>
              )}
            </div>
          )}
          {tokenLaunch.status === 'error' && (
            <div className="text-red-500">
              <div className="font-bold">Launch Failed</div>
              <div className="text-sm">{tokenLaunch.error}</div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
