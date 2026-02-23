'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { MermaidDiagram } from '../MermaidDiagram'

const flywheelChart = `
flowchart LR
    A[Campus and Crypto Communities] --> B[Try Default Agents]
    B --> C[First Trade]
    C --> D[Enter Weekly Tournament]
    D --> E[See Leaderboard and City Progress]
    E --> F[Rent or Buy Better Agent]
    F --> G[Builder Lists More Strategies]
    G --> H[More Supply and Better Performance]
    H --> A
`

export function GtmSlide() {
    return (
        <MotionSlide id="slide-gtm">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="relative z-20 w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[80vh]"
            >
                <div className="text-center mb-12 w-full">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Growth
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        Go-To-Market <span className="text-[#FCEE0A]">Strategy</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 w-full">
                    <motion.div variants={itemVariants} className="border border-white/10 bg-black/60 backdrop-blur-md p-6 relative clip-corner-tl">
                        <div className="absolute top-0 right-0 bg-white/5 px-3 py-1 text-xs font-mono text-gray-500 border-b border-l border-white/10">Month 1-2</div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 mt-4">Phase 1: Builder Community</h3>
                        <ul className="space-y-3 text-gray-300 text-sm">
                            <li className="flex gap-2">
                                <span className="text-[#00F0FF]">►</span> Open Agent API and docs
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#00F0FF]">►</span> Target builders through hackathons, X, and Discord
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FCEE0A] font-bold">»</span> <span className="font-bold text-white">Goal:</span> 20 to 50 registered external agents
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#00F0FF]">►</span> Focus on verified performance and monetization
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="border border-[#FCEE0A]/30 bg-[#FCEE0A]/5 backdrop-blur-md p-6 relative clip-corner-tr shadow-[0_0_20px_rgba(252,238,10,0.1)]">
                        <div className="absolute top-0 right-0 bg-[#FCEE0A]/20 px-3 py-1 text-xs font-mono text-[#FCEE0A] border-b border-l border-[#FCEE0A]/30">Month 2-3</div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 mt-4 text-[#FCEE0A]">Phase 2: Tournaments Launch</h3>
                        <ul className="space-y-3 text-gray-300 text-sm">
                            <li className="flex gap-2">
                                <span className="text-[#FCEE0A]">►</span> Weekly paid tournaments
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FCEE0A]">►</span> Seed initial prize pools to bootstrap activity
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FCEE0A]">►</span> Share leaderboards and results as content
                            </li>
                            <li className="flex gap-2">
                                <span className="text-white font-bold">»</span> <span className="font-bold text-white">Goal:</span> 100+ active users and weekly tournament participation
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="border border-[#FF00FF]/30 bg-[#FF00FF]/5 backdrop-blur-md p-6 relative clip-corner-br">
                        <div className="absolute top-0 right-0 bg-[#FF00FF]/20 px-3 py-1 text-xs font-mono text-[#FF00FF] border-b border-l border-[#FF00FF]/30">Month 3+</div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 mt-4 flex justify-between">
                            Phase 3: Marketplace Flywheel
                        </h3>
                        <ul className="space-y-3 text-gray-300 text-sm">
                            <li className="flex gap-2">
                                <span className="text-[#FF00FF]">►</span> Performance data increases marketplace trust
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FF00FF]">►</span> Proven agents attract buyers
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FF00FF]">►</span> Successful sellers attract more builders
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FCEE0A] font-bold">»</span> <span className="font-bold text-white">Goal:</span> self-sustaining strategy and agent marketplace
                            </li>
                        </ul>
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="border border-white/10 bg-black/60 backdrop-blur-md p-4 w-full h-[400px] flex flex-col flex-1">
                    <div className="text-center mb-2">
                        <span className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase border border-[#00F0FF]/30 px-2 py-0.5 bg-[#00F0FF]/5">Growth Flywheel</span>
                    </div>
                    <div className="w-full h-full flex-1">
                        <MermaidDiagram chart={flywheelChart} id="gtm-flywheel" />
                    </div>
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}
