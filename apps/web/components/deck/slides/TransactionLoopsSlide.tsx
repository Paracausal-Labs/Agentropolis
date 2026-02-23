'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { MermaidDiagram } from '../MermaidDiagram'

const tradeChart = `
sequenceDiagram
    autonumber
    participant User
    participant UI as Agentropolis UI
    participant API as Agent API
    participant Risk as Risk Engine
    participant Y as Yellow Clearnode
    participant S as App Session
    participant V4 as Uniswap V4 Hooks
    participant Perf as Performance Oracle

    User->>UI: Approve strategy and risk caps
    UI->>API: POST /agents/trade
    API->>Risk: Validate policy, limits, balances
    Risk-->>API: Approved
    API->>Y: Ensure channel/session active
    Y-->>API: Session ready
    API->>S: submit_app_state(intent=operate)
    S-->>API: Session state updated
    API->>V4: Execute swap via hooks
    V4-->>API: Trade executed + events
    API->>Perf: Index trade result and metrics
    Perf-->>UI: Updated PnL, rank, city state
    UI-->>User: Trade result and visual update
`

const marketChart = `
sequenceDiagram
    autonumber
    participant Buyer
    participant UI as Marketplace UI
    participant M as Marketplace Service
    participant Y as Yellow Clearnode
    participant SC as Marketplace Contract
    participant Seller

    Buyer->>UI: Buy agent rental / strategy NFT
    UI->>M: Create purchase intent
    M->>Y: Debit buyer channel
    Y-->>M: Funds locked
    M->>SC: Execute sale / NFT transfer
    SC-->>M: Transfer confirmed
    M->>Y: Credit seller channel (97.5%)
    M->>Y: Credit protocol fee bucket (2.5%)
    M-->>Buyer: Access granted / NFT received
    M-->>Seller: Sale completed
`

const tourneyChart = `
flowchart LR
    A[Users and Agents] --> B[Join Tournament]
    B --> C[Yellow Channel Entry Fee]
    C --> D[App Session Arena]
    D --> E[Agent Trades and Outcomes]
    E --> F[Performance Oracle Scoring]
    F --> G[Rank by Risk Adjusted Return]
    G --> H[Distribute Prizes]
    H --> I[Yellow Channel Payouts]
    H --> J[NFT Badges and City Rewards]
`

export function TransactionLoopsSlide() {
    const [activeTab, setActiveTab] = useState<'trade' | 'market' | 'tourney'>('trade')

    return (
        <MotionSlide id="slide-loops">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="relative z-20 w-full max-w-6xl mx-auto flex flex-col items-center"
            >
                <div className="text-center mb-10 w-full">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-4">
                        Core Loops
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-2 leading-none">
                        Core Transaction Loops
                    </motion.h2>
                </div>

                {/* Tabs */}
                <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 mb-8 w-full">
                    <button
                        onClick={() => setActiveTab('trade')}
                        className={`px-6 py-3 font-mono text-sm tracking-widest uppercase transition-colors border ${activeTab === 'trade' ? 'border-[#FCEE0A] bg-[#FCEE0A]/10 text-[#FCEE0A]' : 'border-white/20 bg-black/40 text-gray-400 hover:border-white/50'}`}
                    >
                        1. Trading
                    </button>
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`px-6 py-3 font-mono text-sm tracking-widest uppercase transition-colors border ${activeTab === 'market' ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF]' : 'border-white/20 bg-black/40 text-gray-400 hover:border-white/50'}`}
                    >
                        2. Marketplace
                    </button>
                    <button
                        onClick={() => setActiveTab('tourney')}
                        className={`px-6 py-3 font-mono text-sm tracking-widest uppercase transition-colors border ${activeTab === 'tourney' ? 'border-[#FF00FF] bg-[#FF00FF]/10 text-[#FF00FF]' : 'border-white/20 bg-black/40 text-gray-400 hover:border-white/50'}`}
                    >
                        3. Tournament
                    </button>
                </motion.div>

                {/* Content Area */}
                <motion.div variants={itemVariants} className="w-full relative h-[600px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'trade' && (
                            <motion.div
                                key="trade"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex flex-col gap-4"
                            >
                                <div className="border border-[#FCEE0A]/30 bg-[#FCEE0A]/5 p-4 text-gray-300 font-medium text-center">
                                    Agent trade intent flows through validation, Yellow session state update, V4 execution, hook checks, and performance indexing.
                                </div>
                                <MermaidDiagram chart={tradeChart} id="loop-trade" />
                            </motion.div>
                        )}
                        {activeTab === 'market' && (
                            <motion.div
                                key="market"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex flex-col gap-4"
                            >
                                <div className="border border-[#00F0FF]/30 bg-[#00F0FF]/5 p-4 text-gray-300 font-medium text-center">
                                    Buyer pays through Yellow, platform takes fee, seller gets credited, strategy or NFT access is granted.
                                </div>
                                <MermaidDiagram chart={marketChart} id="loop-market" />
                            </motion.div>
                        )}
                        {activeTab === 'tourney' && (
                            <motion.div
                                key="tourney"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex flex-col gap-4"
                            >
                                <div className="border border-[#FF00FF]/30 bg-[#FF00FF]/5 p-4 text-gray-300 font-medium text-center">
                                    Users enter with a Yellow-funded fee, agents trade for a fixed period, performance is scored, prizes are distributed through Yellow.
                                </div>
                                <MermaidDiagram chart={tourneyChart} id="loop-tourney" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

            </motion.div>
        </MotionSlide>
    )
}
