'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Handshake, HeartHandshake } from 'lucide-react'

export function PartnershipAskSlide() {
    return (
        <MotionSlide id="slide-partnership">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-6xl mx-auto"
            >
                <div className="text-center mb-16">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Ecosystem Alignment
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-2 leading-none">
                        Why This Is a <span className="text-[#FCEE0A]">Strong Yellow Bet</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* What Yellow Gets */}
                    <motion.div variants={itemVariants} className="border border-[#FCEE0A]/30 bg-black/60 backdrop-blur-md p-10 clip-corner-tl group hover:border-[#FCEE0A]">
                        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                            <Handshake className="w-8 h-8 text-[#FCEE0A]" />
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">What Yellow Gets</h3>
                        </div>
                        <ul className="space-y-4 text-gray-300 md:text-lg">
                            <li className="flex gap-3"><span className="text-[#FCEE0A]">►</span> High-frequency consumer transaction volume</li>
                            <li className="flex gap-3"><span className="text-[#FCEE0A]">►</span> Real TVL in channels (USDC for trading and tournaments)</li>
                            <li className="flex gap-3"><span className="text-[#FCEE0A]">►</span> Showcase app for AI agents + trading + marketplace</li>
                            <li className="flex gap-3"><span className="text-[#FCEE0A]">►</span> Developer inflow through our open Agent API</li>
                            <li className="flex gap-3"><span className="text-[#FCEE0A]">►</span> A strong story for Yellow ecosystem marketing</li>
                        </ul>
                    </motion.div>

                    {/* What We Need */}
                    <motion.div variants={itemVariants} className="border border-[#00F0FF]/30 bg-black/60 backdrop-blur-md p-10 clip-corner-br group hover:border-[#00F0FF]">
                        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                            <HeartHandshake className="w-8 h-8 text-[#00F0FF]" />
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">What We Need</h3>
                        </div>
                        <ul className="space-y-4 text-gray-300 md:text-lg">
                            <li className="flex gap-3"><span className="text-[#00F0FF]">►</span> Grant funding for 90-day buildout</li>
                            <li className="flex gap-3"><span className="text-[#00F0FF]">►</span> Production clearnode access</li>
                            <li className="flex gap-3"><span className="text-[#00F0FF]">►</span> Technical support on mainnet channel lifecycle</li>
                            <li className="flex gap-3"><span className="text-[#00F0FF]">►</span> Co-marketing at launch</li>
                            <li className="flex gap-3"><span className="text-[#00F0FF]">►</span> Eligibility for mainnet deployment bonus ($300)</li>
                        </ul>
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="text-center">
                    <div className="border border-[#FCEE0A] bg-[#FCEE0A]/10 p-6 md:p-8 max-w-4xl mx-auto shadow-[0_0_40px_rgba(252,238,10,0.15)] clip-corner-tl clip-corner-br">
                        <p className="text-white md:text-xl font-medium leading-relaxed">
                            Agentropolis can become the first flagship consumer AI trading app on Yellow,
                            with a clear path to real usage, real transactions, and a <span className="text-[#FCEE0A] font-bold">repeatable ecosystem narrative.</span>
                        </p>
                    </div>
                </motion.div>

            </motion.div>
        </MotionSlide>
    )
}
