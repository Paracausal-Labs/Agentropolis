'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleTryAsGuest = () => {
    router.push('/app?guest=true')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0f172a] to-[#1a0a2a] text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1e3f_1px,transparent_1px),linear-gradient(to_bottom,#1e1e3f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Animated particles */}
      <div className="absolute inset-0">
        {mounted && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-400 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl">
          {/* Animated city emoji */}
          <div className="mb-8 text-8xl animate-bounce">🏙️</div>

          {/* Title with gradient animation */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-gradient">
              AGENTROPOLIS
            </span>
          </h1>

          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light animate-in fade-in slide-in-from-bottom-3 duration-1000 delay-150">
            Build a city of agents. Approve their plans.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Execute trades on-chain.
            </span>
          </p>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 animate-in fade-in duration-1000 delay-300">
            A gamified 3D DeFi platform where AI agents propose trades in your cyberpunk city council.
            You decide what gets executed on Uniswap v4.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-450">
            <Link
              href="/app"
              className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-xl font-bold text-lg shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/50 transition-all overflow-hidden"
            >
              <span className="relative z-10">🚀 Launch App</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <button
              onClick={handleTryAsGuest}
              className="px-8 py-4 bg-gray-800/60 backdrop-blur-sm text-white rounded-xl hover:bg-gray-700/60 transition-all font-semibold text-lg border border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              👀 Try as Guest
            </button>

            <Link
              href="/docs"
              className="px-8 py-4 bg-transparent text-gray-400 rounded-xl hover:text-white transition-all font-semibold text-lg border border-gray-800 hover:border-cyan-500/50"
            >
              📚 Docs
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto animate-in fade-in duration-1000 delay-600">
            <FeatureCard
              icon="⚡"
              title="Yellow Network"
              description="Instant off-chain micro-actions with on-chain settlement. Deploy agents without gas fees."
              color="from-yellow-400/20 to-orange-400/20"
              borderColor="border-yellow-400/30"
            />

            <FeatureCard
              icon="🤖"
              title="AI Agents"
              description="Deploy agents that analyze markets and propose optimal trades in a 3D cyberpunk city."
              color="from-cyan-400/20 to-blue-400/20"
              borderColor="border-cyan-400/30"
            />

            <FeatureCard
              icon="🦄"
              title="Uniswap v4"
              description="Approved proposals execute real swaps on Uniswap v4. Full transparency with on-chain TxIDs."
              color="from-pink-400/20 to-purple-400/20"
              borderColor="border-pink-400/30"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-6 text-gray-600 text-sm animate-in fade-in duration-1000 delay-1000">
          Built for HackMoney 2026 🏆
        </footer>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  borderColor,
}: {
  icon: string
  title: string
  description: string
  color: string
  borderColor: string
}) {
  return (
    <div className={`
      group relative bg-gradient-to-br ${color} backdrop-blur-xl 
      rounded-2xl p-6 border ${borderColor} 
      hover:scale-105 transition-all duration-300
      hover:shadow-xl hover:shadow-cyan-500/10
    `}>
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        {description}
      </p>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/0 to-purple-400/0 group-hover:from-cyan-400/10 group-hover:to-purple-400/10 transition-all duration-300" />
    </div>
  )
}
