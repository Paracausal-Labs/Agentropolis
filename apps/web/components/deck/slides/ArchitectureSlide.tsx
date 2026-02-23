'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { MermaidDiagram } from '../MermaidDiagram'

const architectureChart = `
flowchart TB
    U[Users and Agent Builders] --> FE[Agentropolis Web App]
    U --> API[Agent API REST and WS]

    FE --> APP[Application Layer]
    API --> APP

    APP --> RISK[Risk Engine and Policy]
    APP --> PERF[Performance Oracle and Indexer]
    APP --> TOURN[Tournament Engine]
    APP --> MKT[Marketplace Service]
    APP --> COUNCIL[Default AI Council]

    APP --> YELLOW[Yellow Clearnode]
    YELLOW --> UB[Unified Balance]
    YELLOW --> CH[Payment Channels]
    YELLOW --> SESS[App Sessions]

    APP --> BASE[Base Mainnet]
    BASE --> V4[Uniswap V4 Pools and Hooks]
    BASE --> REG[AgentRegistry and NFTs]
    BASE --> T[ Tournament Contract ]

    PERF --> DASH[Leaderboards and City State]
    DASH --> FE
`

export function ArchitectureSlide() {
    return (
        <MotionSlide id="slide-arch">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="relative z-20 w-full max-w-6xl mx-auto"
            >
                <div className="text-center mb-10">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-4">
                        Architecture
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-2 leading-none">
                        System Architecture
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-lg text-gray-400 font-medium">
                        Consumer AI trading stack with Yellow as the transaction and session layer
                    </motion.p>
                </div>

                <div className="relative">
                    <motion.div variants={itemVariants} className="w-full">
                        <MermaidDiagram chart={architectureChart} id="architecture" />
                    </motion.div>

                    {/* Desktop Callouts - Hidden on mobile for cleaner layout */}
                    <div className="hidden lg:block">
                        <motion.div variants={itemVariants} className="absolute -left-32 top-10 border-l-2 border-[#00F0FF] pl-4 text-xs font-mono tracking-widest uppercase text-gray-400 w-48 bg-black/40 p-2">
                            Frontend and <br /><span className="text-[#00F0FF]">Agent API</span>
                        </motion.div>
                        <motion.div variants={itemVariants} className="absolute -right-32 top-32 border-r-2 border-[#FF00FF] pr-4 text-right text-xs font-mono tracking-widest uppercase text-gray-400 w-48 bg-black/40 p-2">
                            <span className="text-[#FF00FF]">Application services</span> <br /><span className="lowercase text-[10px]">(risk, oracle, tournaments, marketplace)</span>
                        </motion.div>
                        <motion.div variants={itemVariants} className="absolute -left-32 bottom-32 border-l-2 border-[#FCEE0A] pl-4 text-xs font-mono tracking-widest uppercase text-gray-400 w-48 bg-black/40 p-2">
                            Yellow <span className="text-[#FCEE0A]">Clearnode</span> <br /><span className="lowercase text-[10px]">(Unified Balance, Channels, App Sessions)</span>
                        </motion.div>
                        <motion.div variants={itemVariants} className="absolute -right-32 bottom-10 border-r-2 border-white pr-4 text-right text-xs font-mono tracking-widest uppercase text-gray-400 w-48 bg-black/40 p-2">
                            <span className="text-white">Base mainnet</span> <br /><span className="lowercase text-[10px]">(V4 hooks, registry, NFTs, tournaments)</span>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </MotionSlide>
    )
}
