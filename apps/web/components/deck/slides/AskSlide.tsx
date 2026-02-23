'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { PieChart, Info, Layers } from 'lucide-react'

export function AskSlide() {
    return (
        <MotionSlide id="slide-ask">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-5xl mx-auto"
            >
                <div className="text-center mb-10">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        The Offer
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                        Funding Ask & <span className="text-[#FCEE0A]">Use of Funds</span>
                    </motion.h2>
                </div>

                <motion.div variants={itemVariants} className="flex justify-center mb-10">
                    <div className="border border-[#FCEE0A] bg-[#FCEE0A]/10 backdrop-blur-md p-8 text-center min-w-[300px] shadow-[0_0_30px_rgba(252,238,10,0.15)] clip-corner-tr relative">
                        <div className="absolute top-2 left-2 flex gap-1">
                            <div className="w-1.5 h-1.5 bg-[#FCEE0A]"></div>
                            <div className="w-1.5 h-1.5 bg-[#FCEE0A]"></div>
                        </div>
                        <h3 className="text-gray-300 font-mono text-sm tracking-widest uppercase mb-2">Grant Ask</h3>
                        <div className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2">$25,000</div>
                        <div className="text-[#FCEE0A] font-bold text-lg uppercase tracking-wider">For 90 Days</div>

                        <div className="mt-6 flex flex-col gap-2 border-t border-[#FCEE0A]/30 pt-4">
                            <div className="text-gray-400 text-xs flex items-center justify-center gap-1">
                                <Info className="w-3 h-3 text-[#FCEE0A]" /> Optional milestone tranche structure available
                            </div>
                            <div className="text-[#00F0FF] text-xs flex items-center justify-center gap-1">
                                <Layers className="w-3 h-3 text-[#00F0FF]" /> Includes eligibility for Mainnet Deployment Bonus ($300)
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Tranches */}
                    <motion.div variants={itemVariants} className="space-y-3">
                        <div className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-4">Milestone Tranches Options</div>

                        <div className="border border-white/10 bg-black/40 p-4 flex gap-4 items-center">
                            <div className="text-[#00F0FF] font-bold text-xl md:text-2xl w-24">$10k</div>
                            <div className="flex-1">
                                <div className="text-white font-bold text-sm">Tranche 1</div>
                                <div className="text-gray-400 text-xs">Yellow prod integration, Base mainnet trading path, core channels and sessions live</div>
                            </div>
                        </div>

                        <div className="border border-[#FCEE0A]/30 bg-black/40 p-4 flex gap-4 items-center">
                            <div className="text-[#FCEE0A] font-bold text-xl md:text-2xl w-24">$8k</div>
                            <div className="flex-1">
                                <div className="text-white font-bold text-sm">Tranche 2</div>
                                <div className="text-gray-400 text-xs">Marketplace and tournaments live, performance oracle and agent registry</div>
                            </div>
                        </div>

                        <div className="border border-[#FF00FF]/30 bg-black/40 p-4 flex gap-4 items-center">
                            <div className="text-[#FF00FF] font-bold text-xl md:text-2xl w-24">$7k</div>
                            <div className="flex-1">
                                <div className="text-white font-bold text-sm">Tranche 3</div>
                                <div className="text-gray-400 text-xs">Public launch, growth dashboard, user and tx milestones</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Use of Funds Table */}
                    <motion.div variants={itemVariants} className="border border-white/10 bg-white/5 p-6 clip-corner-tl flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-gray-400 font-mono text-xs uppercase tracking-widest mb-6">
                            <PieChart className="w-4 h-4" /> Use of Funds Breakdown
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white font-bold">Engineering (60%)</span>
                                </div>
                                <div className="w-full bg-black/60 h-2 rounded"><div className="bg-[#00F0FF] h-full w-[60%]"></div></div>
                                <div className="text-xs text-gray-500 mt-1">2 to 3 developers for 2 to 3 months, contracts, API, frontend, integrations</div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white font-bold">Infrastructure (20%)</span>
                                </div>
                                <div className="w-full bg-black/60 h-2 rounded"><div className="bg-[#FCEE0A] h-full w-[20%]"></div></div>
                                <div className="text-xs text-gray-500 mt-1">Base RPC, DB, IPFS, inference credits, hosting</div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-bold">Tournament Seeding (10%)</span>
                                    </div>
                                    <div className="w-full bg-black/60 h-2 rounded"><div className="bg-[#FF00FF] h-full w-[10%]"></div></div>
                                    <div className="text-[10px] text-gray-500 mt-1">Bootstrap prize pools and early participation</div>
                                </div>
                                <div className="w-1/2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-bold">Marketing (10%)</span>
                                    </div>
                                    <div className="w-full bg-black/60 h-2 rounded"><div className="bg-white h-full w-[10%]"></div></div>
                                    <div className="text-[10px] text-gray-500 mt-1">Builder content, campus distribution, co-marketing</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="text-center">
                    <p className="text-white text-sm md:text-base font-medium px-4 py-3 bg-white/5 border border-white/10 inline-block shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                        Every dollar of infra and tournament spend <span className="text-[#FCEE0A] font-bold">directly increases Yellow ecosystem activity.</span>
                    </p>
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}
