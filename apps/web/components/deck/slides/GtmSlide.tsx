'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Swords, Globe } from 'lucide-react'

export function GtmSlide() {
    return (
        <MotionSlide id="slide-gtm">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-5xl mx-auto"
            >
                <div className="text-center mb-14">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Growth Strategy
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        Go-To-Market
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Strategy 1: The Degens */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-black/40 border border-[#FCEE0A]/20 p-8 backdrop-blur-md"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-[#FCEE0A]/10 rounded-full">
                                <Swords className="w-6 h-6 text-[#FCEE0A]" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Weekly Tournaments</h3>
                        </div>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex gap-3">
                                <span className="text-[#FCEE0A]">01</span>
                                <span>High-stakes &quot;Alpha Battles&quot; every Friday using Yellow channels for instant settlement.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#FCEE0A]">02</span>
                                <span>Leaderboards acting as &quot;Resume&quot; for on-chain reputation.</span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Strategy 2: The Builders */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-black/40 border border-[#00F0FF]/20 p-8 backdrop-blur-md"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-[#00F0FF]/10 rounded-full">
                                <Globe className="w-6 h-6 text-[#00F0FF]" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Ecosystem Plays</h3>
                        </div>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex gap-3">
                                <span className="text-[#00F0FF]">01</span>
                                <span><strong>Yellow Network:</strong> Featured dApp for their state channel launch.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#00F0FF]">02</span>
                                <span><strong>ENS:</strong> Native integration for agent identity (subdomains).</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>

                {/* Viral Loop */}
                <motion.div
                    variants={itemVariants}
                    className="mt-8 border-t border-b border-white/10 py-8 text-center"
                >
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">The Viral Loop</div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12 text-lg font-bold text-white">
                        <span>Win Battle</span>
                        <span className="text-gray-600">→</span>
                        <span>Share Replay (Gif)</span>
                        <span className="text-gray-600">→</span>
                        <span>Earn &quot;Street Cred&quot; Token</span>
                        <span className="text-gray-600">→</span>
                        <span>Upgrade Agent</span>
                    </div>
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}
