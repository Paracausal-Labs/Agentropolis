'use client'

import { ConnectButton } from '@/components/ConnectButton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleTryAsGuest = () => {
    router.push('/app?guest=true')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl">
          <div className="mb-6 text-6xl">🏙️</div>
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6">
            Agentropolis
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            Build a city of agents. Approve their plans. Execute trades on-chain.
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
            A gamified DeFi platform where AI agents propose trades in your city council. 
            You decide what gets executed on Uniswap v4.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/app" 
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all font-bold text-lg shadow-lg shadow-yellow-500/25"
            >
              🚀 Launch App
            </Link>
            <button
              onClick={handleTryAsGuest}
              className="px-8 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all font-semibold text-lg border border-gray-700"
            >
              👀 Try as Guest (10 min)
            </button>
            <Link 
              href="/docs" 
              className="px-8 py-4 bg-transparent text-gray-400 rounded-xl hover:text-white transition-all font-semibold text-lg border border-gray-800 hover:border-gray-600"
            >
              📚 Docs
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Yellow Network</h3>
              <p className="text-gray-400 text-sm">Instant off-chain micro-actions with on-chain settlement. Deploy agents without gas fees.</p>
            </div>
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-xl font-bold text-blue-400 mb-2">AI Agents</h3>
              <p className="text-gray-400 text-sm">Deploy agents from the ERC-8004 registry. They analyze markets and propose optimal trades.</p>
            </div>
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <div className="text-3xl mb-3">🦄</div>
              <h3 className="text-xl font-bold text-pink-400 mb-2">Uniswap v4</h3>
              <p className="text-gray-400 text-sm">Approved proposals execute real swaps on Uniswap v4. Full transparency with on-chain TxIDs.</p>
            </div>
          </div>
        </div>

        <footer className="absolute bottom-6 text-gray-600 text-sm">
          Built for HackMoney 2026 🏆
        </footer>
      </div>
    </main>
  )
}
