'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { cn } from '@/lib/utils'

export function GameLoopsSlide() {
    return (
        <MotionSlide id="slide-loops">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-5xl mx-auto"
            >
                <div className="text-center mb-14">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Core Loops
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        Making it Feel Like <span className="text-[#FCEE0A]">a Game</span>
                    </motion.h2>
                </div>

                <div className="space-y-6">
                    {[
                        {
                            num: '01',
                            title: 'Build Loop',
                            sub: 'The Engine',
                            action: 'Build a "Market Maker Tower"',
                            mechanism: 'Channel micro-payments for upkeep · On-chain NFT for ownership',
                            badge: 'CHANNEL',
                            badgeColor: 'text-[#FCEE0A] border-[#FCEE0A]/40',
                        },
                        {
                            num: '02',
                            title: 'Council Loop',
                            sub: 'The Strategy',
                            action: '"Should I buy ETH?" → Agents Debate → Proposal generated',
                            mechanism: 'AI inference (off-chain) → User sign (on-chain / channel)',
                            badge: 'AI + CHAIN',
                            badgeColor: 'text-[#00F0FF] border-[#00F0FF]/40',
                        },
                        {
                            num: '03',
                            title: 'Economy Loop',
                            sub: 'The Meta',
                            action: 'Craft "Alpha Goggles" → Upgrade Agent Stats → Win Tournaments',
                            mechanism: 'Marketplace trades settled via Yellow channels — gas-free',
                            badge: 'CHANNEL',
                            badgeColor: 'text-[#FF00FF] border-[#FF00FF]/40',
                        },
                    ].map(({ num, title, sub, action, mechanism, badge, badgeColor }) => (
                        <motion.div
                            key={num}
                            variants={itemVariants}
                            className="grid grid-cols-[auto_1fr_auto] items-center gap-8 border border-[#FCEE0A]/10 bg-black/40 backdrop-blur-md p-6 md:p-8 hover:bg-black/60 transition-colors"
                        >
                            <div className="text-5xl font-black text-[#FCEE0A]/20 font-mono w-12">{num}</div>
                            <div>
                                <div className="text-xs font-mono text-gray-600 uppercase tracking-widest">{sub}</div>
                                <div className="text-xl font-bold text-white mt-1">{title}</div>
                                <div className="text-[#FCEE0A] text-sm mt-3 font-mono">{action}</div>
                                <div className="text-gray-500 text-xs mt-1">{mechanism}</div>
                            </div>
                            <div
                                className={cn(
                                    "border px-3 py-1 text-xs font-mono uppercase tracking-widest shrink-0 hidden md:block",
                                    badgeColor
                                )}
                            >
                                {badge}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </MotionSlide>
    )
}
