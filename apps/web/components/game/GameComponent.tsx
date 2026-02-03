'use client'

import { useEffect, useRef, useCallback } from 'react'
import Phaser from 'phaser'
import { CityScene } from './scenes/CityScene'
import { CouncilScene } from './scenes/CouncilScene'
import { useSession } from '@/components/SessionProvider'
import { formatYtestUsd, YELLOW_DEFAULTS } from '@/lib/yellow/constants'

declare global {
  interface Window {
    agentropolis?: {
      chargeAgentDeploy: () => Promise<{ success: boolean; error?: string }>
      getBalance: () => string
      isSessionActive: () => boolean
    }
  }
}

export default function GameComponent() {
  const gameRef = useRef<Phaser.Game | null>(null)
  const { state, chargeAgentDeploy } = useSession()

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
    
    gameRef.current.events.on('openCouncil', () => {
      gameRef.current?.scene.start('CouncilScene', { agents: [] })
    })

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return <div id="game-container" className="w-full h-screen" />
}
