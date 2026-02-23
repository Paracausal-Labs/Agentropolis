'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { ServerOff, Database, Zap } from 'lucide-react'

export function WhyYellowSlide() {
    return (
        <MotionSlide id="slide-why-yellow">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="relative z-20 w-full max-w-6xl mx-auto"
            >
                <div className="text-center mb-12">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Infrastructure
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        Why Yellow Is <span className="text-[#FCEE0A]">Not Optional</span> Here
                    </motion.h2>
                    <motion.p variants={itemVariants} className="max-w-xl mx-auto text-center text-gray-300 font-medium">
                        Yellow makes the experience feel Web2 while preserving credible on-chain settlement guarantees.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* On-Chain Only */}
                    <motion.div variants={itemVariants} className="border border-white/10 bg-black/60 backdrop-blur-md p-8 group hover:border-red-500/50 transition-colors opacity-60 hover:opacity-100">
                        <div className="flex flex-col items-center mb-6 text-center">
                            <ServerOff className="w-10 h-10 text-red-500/50 mb-4" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">On-Chain Only</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex gap-2 text-gray-400 text-sm md:text-base"><span className="text-red-500">✕</span> expensive per action</li>
                            <li className="flex gap-2 text-gray-400 text-sm md:text-base"><span className="text-red-500">✕</span> poor UX for high-frequency interactions</li>
                            <li className="flex gap-2 text-gray-400 text-sm md:text-base"><span className="text-red-500">✕</span> constant wallet prompts</li>
                            <li className="flex gap-2 text-gray-400 text-sm md:text-base"><span className="text-red-500">✕</span> hard to support game-like micro-actions</li>
                        </ul>
                    </motion.div>

                    {/* App DB Only */}
                    <motion.div variants={itemVariants} className="border border-white/10 bg-black/60 backdrop-blur-md p-8 group hover:border-[#00F0FF]/50 transition-colors opacity-60 hover:opacity-100">
                        <div className="flex flex-col items-center mb-6 text-center">
                            <Database className="w-10 h-10 text-[#00F0FF]/50 mb-4" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">App DB Only</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex gap-2 text-gray-400 text-sm md:text-base"><span className="text-[#00F0FF]">~</span> fast but not trust-minimized</li>
                            <li className="flex gap-2 text-gray-400 text-sm md:text-base"><span className="text-red-500">✕</span> weak custody guarantees</li>
                            <li className="flex gap-2 text-gray-400 text-sm md:text-base"><span className="text-red-500">✕</span> no credible settlement fallback</li>
                            <li className="flex gap-2 text-gray-400 text-sm md:text-base"><span className="text-red-500">✕</span> no protocol-native proof of activity</li>
                        </ul>
                    </motion.div>

                    {/* Yellow */}
                    <motion.div variants={itemVariants} className="border-2 border-[#FCEE0A] bg-[#FCEE0A]/5 backdrop-blur-md p-8 relative overflow-hidden group hover:bg-[#FCEE0A]/10 transition-colors shadow-[0_0_30px_rgba(252,238,10,0.15)] clip-corner-tr">
                        <div className="flex flex-col items-center mb-6 text-center">
                            <Zap className="w-10 h-10 text-[#FCEE0A] mb-4" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Yellow (Our Path)</h3>
                        </div>
                        <ul className="space-y-3">
                            {[
                                "fast off-chain state updates",
                                "user funds remain in channel custody model",
                                "app sessions for tournaments and shared flows",
                                "on-chain fallback and dispute resolution",
                                "supports high-frequency marketplace + trading actions"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-2 text-gray-200 text-sm md:text-base font-medium">
                                    <span className="text-[#FCEE0A]">✓</span> {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Glossary Strip */}
                <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6 mt-8 p-4 border border-white/10 bg-black/40 text-xs font-mono uppercase tracking-widest text-[#FCEE0A] backdrop-blur-sm">
                    <span className="text-gray-500">Yellow Terms:</span>
                    <span>Clearnode</span>
                    <span className="opacity-40">|</span>
                    <span>Unified Balance</span>
                    <span className="opacity-40">|</span>
                    <span>App Sessions</span>
                    <span className="opacity-40">|</span>
                    <span>Session Keys</span>
                    <span className="opacity-40">|</span>
                    <span>Intents</span>
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}
