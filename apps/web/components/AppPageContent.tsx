'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ConnectButton } from '@/components/ConnectButton'
import { SessionStatus } from '@/components/SessionProvider'
import { SwapHandler } from '@/components/SwapHandler'
import { GuestMode, GuestModeTimer } from '@/components/GuestMode'
import { useGame } from '@/contexts/GameContext'

// Dynamically import 3D components (client-side only)
const CityView3D = dynamic(() => import('./game/CityView3D'), { ssr: false })
const CouncilRoom3D = dynamic(() => import('./game/CouncilRoom3D'), { ssr: false })
const TownHall3D = dynamic(() => import('./game/TownHall3D'), { ssr: false })
const Marketplace3D = dynamic(() => import('./game/Marketplace3D'), { ssr: false })
const BattleArena3D = dynamic(() => import('./game/BattleArena3D'), { ssr: false })
const Leaderboard3D = dynamic(() => import('./game/Leaderboard3D'), { ssr: false })

type GameScene = 'city' | 'council' | 'townhall' | 'marketplace' | 'battle' | 'leaderboard'

export function AppPageContent() {
  const [currentScene, setCurrentScene] = useState<GameScene>('city')
  const { state, actions } = useGame()
  const league = actions.getLeague()

  const renderScene = () => {
    switch (currentScene) {
      case 'council':
        return <CouncilRoom3D onBack={() => setCurrentScene('city')} />
      case 'townhall':
        return (
          <TownHall3D
            onBack={() => setCurrentScene('city')}
            onGoToMarketplace={() => setCurrentScene('marketplace')}
            onGoToBattle={() => setCurrentScene('battle')}
            onGoToLeaderboard={() => setCurrentScene('leaderboard')}
          />
        )
      case 'marketplace':
        return <Marketplace3D onBack={() => setCurrentScene('townhall')} />
      case 'battle':
        return <BattleArena3D onBack={() => setCurrentScene('townhall')} />
      case 'leaderboard':
        return <Leaderboard3D onBack={() => setCurrentScene('townhall')} />
      case 'city':
      default:
        return (
          <CityView3D
            onEnterCouncil={() => setCurrentScene('council')}
            onEnterTownHall={() => setCurrentScene('townhall')}
            onEnterBattle={() => setCurrentScene('battle')}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-[Rajdhani] relative overflow-hidden">
      {/* Header - Only shows on non-city scenes or as a minimal top bar */}
      <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-2 pointer-events-none">
        {/* Left: Logo + Stats (only visible in city) */}
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
              <div className="text-xs flex items-center gap-1">
                <span>{league.icon}</span>
                <span className="text-[#FFD700]">{state.trophies}</span>
              </div>
            </>
          )}
        </div>

        {/* Center: Currency Display */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="cyber-panel px-3 py-1.5 bg-black/70 flex items-center gap-2 text-sm">
            <span className="text-[#FFD700]">🪙</span>
            <span className="font-bold">{state.gold.toLocaleString()}</span>
          </div>
          <div className="cyber-panel px-3 py-1.5 bg-black/70 flex items-center gap-2 text-sm">
            <span className="text-[#00F5FF]">💎</span>
            <span className="font-bold">{state.gems}</span>
          </div>
          <div className="cyber-panel px-3 py-1.5 bg-black/70 flex items-center gap-2 text-sm">
            <span className="text-[#00FF88] text-xs">$YTEST</span>
            <span className="font-bold">{state.ytestBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Right: Connect Button */}
        <div className="pointer-events-auto">
          <ConnectButton />
        </div>
      </header>

      {/* Quick Nav & Status Panel (Left Side) */}
      {currentScene === 'city' && (
        <div className="absolute top-14 left-4 z-40 flex flex-col gap-3">
          {/* Navigation Buttons */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setCurrentScene('townhall')}
              className="w-36 py-2 text-left px-3 bg-black/80 border border-[#FCEE0A]/40 text-[#FCEE0A] hover:bg-[#FCEE0A] hover:text-black font-bold uppercase text-xs tracking-wider transition-all"
            >
              🏛️ Town Hall
            </button>
            <button
              onClick={() => setCurrentScene('marketplace')}
              className="w-36 py-2 text-left px-3 bg-black/80 border border-[#FCEE0A]/40 text-[#FCEE0A] hover:bg-[#FCEE0A] hover:text-black font-bold uppercase text-xs tracking-wider transition-all"
            >
              🛒 Marketplace
            </button>
            <button
              onClick={() => setCurrentScene('battle')}
              className="w-36 py-2 text-left px-3 bg-black/80 border border-[#FF3366]/40 text-[#FF3366] hover:bg-[#FF3366] hover:text-white font-bold uppercase text-xs tracking-wider transition-all"
            >
              ⚔️ Battle
            </button>
            <button
              onClick={() => setCurrentScene('leaderboard')}
              className="w-36 py-2 text-left px-3 bg-black/80 border border-[#FFD700]/40 text-[#FFD700] hover:bg-[#FFD700] hover:text-black font-bold uppercase text-xs tracking-wider transition-all"
            >
              🏆 Leaderboard
            </button>
          </div>

          {/* Status Panel */}
          <div className="w-44 bg-black/90 border border-gray-700/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Session</span>
              <GuestModeTimer />
            </div>
            <SessionStatus />
          </div>
        </div>
      )}

      {/* Main Scene */}
      <main className="h-screen w-full">
        {renderScene()}
      </main>

      {/* Swap Handler (only in city) */}
      {currentScene === 'city' && <SwapHandler />}

      {/* Guest Mode Modal (only shows when expired) */}
      <GuestMode />
    </div>
  )
}
