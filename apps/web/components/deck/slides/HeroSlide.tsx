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
                        Built for Yellow Track · HackMoney 2026 Winner
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
                    className="text-lg md:text-2xl text-gray-400 tracking-wide font-medium mt-6 max-w-2xl"
                >
                    AI-agent city builder{' '}
                    <span className="text-[#FCEE0A]">+</span> on-chain economy powered by{' '}
                    <span className="text-[#FCEE0A]">Yellow state channels</span>
                </motion.p>

                <motion.div
                    variants={itemVariants}
                    className="flex gap-6 mt-14 text-xs font-mono text-gray-600 uppercase tracking-widest"
                >
                    <span>
                        <span className="text-[#FCEE0A]">CHAIN:</span> BASE SEPOLIA
                    </span>
                    <span className="text-[#FCEE0A]/40">|</span>
                    <span>
                        <span className="text-[#FCEE0A]">SETTLEMENT:</span> YELLOW
                    </span>
                    <span className="text-[#FCEE0A]/40">|</span>
                    <span>
                        <span className="text-[#FCEE0A]">AI:</span> LLAMA-3 / GROQ
                    </span>
                </motion.div>

                {/* scroll hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4, y: [0, 10, 0] }}
                    transition={{ delay: 2, duration: 2, repeat: Infinity }}
                    className="absolute bottom-[-8rem] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-xs font-mono uppercase tracking-widest text-gray-500">Scroll</span>
                    <ArrowDown className="w-4 h-4 text-[#FCEE0A]" />
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}
