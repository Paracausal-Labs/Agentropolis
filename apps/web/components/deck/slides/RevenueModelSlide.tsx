'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Wallet, Store, Trophy, Gem } from 'lucide-react'

export function RevenueModelSlide() {
    return (
        <MotionSlide id="slide-revenue">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="relative z-20 w-full max-w-5xl mx-auto"
            >
                <div className="text-center mb-12">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Business Model
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4 leading-none">
                        Revenue Model
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Trading Fees */}
                    <motion.div variants={itemVariants} className="border border-[#FCEE0A]/30 bg-[#FCEE0A]/5 backdrop-blur-md p-8 clip-corner-tr group hover:border-[#FCEE0A] transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-black/40 border border-[#FCEE0A]/30 text-[#FCEE0A]">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Trading Fees <span className="text-[#FCEE0A] text-sm">(Primary)</span></h3>
                        </div>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex gap-2">
                                <span className="text-[#FCEE0A]">►</span> 0.1 to 0.5% dynamic fee via CouncilFeeHook
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FCEE0A]">►</span> fee adjusts to market conditions and agent consensus
                            </li>
                        </ul>
                    </motion.div>

                    {/* Marketplace Cut */}
                    <motion.div variants={itemVariants} className="border border-[#00F0FF]/30 bg-[#00F0FF]/5 backdrop-blur-md p-8 clip-corner-tl group hover:border-[#00F0FF] transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-black/40 border border-[#00F0FF]/30 text-[#00F0FF]">
                                <Store className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Marketplace Cut</h3>
                        </div>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex gap-2">
                                <span className="text-[#00F0FF]">►</span> 2.5% platform fee on rentals, strategy NFTs, cosmetics
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#00F0FF]">►</span> ERC-2981 royalties for creators
                            </li>
                        </ul>
                    </motion.div>

                    {/* Tournament Fees */}
                    <motion.div variants={itemVariants} className="border border-[#FF00FF]/30 bg-[#FF00FF]/5 backdrop-blur-md p-8 clip-corner-bl group hover:border-[#FF00FF] transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-black/40 border border-[#FF00FF]/30 text-[#FF00FF]">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Tournament Fees</h3>
                        </div>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex gap-2">
                                <span className="text-[#FF00FF]">►</span> 10% of prize pool
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FF00FF]">►</span> 90% distributed to winners
                            </li>
                        </ul>
                    </motion.div>

                    {/* Premium Agents */}
                    <motion.div variants={itemVariants} className="border border-white/10 bg-white/5 backdrop-blur-md p-8 clip-corner-br group hover:border-white transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-black/40 border border-white/30 text-white">
                                <Gem className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Premium Agents</h3>
                        </div>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex gap-2">
                                <span className="text-gray-400">►</span> Curated, high-performance templates
                            </li>
                            <li className="flex gap-2">
                                <span className="text-gray-400">►</span> subscription or flat fee model
                            </li>
                        </ul>
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="text-center">
                    <div className="inline-block border border-white/10 bg-black/60 p-6 max-w-3xl">
                        <h4 className="text-[#FCEE0A] text-xs font-mono uppercase tracking-widest mb-3">How funds flow</h4>
                        <p className="text-gray-300 md:text-lg">
                            User funds move through Yellow channels into trades, marketplace actions, and tournament entries.
                            Revenue is collected automatically at the protocol rails and marketplace layer.
                        </p>
                    </div>
                </motion.div>

            </motion.div>
        </MotionSlide>
    )
}
