'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ConnectButton } from '@/components/ConnectButton'
import { SessionStatus } from '@/components/SessionProvider'
import { SwapHandler } from '@/components/SwapHandler'
import { GuestMode, GuestModeTimer } from '@/components/GuestMode'
import { useGame } from '@/contexts/GameContext'

const CityView3D = dynamic(() => import('./game/CityView3D'), { ssr: false })
const CouncilRoom3D = dynamic(() => import('./game/CouncilRoom3D'), { ssr: false })

type GameScene = 'city' | 'council'

export function AppPageContent() {
  const [currentScene, setCurrentScene] = useState<GameScene>('city')
  const { state } = useGame()
  const [mounted, setMounted] = useState(false)
  const [transitionState, setTransitionState] = useState<'idle' | 'active' | 'finishing'>('idle')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSceneSwitch = (target: GameScene) => {
    if (transitionState !== 'idle') return
    setTransitionState('active') // Start fade in

    // Wait for fade to black (500ms)
    setTimeout(() => {
      setCurrentScene(target)
      // Short delay to ensure render
      setTimeout(() => {
        setTransitionState('finishing') // Start fade out
        setTimeout(() => setTransitionState('idle'), 500) // Cleanup
      }, 100)
    }, 500)
  }

  const renderScene = () => {
    switch (currentScene) {
      case 'council':
        return <CouncilRoom3D onBack={() => handleSceneSwitch('city')} />
      case 'city':
      default:
        return (
          <CityView3D
            onEnterCouncil={() => handleSceneSwitch('council')}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-[Rajdhani] relative overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-2 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <h1 className="text-xl font-black tracking-widest text-[#FCEE0A] leading-none">
            AGENTROPOLIS
          </h1>
          {currentScene === 'city' && (
            <>
              <div className="h-6 w-px bg-[#FCEE0A]/30" />
              <div className="text-xs flex items-center gap-1">
                <span className="text-gray-500">LVL</span>
                <span className="text-[#FCEE0A] font-bold">{state.level}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="cyber-panel px-3 py-1.5 bg-black/70 flex items-center gap-2 text-sm">
            <span className="text-[#00FF88] text-xs">$YTEST</span>
            <span className="font-bold" suppressHydrationWarning>{state.ytestBalance.toFixed(2)}</span>
          </div>
        </div>

        <div className="pointer-events-auto">
          {mounted && <ConnectButton />}
        </div>
      </header>

      {currentScene === 'city' && (
        <div className="absolute top-14 left-4 z-40 flex flex-col gap-3">
          <div className="w-44 bg-black/90 border border-gray-700/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Session</span>
              <GuestModeTimer />
            </div>
            <SessionStatus />
          </div>
        </div>
      )}

      <main className="h-screen w-full">
        {renderScene()}
      </main>

      <SwapHandler />
      <GuestMode />
      <TransitionOverlay state={transitionState} />
    </div>
  )
}

function TransitionOverlay({ state }: { state: 'idle' | 'active' | 'finishing' }) {
  if (state === 'idle') return null

  return (
    <div
      className={`
                fixed inset-0 z-[99999999] bg-black pointer-events-none flex items-center justify-center
                transition-opacity duration-500
                ${state === 'active' ? 'opacity-100' : 'opacity-0'}
            `}
    >
      <div className="text-center">
        <div className="text-[#00F0FF] text-2xl font-black tracking-[0.5em] animate-pulse">
          NEURAL_LINK_ESTABLISHED
        </div>
        <div className="w-64 h-1 bg-[#FCEE0A]/30 mx-auto mt-4 overflow-hidden">
          <div className="h-full bg-[#FCEE0A] w-full animate-[shimmer_1s_infinite]" />
        </div>
      </div>
    </div>
  )
}
