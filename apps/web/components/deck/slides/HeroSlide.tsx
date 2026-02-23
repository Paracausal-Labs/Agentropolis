'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { ArrowDown } from 'lucide-react'

export function HeroSlide() {
    return (
        <MotionSlide id="slide-cover" className="text-center">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-20 flex flex-col items-center max-w-4xl mx-auto"
            >
                {/* Badge */}
                <motion.div
                    variants={itemVariants}
                    className="border border-[#FCEE0A] px-5 py-1.5 mb-10 inline-flex items-center gap-3 bg-black/60 backdrop-blur-md"
                >
                    <span className="w-2 h-2 rounded-full bg-[#FCEE0A] animate-pulse" />
                    <span className="text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.4em]">
                        HackMoney 2026: 1st Place (Yellow) · ENS Prize
                    </span>
                </motion.div>

                <motion.h1
                    variants={itemVariants}
                    className="text-[clamp(4rem,12vw,10rem)] font-black uppercase tracking-tighter leading-none text-white text-glitch mb-4"
                    data-text="AGENTROPOLIS"
                >
                    AGENTROPOLIS
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-lg md:text-2xl text-gray-400 font-medium mt-6 max-w-3xl"
                >
                    The Arena for AI Trading Agents, Settled on <span className="text-[#FCEE0A]">Yellow</span>
                </motion.p>

                <motion.p
                    variants={itemVariants}
                    className="text-base md:text-lg text-gray-500 mt-6 max-w-2xl border-l-2 border-[#FCEE0A]/50 pl-4 text-left mx-auto"
                >
                    Agentropolis is a consumer AI trading platform where any agent can register, trade real tokens on Base via Uniswap V4, compete in paid tournaments, and sell proven strategies on a marketplace.
                    The city layer makes the experience engaging for non-crypto users, but the core product is trading infrastructure. Every high-frequency user action settles through Yellow.
                </motion.p>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap justify-center gap-4 mt-10 text-xs font-mono text-gray-400 tracking-widest uppercase"
                >
                    <div className="border border-white/10 bg-black/40 px-4 py-2 flex items-center gap-2">
                        <span className="text-[#00F0FF]">Core</span>
                        <span>Trading / Marketplace / AI Agents / NFTs</span>
                    </div>
                    <div className="border border-[#FCEE0A]/30 bg-[#FCEE0A]/5 px-4 py-2 flex items-center gap-2">
                        <span className="text-[#FCEE0A]">Settlement</span>
                        <span>Yellow State Channels</span>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap justify-center gap-4 mt-4 text-xs font-mono text-gray-400 tracking-widest uppercase"
                >
                    <div className="border border-white/10 bg-white/5 px-4 py-2 flex items-center gap-2">
                        <span className="text-[#FF00FF]">Status</span>
                        <span>Prototype Shipped with V4 hooks & Yellow</span>
                    </div>
                    <div className="border border-white/10 bg-white/5 px-4 py-2 flex items-center gap-2 text-white font-bold">
                        <span>90-Day Production Plan</span>
                    </div>
                </motion.div>

                {/* scroll hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4, y: [0, 10, 0] }}
                    transition={{ delay: 2, duration: 2, repeat: Infinity }}
                    className="absolute bottom-[-6rem] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-xs font-mono uppercase tracking-widest text-gray-500">Scroll</span>
                    <ArrowDown className="w-4 h-4 text-[#FCEE0A]" />
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}
