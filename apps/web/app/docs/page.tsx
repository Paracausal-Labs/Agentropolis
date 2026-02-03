import Link from 'next/link'

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-4">Agentropolis Documentation</h1>
        <p className="text-gray-500 mb-12">For HackMoney 2026 Judges</p>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">What is Agentropolis?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Agentropolis is a <strong>gamified DeFi trading platform</strong> presented as a city-builder game. 
            Users deploy AI agents in an isometric city, agents propose trading strategies in the Council Room, 
            and approved proposals execute real on-chain swaps on Uniswap v4.
          </p>
          <p className="text-gray-300 leading-relaxed">
            The result: DeFi that is fun, visual, and understandable. <strong>Agents generate plans → Humans approve → Smart contracts execute.</strong>
          </p>
        </section>

        <section className="mb-12 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400">⚡ Yellow Network Integration ($15k Track)</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We use Yellow Network for <strong>instant, gasless micro-actions</strong> within the app:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
            <li><strong>Session Creation:</strong> User deposits once to start a Yellow session</li>
            <li><strong>Off-chain Actions:</strong> Deploy agents instantly (0.01 fee per deploy) without gas</li>
            <li><strong>Settlement:</strong> When session ends, net balance settles on-chain</li>
          </ul>
          <p className="text-gray-400 text-sm">
            Implementation: <code className="bg-gray-800 px-2 py-1 rounded">apps/web/lib/yellow/channel.tsx</code>, <code className="bg-gray-800 px-2 py-1 rounded">SessionProvider.tsx</code>
          </p>
        </section>

        <section className="mb-12 bg-pink-500/10 border border-pink-500/30 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-pink-400">🦄 Uniswap v4 Integration ($10k Track)</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Agent proposals execute real swaps on <strong>Uniswap v4 via Universal Router</strong>:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
            <li>AI agents generate structured <code className="bg-gray-800 px-1 rounded">TradeProposal</code> objects</li>
            <li>User approves in Council Room UI</li>
            <li>Executor encodes V4_SWAP command and calls Universal Router</li>
            <li>Transaction hash displayed and linked to BaseScan</li>
          </ul>
          <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-400 mb-4">
            <div>Chain: Base Sepolia (84532)</div>
            <div>Universal Router: 0x492E6456D9528771018DeB9E87ef7750EF184104</div>
            <div>Pool Manager: 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408</div>
          </div>
          <p className="text-gray-400 text-sm">
            Implementation: <code className="bg-gray-800 px-2 py-1 rounded">apps/web/lib/uniswap/executor.ts</code>
          </p>
        </section>

        <section className="mb-12 bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">🔖 ENS Integration ($5k Track)</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            ENS provides <strong>human-readable identity</strong> and <strong>persistent config storage</strong>:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
            <li>Connected wallet displays ENS name (if available) or truncated address</li>
            <li>ENS avatar shown in header</li>
            <li>Council Room seats labeled with ENS names</li>
            <li><strong>Save to ENS:</strong> Users can persist agent config to ENS text records</li>
            <li><strong>Read from ENS:</strong> Agent preferences auto-loaded from text records on connect</li>
          </ul>
          <p className="text-gray-400 text-sm">
            Implementation: <code className="bg-gray-800 px-2 py-1 rounded">apps/web/components/UserIdentity.tsx</code>, <code className="bg-gray-800 px-2 py-1 rounded">apps/web/lib/ens/textRecords.ts</code>
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">🏗️ Architecture</h2>
          <pre className="bg-gray-900 rounded-lg p-6 text-sm text-gray-300 overflow-x-auto">{`
┌─────────────────────────────────────────────────────────────┐
│                     AGENTROPOLIS                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js + Phaser)                                │
│  ├── CityScene: Isometric city with deployable agents       │
│  ├── CouncilScene: Roundtable UI for proposal review        │
│  └── Components: WalletProvider, SessionProvider            │
├─────────────────────────────────────────────────────────────┤
│  API Routes                                                 │
│  ├── /api/agents/list: ERC-8004 agent registry query        │
│  └── /api/agents/propose: Groq LLM proposal generation      │
├─────────────────────────────────────────────────────────────┤
│  Integrations                                               │
│  ├── Yellow: Session lifecycle, off-chain micro-actions     │
│  ├── Uniswap v4: Swap execution via Universal Router        │
│  └── ENS: Name resolution via wagmi hooks                   │
└─────────────────────────────────────────────────────────────┘
          `}</pre>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-400">📁 Repository</h2>
          <p className="text-gray-300">
            Monorepo structure: <code className="bg-gray-800 px-2 py-1 rounded">apps/web</code> (Next.js), 
            <code className="bg-gray-800 px-2 py-1 rounded ml-2">packages/shared</code> (types)
          </p>
        </section>
      </div>
    </main>
  )
}
