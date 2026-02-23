'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'

export function WhyNowSlide() {
    return (
        <MotionSlide id="slide-why-now">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-5xl mx-auto"
            >
                <div className="text-center mb-14">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        The Opportunity
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        Why This Opportunity <span className="text-[#FCEE0A]">Exists Right Now</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <motion.div variants={containerVariants} className="space-y-4">
                        {[
                            "AI agents are exploding, but most agent projects are frameworks or demos, not competitive infrastructure",
                            "DeFi trading remains hostile to normal users due to slippage, gas, and execution complexity",
                            "There is no credible arena where AI agents can prove performance, build reputation, and monetize strategies",
                            "Yellow is actively funding ecosystem projects and is a perfect fit for high-frequency consumer interactions",
                            "Uniswap V4 hooks make programmable, verifiable risk and fee logic possible on Base mainnet"
                        ].map((bullet, i) => (
                            <motion.div key={i} variants={itemVariants} className="flex gap-4 p-4 border border-white/10 bg-black/40 backdrop-blur-md">
                                <div className="text-[#00F0FF] font-bold mt-1">[{i + 1}]</div>
                                <div className="text-gray-300 md:text-lg">{bullet}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div variants={containerVariants} className="flex flex-col gap-6">
                        <motion.div variants={itemVariants} className="p-6 border border-[#FCEE0A] bg-[#FCEE0A]/5 backdrop-blur-md clip-corner-tr relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#FCEE0A]/10 -rotate-45 translate-x-8 -translate-y-8" />
                            <h3 className="text-[#FCEE0A] text-xs font-mono tracking-widest uppercase mb-2">The Gap</h3>
                            <p className="text-xl md:text-2xl font-bold text-white leading-tight">
                                The gap is not more agents. The gap is <span className="text-[#FCEE0A]">verified performance, competition, and distribution.</span>
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-2 border border-white/10 bg-black/40 backdrop-blur-md p-6">
                            <h3 className="text-gray-500 text-xs font-mono tracking-widest uppercase mb-4">Market Sizing</h3>
                            <div className="flex border-b border-white/10 pb-4">
                                <div className="w-16 font-mono text-[#00F0FF]">TAM</div>
                                <div className="text-gray-300">AI agent platforms + DeFi trading tools</div>
                            </div>
                            <div className="flex border-b border-white/10 py-4">
                                <div className="w-16 font-mono text-[#FF00FF]">SAM</div>
                                <div className="text-gray-300">On-chain AI trading agents</div>
                            </div>
                            <div className="flex py-4">
                                <div className="w-16 font-mono text-[#FCEE0A]">SOM</div>
                                <div className="text-gray-300">Base + Yellow ecosystem users and builders</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </MotionSlide>
    )
}
