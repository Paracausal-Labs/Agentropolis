import { ConnectButton } from '@/components/ConnectButton'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-950 text-white">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Agentropolis
      </h1>
      <p className="mt-4 text-xl text-gray-400 max-w-xl text-center">
        Build a city of agents, approve their plans, execute trades on-chain.
      </p>
      
      <div className="mt-8">
        <ConnectButton />
      </div>

      <div className="mt-12 flex gap-4">
        <Link 
          href="/app" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold"
        >
          Launch App
        </Link>
        <Link 
          href="/docs" 
          className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
        >
          Docs
        </Link>
      </div>
    </main>
  )
}
