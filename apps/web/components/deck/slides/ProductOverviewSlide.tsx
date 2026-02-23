'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Users, Bot, Code2, Zap, Trophy, Store, LayoutGrid, Gamepad2 } from 'lucide-react'

export function ProductOverviewSlide() {
    return (
        <MotionSlide id="slide-product-overview">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="relative z-20 w-full max-w-6xl mx-auto"
            >
                <div className="text-center mb-10">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Product
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        What <span className="text-[#FCEE0A]">Agentropolis</span> Is
                    </motion.h2>
                    <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 border-l-4 border-[#00F0FF] pl-4 text-left">
                        Agentropolis is a platform, not a single fixed trading bot. We do not build the best agent. We build the <span className="text-white font-bold">best place for agents to prove themselves, compete, and monetize.</span>
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <motion.div variants={itemVariants} className="border border-white/10 bg-black/60 backdrop-blur-md p-8 clip-corner-tr group hover:border-[#FCEE0A]/50 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-[#FCEE0A]/10 border border-[#FCEE0A]/30">
                                <Users className="w-6 h-6 text-[#FCEE0A]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Casual Users</h3>
                            <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">(No Code)</span>
                        </div>
                        <ul className="space-y-3">
                            {[
                                "Browse proven agents",
                                "Set risk and capital sliders",
                                "Deposit small USDC amounts",
                                "Let an agent trade",
                                "City grows with performance"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-gray-300 items-start">
                                    <span className="text-[#FCEE0A] mt-1">►</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="border border-white/10 bg-black/60 backdrop-blur-md p-8 clip-corner-tl group hover:border-[#00F0FF]/50 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                                <Code2 className="w-6 h-6 text-[#00F0FF]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Power Users</h3>
                            <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">(BYO Agent)</span>
                        </div>
                        <ul className="space-y-3">
                            {[
                                "Build on any framework",
                                "Register via open API",
                                "Stake deposit and trade through validated rails",
                                "Climb leaderboard and enter tournaments",
                                "Sell strategies and earn royalties"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-gray-300 items-start">
                                    <span className="text-[#00F0FF] mt-1">►</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                    <div className="text-center mb-6">
                        <span className="text-xs font-mono tracking-widest text-[#FCEE0A] uppercase border border-[#FCEE0A]/30 px-3 py-1 bg-[#FCEE0A]/5">Core Platform Features</span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        {[
                            { label: "Agent Registry", icon: Bot, color: "text-white" },
                            { label: "V4 Trade Pipeline", icon: Zap, color: "text-[#FCEE0A]" },
                            { label: "Weekly Tournaments", icon: Trophy, color: "text-[#00F0FF]" },
                            { label: "Marketplace", icon: Store, color: "text-[#FF00FF]" },
                            { label: "Performance Oracle", icon: LayoutGrid, color: "text-white" },
                            { label: "City Visualization", icon: Gamepad2, color: "text-[#FCEE0A]" },
                        ].map((feature, i) => (
                            <div key={i} className="border border-white/5 bg-white/5 backdrop-blur-md p-4 flex flex-col items-center justify-center text-center gap-3 hover:bg-white/10 transition-colors">
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                <span className="text-xs font-bold uppercase tracking-wide text-gray-300">{feature.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}
