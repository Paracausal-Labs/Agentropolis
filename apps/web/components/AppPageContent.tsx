'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ConnectButton } from '@/components/ConnectButton'
import { SessionStatus } from '@/components/SessionProvider'
import { SwapHandler } from '@/components/SwapHandler'
import { GuestMode } from '@/components/GuestMode'
import { useGame } from '@/contexts/GameContext'

// Dynamically import 3D components (client-side only)
const CityView3D = dynamic(() => import('./game/CityView3D'), { ssr: false })
const CouncilRoom3D = dynamic(() => import('./game/CouncilRoom3D'), { ssr: false })

type GameScene = 'city' | 'council'

export function AppPageContent() {
  const { state } = useGame()
  const [currentScene, setCurrentScene] = useState<GameScene>('city')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleSceneChange = (scene: GameScene) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentScene(scene)
      setIsTransitioning(false)
    }, 400)
  }

  return (
    <div className="w-full h-screen bg-[#050510] relative overflow-hidden font-[Rajdhani]">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(252,238,10,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(252,238,10,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      {/* Top Header Bar - CYBER HEADER */}
      <header className="absolute top-0 left-0 right-0 z-50 pointer-events-none p-4">
        <div className="pointer-events-auto flex justify-between items-start">

          {/* Left Module - Title */}
          <div className="cyber-panel px-6 py-3 clip-corner-tr flex items-center gap-4">
            <div className="text-3xl filter drop-shadow-[0_0_5px_rgba(252,238,10,0.8)]">🏙️</div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-none flex items-center gap-2">
                AGENTROPOLIS <span className="text-[#FCEE0A] text-xs align-top border border-[#FCEE0A] px-1">BETA</span>
              </h1>
              <div className="flex gap-2 text-[10px] text-[#00F0FF] font-mono mt-1">
                <span>SYS: ONLINE</span>
                <span>{'//'}</span>
                <span>PING: 12ms</span>
              </div>
            </div>
          </div>

          {/* Right Module - Status */}
          <div className="flex gap-4 items-center">
            {/* Yellow Session Status */}
            <SessionStatus />
            
            {/* Live Status */}
            <div className="cyber-panel px-4 py-2 flex flex-col items-center justify-center min-w-[80px]">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-pulse shadow-[0_0_8px_#00FF00]"></div>
                <span className="text-[#00FF00] font-bold">LIVE</span>
              </div>
            </div>

            {/* Balance */}
            <div className="cyber-panel px-6 py-2 min-w-[140px]">
              <span className="text-[10px] text-[#FCEE0A] uppercase tracking-wider block mb-0.5">Wallet Balance</span>
              <span className="text-xl font-mono text-white tracking-wide">{state.ytestBalance.toFixed(3)} <span className="text-gray-500 text-sm">YES</span></span>
            </div>

            {/* Connect Button */}
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Scene Container with Transition */}
      <div className={`w-full h-full transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        {currentScene === 'city' && (
          <CityView3D onEnterCouncil={() => handleSceneChange('council')} />
        )}

        {currentScene === 'council' && (
          <CouncilRoom3D onBack={() => handleSceneChange('city')} />
        )}
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050510]/80 backdrop-blur-md z-40 pointer-events-none">
          <div className="text-center">
            <div className="text-[#FCEE0A] font-mono text-2xl uppercase tracking-[0.2em] mb-2 animate-pulse">
              {currentScene === 'city' ? 'ACCESSING COUNCIL CHAMBER...' : 'REROUTING TO CITY VIEW...'}
            </div>
            <div className="h-[2px] w-64 bg-[#FCEE0A]/20 mx-auto">
              <div className="h-full bg-[#FCEE0A] animate-[width_0.4s_ease-out_forwards]" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Scene Navigation - Tactical Switches */}
      <div className="absolute bottom-8 left-8 z-50 pointer-events-none">
        <div className="cyber-panel p-2 flex gap-4 pointer-events-auto clip-corner-all">
          <button
            onClick={() => handleSceneChange('city')}
            className={`
              px-6 py-3 font-bold uppercase tracking-wider transition-all duration-200 clip-corner-tr border
              ${currentScene === 'city'
                ? 'bg-[#FCEE0A] text-black border-[#FCEE0A] shadow-[0_0_15px_rgba(252,238,10,0.4)]'
                : 'bg-transparent text-gray-500 border-gray-700 hover:border-[#FCEE0A] hover:text-[#FCEE0A]'
              }
            `}
          >
            CITY_VIEW
          </button>
          <button
            onClick={() => handleSceneChange('council')}
            className={`
              px-6 py-3 font-bold uppercase tracking-wider transition-all duration-200 clip-corner-tr border
              ${currentScene === 'council'
                ? 'bg-[#FF00FF] text-white border-[#FF00FF] shadow-[0_0_15px_rgba(255,0,255,0.4)]'
                : 'bg-transparent text-gray-500 border-gray-700 hover:border-[#FF00FF] hover:text-[#FF00FF]'
              }
            `}
          >
            COUNCIL_CHAMBER
          </button>
        </div>
      </div>

      {/* Decorative HUD Elements */}
      <div className="absolute bottom-8 right-8 pointer-events-none hidden md:block opacity-50">
        <div className="text-right font-mono text-[10px] text-[#FCEE0A] leading-tight mb-2">
          COORDS: 45.92, -12.04, 88.2<br />
          GRID: ALPHA-7<br />
          WIND: 12km/h NE
        </div>
        <div className="w-32 h-32 border border-[#FCEE0A]/30 rounded-full relative flex items-center justify-center animate-[spin_10s_linear_infinite]">
          <div className="absolute top-0 bottom-0 w-[1px] bg-[#FCEE0A]/30"></div>
          <div className="absolute left-0 right-0 h-[1px] bg-[#FCEE0A]/30"></div>
          <div className="w-24 h-24 border border-[#FCEE0A]/20 rounded-full"></div>
        </div>
      </div>

      {/* Functional Components */}
      <SwapHandler />
      <GuestMode />
    </div>
  )
}
