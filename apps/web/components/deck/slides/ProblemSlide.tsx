'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'

export function ProblemSlide() {
    return (
        <MotionSlide id="slide-problem">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-5xl mx-auto"
            >
                <div className="text-center mb-14">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        The Problem
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        Why Most On-Chain <span className="text-[#FCEE0A]">Games Fail</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            num: '01',
                            title: 'Slow & Expensive',
                            body: 'On-chain transactions kill game feel. You wait 15 seconds every time you want to farm a resource or make a move.',
                            stat: '15s+',
                            statLabel: 'avg settlement time',
                        },
                        {
                            num: '02',
                            title: 'No Micro-Economy',
                            body: 'Real game economies need millions of micro-transactions. Public blockchains simply cannot handle this load at this price.',
                            stat: '$2–$20',
                            statLabel: 'gas per action',
                        },
                        {
                            num: '03',
                            title: 'Multiplayer Breaks',
                            body: 'Real-time interaction is impossible with 12-second block times. P2P battles and live economies need near-zero latency.',
                            stat: '0',
                            statLabel: 'viable on-chain games today',
                        },
                    ].map(({ num, title, body, stat, statLabel }) => (
                        <motion.div
                            key={num}
                            variants={itemVariants}
                            className="border border-[#FF00FF]/20 bg-black/40 backdrop-blur-md p-8 clip-corner-tr space-y-4 hover:border-[#FF00FF]/40 transition-colors"
                        >
                            <div className="text-5xl font-black text-[#FF00FF]/20 font-mono">{num}</div>
                            <div className="text-xl font-bold text-white uppercase tracking-wide">{title}</div>
                            <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                            <div className="pt-4 border-t border-[#FF00FF]/20">
                                <div className="text-2xl font-black text-[#FF00FF]">{stat}</div>
                                <div className="text-xs text-gray-600 uppercase tracking-widest mt-1">{statLabel}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    variants={itemVariants}
                    className="text-center text-gray-500 text-sm font-mono uppercase tracking-widest mt-12"
                >
                    Games need instant micro-actions with credible settlement — a problem only state channels solve.
                </motion.p>
            </motion.div>
        </MotionSlide>
    )
}
