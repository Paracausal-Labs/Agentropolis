'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Trophy, Rocket, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SummarySlide() {
    return (
        <MotionSlide id="slide-summary">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-6xl mx-auto"
            >
                <div className="text-center mb-14">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        TL;DR
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        Everything in <span className="text-[#FCEE0A]">20 Seconds</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            label: 'What We Built',
                            hint: 'HackMoney 2026',
                            Icon: Trophy,
                            color: 'border-[#FCEE0A]/40',
                            title: 'Award-Winning MVP',
                            body: 'Playable 3D city with AI Council, Uniswap v4 hooks, ENS identity, and basic Yellow state-channel integration. Live on Base Sepolia.',
                            iconColor: 'text-[#FCEE0A]'
                        },
                        {
                            label: 'What We Ship',
                            hint: '90 Days',
                            Icon: Rocket,
                            color: 'border-[#00F0FF]/40',
                            title: 'SimCity for DeFi',
                            body: 'Full game loop, economy v1, Agent Battle Mode, and multiplayer — all powered by Yellow state channels as the game transaction bus.',
                            iconColor: 'text-[#00F0FF]'
                        },
                        {
                            label: 'The Partnership',
                            hint: 'Yellow Network',
                            Icon: Zap,
                            color: 'border-[#FF00FF]/40', // Changed to Pink as per branding tri-color usually, but stick to deck colors
                            title: 'Flagship Use Case',
                            body: 'We drive high-frequency channel volume. Yellow provides the Clearnet rails that make real-time on-chain gameplay possible at scale.',
                            iconColor: 'text-[#FF00FF]'
                        },
                    ].map(({ label, hint, Icon, color, title, body, iconColor }) => (
                        <motion.div
                            key={label}
                            variants={itemVariants}
                            className={cn(
                                "border bg-black/50 backdrop-blur-md p-8 space-y-4 clip-corner-tr hover:bg-black/70 transition-colors",
                                color
                            )}
                        >
                            <Icon className={cn("w-10 h-10 mb-4", iconColor)} />
                            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">{hint}</div>
                            <div className="text-sm font-bold text-[#FCEE0A] uppercase tracking-wider">{label}</div>
                            <div className="text-xl font-bold text-white">{title}</div>
                            <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </MotionSlide>
    )
}
