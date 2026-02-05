import Link from 'next/link'

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#050510] relative font-[Rajdhani] text-gray-300 selection:bg-[#FCEE0A] selection:text-black">
      {/* Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(252,238,10,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(252,238,10,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      <div className="fixed inset-0 scanline pointer-events-none opacity-50" />
      <div className="fixed inset-0 bg-radial-gradient from-transparent to-[#050510] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#FCEE0A] hover:text-[#00F0FF] mb-12 uppercase tracking-widest font-bold transition-all hover:translate-x-[-5px]"
        >
          <span>{'<'}</span> RETURN_TO_BASE
        </Link>

        <header className="mb-16 text-center">
          <div className="inline-block border border-[#00F0FF]/30 bg-black/50 backdrop-blur px-4 py-1 mb-4">
            <span className="text-[#00F0FF] text-xs font-mono tracking-[0.3em]">HACKMONEY_2026 // CLASSIFIED</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-4 text-glitch" data-text="AGENTROPOLIS DOCS">
            AGENTROPOLIS <span className="text-[#FCEE0A]">DOCS</span>
          </h1>
          <p className="text-[#8a8aa0] text-xl tracking-wide max-w-2xl mx-auto border-t border-b border-white/10 py-4">
            Tactical manual for HackMoney 2026 Judges & Operatives
          </p>
        </header>

        <div className="space-y-12">
          {/* Intro Section */}
          <section className="cyber-panel p-8 clip-corner-tl">
            <div className="flex items-center gap-4 mb-6 border-b border-[#FCEE0A]/20 pb-4">
              <span className="text-4xl">🏙️</span>
              <h2 className="text-3xl font-bold text-[#FCEE0A] uppercase tracking-wider">What is Agentropolis?</h2>
            </div>
            <div className="space-y-4 text-lg">
              <p>
                Agentropolis is a <strong className="text-white">gamified DeFi trading platform</strong> presented as a city-builder game.
                Users deploy autonomous AI agents into an isometric city, where they propose trading strategies in the Council Room.
              </p>
              <p className="bg-[#FCEE0A]/10 border-l-4 border-[#FCEE0A] p-4 text-white">
                <strong>THE CORE LOOP:</strong> Agents generate plans → Humans approve → Smart contracts execute.
              </p>
            </div>
          </section>

          {/* Council Section */}
          <section className="cyber-panel p-8 clip-corner-br">
            <div className="flex items-center gap-4 mb-6 border-b border-[#00F0FF]/20 pb-4">
              <span className="text-4xl">🤖</span>
              <h2 className="text-3xl font-bold text-[#00F0FF] uppercase tracking-wider">Multi-Agent Council</h2>
            </div>
            <p className="mb-6 text-lg">
              Our <strong className="text-white">visible multi-agent deliberation</strong> sets us apart. Watch the AI debate in real-time before execution.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <AgentCard
                name="Alpha Hunter"
                role="Seeks yield opportunities, estimates APY"
                icon="🎯"
                color="text-[#FCEE0A]"
              />
              <AgentCard
                name="Risk Sentinel"
                role="Identifies risks, VETO power enabled"
                icon="🛡️"
                color="text-[#FF00FF]"
              />
              <AgentCard
                name="Macro Oracle"
                role="Provides market context & sentiment"
                icon="🔮"
                color="text-[#00F0FF]"
              />
              <AgentCard
                name="Devil's Advocate"
                role="Challenges assumptions, stress testing"
                icon="😈"
                color="text-red-500"
              />
            </div>
            <ImplementationFooter
              files={['apps/web/lib/agents/council.ts', 'apps/web/app/api/agents/council/route.ts']}
            />
          </section>

          {/* Yellow Network */}
          <section className="cyber-panel p-8 border-l-4 border-l-[#FCEE0A]">
            <h2 className="text-2xl font-bold text-[#FCEE0A] mb-4 flex items-center gap-3 uppercase">
              <span>⚡</span> Yellow Network Integration <span className="text-xs bg-[#FCEE0A] text-black px-2 py-0.5 rounded ml-auto">$15k Track</span>
            </h2>
            <p className="mb-4">
              We use Yellow Network for <strong className="text-white">instant, gasless micro-actions</strong> within the app:
            </p>
            <ul className="space-y-3 mb-6 font-mono text-sm text-[#8a8aa0]">
              <li className="flex items-start gap-3">
                <span className="text-[#FCEE0A]">{'>'}</span>
                <span><strong className="text-white">Session Creation:</strong> User deposits once to start a Yellow session.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FCEE0A]">{'>'}</span>
                <span><strong className="text-white">Off-chain Actions:</strong> Deploy agents instantly (0.01 fee) without gas.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FCEE0A]">{'>'}</span>
                <span><strong className="text-white">Settlement:</strong> Net balance settles on-chain when session ends.</span>
              </li>
            </ul>
            <ImplementationFooter files={['apps/web/lib/yellow/channel.tsx', 'SessionProvider.tsx']} />
          </section>

          {/* Uniswap V4 */}
          <section className="cyber-panel p-8 border-l-4 border-l-[#FF00FF]">
            <h2 className="text-2xl font-bold text-[#FF00FF] mb-4 flex items-center gap-3 uppercase">
              <span>🦄</span> Uniswap v4 Integration <span className="text-xs bg-[#FF00FF] text-white px-2 py-0.5 rounded ml-auto">$10k Track</span>
            </h2>
            <div className="space-y-4">
              <p>Agent proposals execute real <strong className="text-white">swaps and LP operations</strong> on Uniswap v4.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mb-4">
                <div className="bg-black/40 p-3 border border-[#FF00FF]/20">
                  <div className="text-[#FF00FF] mb-1">SWAPS</div>
                  <div>V4_SWAP command via Universal Router</div>
                </div>
                <div className="bg-black/40 p-3 border border-[#FF00FF]/20">
                  <div className="text-[#FF00FF] mb-1">LIQUIDITY</div>
                  <div>Concentrated positions via PositionManager</div>
                </div>
              </div>
            </div>
            <div className="bg-black/60 p-4 border border-white/5 font-mono text-xs text-[#8a8aa0] mb-6">
              <div>Chain: Base Sepolia (84532)</div>
              <div>Pool Manager: 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408</div>
            </div>
            <ImplementationFooter files={['apps/web/lib/uniswap/executor.ts', 'lp-executor.ts', 'strategy-router.ts']} />
          </section>

          {/* Clanker */}
          <section className="cyber-panel p-8 border-l-4 border-l-[#FFA500]">
            <h2 className="text-2xl font-bold text-[#FFA500] mb-4 flex items-center gap-3 uppercase">
              <span>🚀</span> Clanker Token Launch
            </h2>
            <p className="mb-4">Agents can <strong className="text-white">propose and launch new tokens</strong> via Clanker (Uniswap v4 hooks).</p>
            <div className="bg-black/60 p-4 border border-[#FFA500]/20 mb-4">
              <ul className="space-y-2 text-sm font-mono text-[#8a8aa0]">
                <li className="flex gap-2"><span className="text-[#FFA500]">*</span> One-Click Launch: Token + LP created atomically</li>
                <li className="flex gap-2"><span className="text-[#FFA500]">*</span> Fee Earning: User earns 80% of trading fees</li>
              </ul>
            </div>
            <ImplementationFooter files={['apps/web/lib/clanker/client.ts', 'apps/web/app/api/agents/launch-token/route.ts']} />
          </section>

          {/* Other Tech */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="cyber-panel p-6 border-t-4 border-t-[#00F0FF]">
              <h3 className="text-xl font-bold text-[#00F0FF] mb-3 uppercase">🔗 ERC-8004 Registry</h3>
              <p className="text-sm mb-4">Agents discovered from on-chain identity registry with reputation scores.</p>
              <a href="https://www.8004scan.io" target="_blank" rel="noopener noreferrer" className="text-xs text-[#00F0FF] hover:underline font-mono">View on 8004scan.io &rarr;</a>
            </section>

            <section className="cyber-panel p-6 border-t-4 border-t-[#8A2BE2]">
              <h3 className="text-xl font-bold text-[#8A2BE2] mb-3 uppercase">💳 x402 Micropayments</h3>
              <p className="text-sm mb-4">External agent endpoints auto-paid via x402 protocol (USDC on Base).</p>
            </section>

            <section className="cyber-panel p-6 border-t-4 border-t-[#10B981]">
              <h3 className="text-xl font-bold text-[#10B981] mb-3 uppercase">🔖 ENS Integration</h3>
              <p className="text-sm mb-4">Agent preferences & configs stored persistently in ENS text records.</p>
            </section>

            <section className="cyber-panel p-6 border-t-4 border-t-white">
              <h3 className="text-xl font-bold text-white mb-3 uppercase">🏗️ BYOA</h3>
              <p className="text-sm mb-4">Bring Your Own Agent: Connect external endpoints for custom logic.</p>
            </section>
          </div>

          {/* Architecture Diagram */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider text-center">System Architecture</h2>
            <div className="cyber-panel p-6 overflow-x-auto bg-black/80">
              <pre className="text-xs md:text-sm font-mono text-[#00F0FF] leading-relaxed">
                {`┌─────────────────────────────────────────────────────────────┐
│                     AGENTROPOLIS                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js + R3F)                                   │
│  ├── CityScene: Isometric city with deployable agents       │
│  ├── CouncilScene: Roundtable UI with speech bubbles        │
│  └── Components: WalletProvider, SessionProvider            │
├─────────────────────────────────────────────────────────────┤
│  API Routes & Execution                                     │
│  ├── /api/agents/*: Registry, Proposal, Council             │
│  ├── Strategy Router -> Swap/LP Executor (Universal Router) │
│  └── Integrations: Yellow, Uniswap v4, Clanker, x402, ENS   │
└─────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>
          </section>
        </div>

        <footer className="mt-24 border-t border-white/10 py-8 text-center text-xs text-[#666] uppercase tracking-widest">
          Agentropolis Core // HackMoney 2026 // Status: Operational
        </footer>
      </div>
    </main>
  )
}

function AgentCard({ name, role, icon, color }: { name: string, role: string, icon: string, color: string }) {
  return (
    <div className="bg-black/40 border border-white/5 p-4 flex items-start gap-4 hover:border-white/20 transition-colors group">
      <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{icon}</span>
      <div>
        <div className={`text-lg font-bold ${color} mb-1 uppercase tracking-tight`}>{name}</div>
        <div className="text-sm text-gray-400 leading-tight">{role}</div>
      </div>
    </div>
  )
}

function ImplementationFooter({ files }: { files: string[] }) {
  return (
    <div className="mt-6 pt-4 border-t border-white/5">
      <div className="text-[10px] text-[#666] uppercase tracking-widest mb-2">Implementation Sources</div>
      <div className="flex flex-wrap gap-2">
        {files.map((f, i) => (
          <code key={i} className="bg-black border border-white/10 px-2 py-1 rounded text-[10px] text-[#8a8aa0] font-mono">
            {f}
          </code>
        ))}
      </div>
    </div>
  )
}
