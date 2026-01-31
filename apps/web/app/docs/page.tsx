import Link from 'next/link'

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Agentropolis Documentation</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">What is Agentropolis?</h2>
          <p className="text-gray-300 leading-relaxed">
            Agentropolis is a gamified DeFi trading platform presented as a city-builder. 
            Deploy AI agents as characters in a living city, let them propose trading strategies, 
            and approve their plans to execute real on-chain trades.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Yellow Network Integration</h2>
          <p className="text-gray-300 leading-relaxed">
            Coming soon: Session-based off-chain transactions for instant micro-actions.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-pink-400">Uniswap v4 Integration</h2>
          <p className="text-gray-300 leading-relaxed">
            Coming soon: Agent-proposed trades executed via Universal Router on Uniswap v4.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">ENS Integration</h2>
          <p className="text-gray-300 leading-relaxed">
            ENS names are displayed throughout the app for human-readable identity.
          </p>
        </section>
      </div>
    </main>
  )
}
