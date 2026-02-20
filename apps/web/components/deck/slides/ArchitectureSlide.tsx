'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { ArrowDown } from 'lucide-react'

// Helper components
function ArchBox({ label, sub, color }: { label: string, sub: string, color: string }) {
    return (
        <motion.div
            variants={itemVariants}
            className={`border ${color} bg-black/60 backdrop-blur-md p-4 text-center clip-corner-tr hover:bg-black/80 transition-colors cursor-default`}
        >
            <div className="text-sm md:text-base font-bold uppercase tracking-wider text-white">
                {label}
            </div>
            <div className="text-xs text-gray-500 mt-1">{sub}</div>
        </motion.div>
    )
}

function Arrow() {
    return (
        <motion.div variants={itemVariants} className="flex justify-center items-center py-2">
            <ArrowDown className="text-[#FCEE0A]/40 w-6 h-6 animate-bounce" />
        </motion.div>
    )
}

export function ArchitectureSlide() {
    return (
        <MotionSlide id="slide-arch">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-3xl mx-auto"
            >
                <div className="text-center mb-14">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Architecture
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        The <span className="text-[#FCEE0A]">System</span> Diagram
                    </motion.h2>
                </div>

                <div className="space-y-2">
                    <ArchBox label="Client (Web / Mobile)" sub="React Three Fiber · Next.js 14" color="border-[#FCEE0A]/50" />
                    <Arrow />
                    <ArchBox label="Yellow Channel Layer" sub="Nitrolite SDK · Off-chain micro-actions · P2P state" color="border-[#FCEE0A]" />
                    <Arrow />
                    <div className="grid grid-cols-2 gap-4">
                        <ArchBox label="AI Orchestrator" sub="Llama-3 · Agent personalities" color="border-[#00F0FF]/50" />
                        <ArchBox label="Backend Sim" sub="Matchmaking · Session mgmt" color="border-[#00F0FF]/30" />
                    </div>
                    <Arrow />
                    <div className="grid grid-cols-2 gap-4">
                        <ArchBox label="On-Chain Settlement" sub="Yellow contracts · Uniswap v4" color="border-[#FF00FF]/40" />
                        <ArchBox label="Registry & Identity" sub="ENS names · ERC-8004" color="border-[#FF00FF]/40" />
                    </div>
                </div>
            </motion.div>
        </MotionSlide>
    )
}
