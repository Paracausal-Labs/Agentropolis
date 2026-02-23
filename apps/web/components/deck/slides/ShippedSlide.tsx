'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Trophy, Code2, Cpu } from 'lucide-react'

export function ShippedSlide() {
    return (
        <MotionSlide id="slide-shipped">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-5xl mx-auto"
            >
                <div className="text-center mb-14">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Traction
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        Why We Can <span className="text-[#FCEE0A]">Ship This</span> in 90 Days
                    </motion.h2>
                    <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-lg text-gray-400">
                        We are a 3-person team at <strong className="text-white">Paracausal Labs</strong> with a working prototype, a shipped deck, and direct feedback from Yellow DevRel. We already proved execution speed by shipping a full prototype in a hackathon and winning the Yellow track.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div variants={itemVariants} className="border border-white/10 bg-black/40 backdrop-blur-md p-6 flex flex-col items-center text-center clip-corner-tl group hover:border-[#00F0FF]/50 transition-colors">
                        <UsersIcon className="w-8 h-8 text-[#00F0FF] mb-4" />
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">The Team</h3>
                        <p className="text-[#00F0FF] font-mono text-xs uppercase tracking-widest">Paracausal Labs</p>
                        <p className="text-gray-400 text-sm mt-3">Team of 3 dedicated engineers.</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="border border-[#FCEE0A]/30 bg-[#FCEE0A]/5 backdrop-blur-md p-6 flex flex-col items-center text-center group hover:border-[#FCEE0A] transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-[#FCEE0A]/10 -rotate-45 translate-x-6 -translate-y-6" />
                        <Trophy className="w-8 h-8 text-[#FCEE0A] mb-4" />
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Hackathon Winner</h3>
                        <p className="text-[#FCEE0A] font-mono text-xs uppercase tracking-widest">HackMoney 2026</p>
                        <p className="text-gray-300 text-sm mt-3 font-medium">1st Place (Yellow Track)</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="border border-[#FF00FF]/30 bg-[#FF00FF]/5 backdrop-blur-md p-6 flex flex-col items-center text-center group hover:border-[#FF00FF] transition-colors">
                        <Code2 className="w-8 h-8 text-[#FF00FF] mb-4" />
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">ENS Prize</h3>
                        <p className="text-[#FF00FF] font-mono text-xs uppercase tracking-widest">HackMoney 2026</p>
                        <p className="text-gray-300 text-sm mt-3">Identity integration proven.</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="border border-white/10 bg-black/40 backdrop-blur-md p-6 flex flex-col items-center text-center clip-corner-br group hover:border-white/50 transition-colors">
                        <Cpu className="w-8 h-8 text-white mb-4" />
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Shipped Core</h3>
                        <ul className="text-gray-400 text-sm space-y-2 text-left w-full">
                            <li className="flex gap-2"><span>•</span> 3 custom Uniswap V4 hooks</li>
                            <li className="flex gap-2"><span>•</span> 5-agent AI council</li>
                            <li className="flex gap-2"><span>•</span> Yellow channel tech</li>
                            <li className="flex gap-2"><span>•</span> UI & App Concept</li>
                        </ul>
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="mt-12 text-center border-t border-b border-white/10 py-8 max-w-3xl mx-auto bg-black/20">
                    <h4 className="text-[#FCEE0A] text-xs font-mono uppercase tracking-widest mb-4">Current Focus for Phase 2</h4>
                    <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base font-bold text-white tracking-widest uppercase">
                        <span>Trading</span>
                        <span className="text-gray-600">|</span>
                        <span>Marketplace</span>
                        <span className="text-gray-600">|</span>
                        <span>AI Agents</span>
                        <span className="text-gray-600">|</span>
                        <span>NFTs</span>
                    </div>
                    <p className="text-gray-500 text-xs font-mono mt-4">with game wrapper retained for onboarding and retention</p>
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}

function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
