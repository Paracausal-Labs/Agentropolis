'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { COLORS } from '@/lib/game-constants'

// Dynamically import 3D components (client-side only)
const CityView3D = dynamic(() => import('./game/CityView3D'), { ssr: false })
const CouncilRoom3D = dynamic(() => import('./game/CouncilRoom3D'), { ssr: false })

type GameScene = 'city' | 'council'

export function AppPageContent() {
  const [currentScene, setCurrentScene] = useState<GameScene>('city')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleSceneChange = (scene: GameScene) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentScene(scene)
      setIsTransitioning(false)
    }, 300)
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#0a0a1a] to-[#0f172a] relative overflow-hidden">
      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏙️</span>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Agentropolis
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-lg border border-gray-700/50">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-300">Session Active</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-lg border border-gray-700/50">
              <span className="text-sm text-gray-400">Balance:</span>
              <span className="text-sm font-mono text-cyan-400">0.95 ETH</span>
            </div>

            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-semibold text-sm">
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      {/* Scene Container with Transition */}
      <div
        className={`
          w-full h-full transition-opacity duration-300
          ${isTransitioning ? 'opacity-0' : 'opacity-100'}
        `}
      >
        {currentScene === 'city' && (
          <CityView3D onEnterCouncil={() => handleSceneChange('council')} />
        )}

        {currentScene === 'council' && (
          <CouncilRoom3D onBack={() => handleSceneChange('city')} />
        )}
      </div>

      {/* Loading overlay during transition */}
      {isTransitioning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-semibold">
              {currentScene === 'city' ? 'Entering Council...' : 'Returning to City...'}
            </p>
          </div>
        </div>
      )}

      {/* Scene Indicator (bottom left) */}
      <div className="absolute bottom-6 left-6 z-50 flex flex-col gap-2">
        <button
          onClick={() => handleSceneChange('city')}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm transition-all
            ${currentScene === 'city'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
              : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60'
            }
          `}
        >
          🏙️ City View
        </button>
        <button
          onClick={() => handleSceneChange('council')}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm transition-all
            ${currentScene === 'council'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
              : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60'
            }
          `}
        >
          🏛️ Council Room
        </button>
      </div>
    </div>
  )
}
