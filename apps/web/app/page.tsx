'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import 3D scene
const LandingScene3D = dynamic(() => import('@/components/landing/LandingScene3D'), { ssr: false })

export default function Home() {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [glitchText, setGlitchText] = useState('AGENTROPOLIS')

  // Glitch effect on title
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        // Random glitch characters
        const glitched = 'AGENTROPOLIS'.split('').map((char, index) => {
          if (Math.random() > 0.7) return String.fromCharCode(65 + Math.floor(Math.random() * 26));
          return char;
        }).join('');
        setGlitchText(glitched)
        setTimeout(() => setGlitchText('AGENTROPOLIS'), 100)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleLaunch = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      router.push('/app')
    }, 1200)
  }

  return (
    <main className="min-h-screen bg-[#050510] relative overflow-hidden font-[Rajdhani]">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-40">
        <LandingScene3D />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(252,238,10,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(252,238,10,0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      <div className="absolute inset-0 scanline pointer-events-none" />

      {/* Content Overlay */}
      <div className={`
        relative z-10 flex flex-col items-center justify-center min-h-screen px-6 transition-all duration-1000 ease-in-out
        ${isTransitioning ? 'scale-150 opacity-0 blur-lg' : 'scale-100 opacity-100'}
      `}>

        {/* Main Title Block */}
        <div className="mb-12 relative text-center">
          <div className="border border-[#FCEE0A] p-2 inline-block mb-4 clip-corner-tr bg-black/50 backdrop-blur">
            <span className="bg-[#FCEE0A] text-black px-4 py-1 font-bold tracking-widest text-sm uppercase">System Online</span>
          </div>

          <h1 className="text-8xl md:text-9xl font-black text-white tracking-tighter mb-2 text-glitch select-none" data-text={glitchText}>
            {glitchText}
          </h1>

          <div className="flex items-center justify-center gap-4 text-[#FCEE0A] tracking-[0.5em] text-sm uppercase font-bold">
            <span>Build</span>
            <span className="w-2 h-2 bg-[#FCEE0A] rotate-45 animate-pulse"></span>
            <span>Command</span>
            <span className="w-2 h-2 bg-[#FCEE0A] rotate-45 animate-pulse delay-75"></span>
            <span>Execute</span>
          </div>
        </div>

        {/* Description Panel */}
        <div className="cyber-panel p-8 max-w-3xl w-full mb-12 text-center">
          <p className="text-gray-300 text-lg leading-relaxed mb-6 font-medium tracking-wide">
            <strong className="text-[#FCEE0A]">TACTICAL DEFI PROTOCOL:</strong> Deploy autonomous agents into the neural city grid.
            Authorize on-chain execution via the Council.
          </p>

          <div className="flex justify-center gap-8 text-sm text-[#00F0FF] font-mono border-t border-[#FCEE0A]/20 pt-4">
            <span className="animate-pulse"> [ STATUS: LIVE ] </span>
            <span> [ NET: YELLOW ] </span>
            <span> [ GAS: 0.00 ] </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-20 z-20">
          <button
            onClick={handleLaunch}
            disabled={isTransitioning}
            className="btn-cyber w-64 h-16 text-xl clip-corner-tr"
          >
            INITIALIZE APP
          </button>

          <button
            onClick={handleLaunch}
            disabled={isTransitioning}
            className="btn-cyber-outline w-64 h-16 text-xl clip-corner-tr"
          >
            GUEST ACCESS
          </button>
        </div>

        {/* Footer Stats */}
        <div className="absolute bottom-0 left-0 w-full border-t border-[#FCEE0A]/20 bg-black/80 backdrop-blur-md p-4">
          <div className="container mx-auto flex justify-between items-center text-xs text-[#666] uppercase tracking-widest font-mono">
            <div>SYS.VER.2.0.4 // AGENTROPOLIS_CORE</div>
            <div className="flex gap-8 hidden md:flex">
              <span><span className="text-[#FCEE0A]">ACTIVE_NODES:</span> 8,492</span>
              <span><span className="text-[#FCEE0A]">TOTAL_VALUE:</span> $42.8M</span>
              <span><span className="text-[#FCEE0A]">UPTIME:</span> 99.99%</span>
            </div>
            <div>SECURE_CONNECTION_ESTABLISHED</div>
          </div>
        </div>

      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-[#050510] z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center w-full max-w-md">
            <div className="text-[#FCEE0A] text-4xl font-mono mb-4 animate-pulse uppercase tracking-[0.2em]">{'>'} SYSTEM_BOOT SEQUENCE</div>
            <div className="w-full h-1 bg-[#1a1a1a] overflow-hidden">
              <div className="h-full bg-[#FCEE0A] animate-[width_1s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
            </div>
            <div className="flex justify-between text-[#00F0FF] text-xs font-mono mt-2">
              <span>LOADING ASSETS...</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
