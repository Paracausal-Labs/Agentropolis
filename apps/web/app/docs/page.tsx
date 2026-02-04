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

        <section className="mb-12 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">🤖 Multi-Agent Council (Key Differentiator)</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Our <strong>visible multi-agent deliberation</strong> sets us apart from other agentic DeFi projects:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <div className="text-xl mb-2">🎯 Alpha Hunter</div>
              <div className="text-sm text-gray-400">Seeks yield opportunities, estimates APY</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <div className="text-xl mb-2">🛡️ Risk Sentinel</div>
              <div className="text-sm text-gray-400">Identifies risks, can VETO dangerous proposals</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <div className="text-xl mb-2">🔮 Macro Oracle</div>
              <div className="text-sm text-gray-400">Provides market context and sentiment</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <div className="text-xl mb-2">😈 Devil&apos;s Advocate</div>
              <div className="text-sm text-gray-400">Challenges assumptions, worst-case analysis</div>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4">
            The <strong>Council Clerk 📋</strong> synthesizes the debate into a final proposal with consensus status: unanimous, majority, contested, or vetoed.
          </p>
          <p className="text-gray-400 text-sm">
            Implementation: <code className="bg-gray-800 px-2 py-1 rounded">apps/web/lib/agents/council.ts</code>, <code className="bg-gray-800 px-2 py-1 rounded">apps/web/app/api/agents/council/route.ts</code>
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
            Agent proposals execute real <strong>swaps and LP operations</strong> on Uniswap v4:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
            <li>AI agents generate structured <code className="bg-gray-800 px-1 rounded">TradeProposal</code> with strategy type</li>
            <li>Strategy Router directs to Swap Executor or LP Executor</li>
            <li><strong>Swaps:</strong> V4_SWAP command via Universal Router</li>
            <li><strong>LP:</strong> Full-range or concentrated positions via PositionManager</li>
            <li>Pool Discovery utility finds initialized pools across fee tiers</li>
          </ul>
          <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-400 mb-4">
            <div>Chain: Base Sepolia (84532)</div>
            <div>Universal Router: 0x492E6456D9528771018DeB9E87ef7750EF184104</div>
            <div>Pool Manager: 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408</div>
            <div>Position Manager: 0xABD2e846ea3927eA90e5e4Caa2A0fFd0CcbF60f8</div>
          </div>
          <p className="text-gray-400 text-sm">
            Implementation: <code className="bg-gray-800 px-2 py-1 rounded">apps/web/lib/uniswap/executor.ts</code>, <code className="bg-gray-800 px-2 py-1 rounded">lp-executor.ts</code>, <code className="bg-gray-800 px-2 py-1 rounded">strategy-router.ts</code>
          </p>
        </section>

        <section className="mb-12 bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-orange-400">🚀 Clanker Token Launches (Agentic Finance)</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Agents can now <strong>propose and launch new tokens</strong> via Clanker, built on Uniswap v4 hooks:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
            <li><strong>Council Deliberation:</strong> Agents debate token name, symbol, and description</li>
            <li><strong>One-Click Launch:</strong> Clanker SDK deploys token + creates liquidity pool atomically</li>
            <li><strong>Fee Earning:</strong> User earns 80% of all trading fees from the launched token</li>
            <li><strong>Uniswap v4 Hooks:</strong> ClankerHookV2 handles fee collection and MEV protection</li>
          </ul>
          <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-400 mb-4">
            <div>Clanker Factory (Base Sepolia): 0xE85A59c628F7d27878ACeB4bf3b35733630083a9</div>
            <div>Fee Split: 80% to creator/agent, 20% to platform</div>
            <div>SDK: clanker-sdk@4.2.10</div>
          </div>
          <p className="text-gray-400 text-sm">
            Implementation: <code className="bg-gray-800 px-2 py-1 rounded">apps/web/lib/clanker/client.ts</code>, <code className="bg-gray-800 px-2 py-1 rounded">apps/web/app/api/agents/launch-token/route.ts</code>
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
│  ├── CouncilScene: Roundtable UI with speech bubbles        │
│  └── Components: WalletProvider, SessionProvider, Risk UI   │
├─────────────────────────────────────────────────────────────┤
│  API Routes                                                 │
│  ├── /api/agents/list: ERC-8004 agent registry query        │
│  ├── /api/agents/propose: Single-agent proposal generation  │
│  ├── /api/agents/council: Multi-agent deliberation endpoint │
│  └── /api/agents/launch-token: Token launch via Clanker     │
├─────────────────────────────────────────────────────────────┤
│  Execution Layer                                            │
│  ├── Strategy Router: Routes to swap or LP executor         │
│  ├── Swap Executor: V4_SWAP via Universal Router            │
│  ├── LP Executor: PositionManager for liquidity provision   │
│  └── Pool Discovery: Find initialized v4 pools              │
├─────────────────────────────────────────────────────────────┤
│  Integrations                                               │
│  ├── Yellow: Session lifecycle, off-chain micro-actions     │
│  ├── Uniswap v4: Swaps + LP via Universal Router & PM       │
│  ├── Clanker: Token launches with v4 hooks + fee earning    │
│  └── ENS: Name resolution, avatar, text record storage      │
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
