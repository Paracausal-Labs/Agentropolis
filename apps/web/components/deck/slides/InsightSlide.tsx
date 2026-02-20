'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { X, Check } from 'lucide-react'

export function InsightSlide() {
    return (
        <MotionSlide id="slide-insight">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-5xl mx-auto"
            >
                <div className="text-center mb-14">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        The Insight
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        State Channels as the{' '}
                        <span className="text-[#FCEE0A]">&quot;Game Bus&quot;</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Left: old way */}
                    <motion.div
                        variants={itemVariants}
                        className="border border-[#FF00FF]/30 bg-black/40 p-8 clip-corner-tr backdrop-blur-md"
                    >
                        <div className="flex items-center gap-2 text-xs font-mono text-[#FF00FF] uppercase tracking-widest mb-4">
                            <X className="w-4 h-4" /> On-Chain Traffic Jam
                        </div>
                        <div className="space-y-4">
                            {[
                                'Sign TX → Broadcast → Mempool → Mined → 15s',
                                'Gas fee on every interaction',
                                'Users wait. Game loop breaks. Players leave.',
                            ].map((s, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm text-gray-500">
                                    <span className="text-[#FF00FF]/50 mt-1">◆</span>
                                    <span>{s}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Yellow way */}
                    <motion.div
                        variants={itemVariants}
                        className="border border-[#FCEE0A]/40 bg-black/40 p-8 clip-corner-tr backdrop-blur-md"
                    >
                        <div className="flex items-center gap-2 text-xs font-mono text-[#FCEE0A] uppercase tracking-widest mb-4">
                            <Check className="w-4 h-4" /> Yellow High-Speed Rail
                        </div>
                        <div className="space-y-4">
                            {[
                                'Action → State signed off-chain → Instant',
                                'Pay gas only when settling (open/close channel)',
                                '1,000s of actions per second. Real game economies.',
                            ].map((s, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <span className="text-[#FCEE0A] mt-1">◆</span>
                                    <span>{s}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Three pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'High-Frequency', body: 'Farming, trading, signalling — all off-chain' },
                        { label: 'Settle on Need', body: 'Only touch chain at channel open/close' },
                        { label: 'Real-Time PvP', body: 'Cryptographic guarantees, zero latency' },
                    ].map(({ label, body }) => (
                        <motion.div
                            key={label}
                            variants={itemVariants}
                            className="text-center border-t border-[#FCEE0A]/30 pt-6"
                        >
                            <div className="text-sm font-bold text-[#FCEE0A] uppercase tracking-wider">{label}</div>
                            <div className="text-xs text-gray-600 mt-2">{body}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </MotionSlide>
    )
}
