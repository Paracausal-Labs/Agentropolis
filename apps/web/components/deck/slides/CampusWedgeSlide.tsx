'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Users, Component, Flame, Target } from 'lucide-react'

export function CampusWedgeSlide() {
    return (
        <MotionSlide id="slide-campus">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="relative z-20 w-full max-w-6xl mx-auto"
            >
                <div className="text-center mb-10 border-b border-white/10 pb-8">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Distribution
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4 leading-none flex flex-col items-center gap-2">
                        <span>Initial Distribution Wedge:</span>
                        <span className="text-[#FCEE0A]">Campus to 5,000 Users</span>
                    </motion.h2>
                    <motion.p variants={itemVariants} className="max-w-xl mx-auto text-center text-gray-400 font-mono tracking-wide text-sm uppercase">
                        Start where we can drive adoption fast with abstracted UX
                    </motion.p>
                </div>

                <motion.p variants={itemVariants} className="max-w-4xl mx-auto text-center text-gray-300 md:text-xl font-medium mb-12 border-l-4 border-r-4 border-[#00F0FF]/50 px-6">
                    We will start with a campus-first launch, showing the product to students who are not crypto-native. The UX is abstracted, low-ticket, and visually engaging, which makes it ideal for first-time users.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Strategy */}
                    <motion.div variants={itemVariants} className="border border-white/10 bg-black/60 backdrop-blur-md p-8 clip-corner-tl group hover:border-white/30 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <Users className="w-6 h-6 text-[#00F0FF]" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Entry Strategy</h3>
                        </div>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex gap-2"><span className="text-[#00F0FF]">►</span> Campus demos and communities</li>
                            <li className="flex gap-2"><span className="text-[#00F0FF]">►</span> Clubs and student groups</li>
                            <li className="flex gap-2"><span className="text-[#00F0FF]">►</span> Trading and tech circles</li>
                            <li className="flex gap-2"><span className="text-[#00F0FF]">►</span> Referral-driven onboarding</li>
                        </ul>
                    </motion.div>

                    {/* Product Setup */}
                    <motion.div variants={itemVariants} className="border border-[#FCEE0A]/30 bg-[#FCEE0A]/5 backdrop-blur-md p-8 clip-corner-tr group hover:border-[#FCEE0A] transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <Component className="w-6 h-6 text-[#FCEE0A]" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Product Setup for Non-Crypto</h3>
                        </div>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex gap-2"><span className="text-[#FCEE0A]">►</span> Default agents ready to use</li>
                            <li className="flex gap-2"><span className="text-[#FCEE0A]">►</span> Low deposit sizes ($10 to $25)</li>
                            <li className="flex gap-2"><span className="text-[#FCEE0A]">►</span> Simple risk sliders</li>
                            <li className="flex gap-2"><span className="text-[#FCEE0A]">►</span> Session-key style UX with minimal repeated signing</li>
                            <li className="flex gap-2"><span className="text-[#FCEE0A]">►</span> City progression for retention</li>
                        </ul>
                    </motion.div>

                    {/* Engagement Loops */}
                    <motion.div variants={itemVariants} className="border border-[#FF00FF]/30 bg-[#FF00FF]/5 backdrop-blur-md p-8 clip-corner-bl group hover:border-[#FF00FF] transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <Flame className="w-6 h-6 text-[#FF00FF]" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Engagement Loops</h3>
                        </div>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex gap-2"><span className="text-[#FF00FF]">►</span> Weekly campus tournaments</li>
                            <li className="flex gap-2"><span className="text-[#FF00FF]">►</span> Leaderboards and social proof</li>
                            <li className="flex gap-2"><span className="text-[#FF00FF]">►</span> Daily missions and streaks</li>
                            <li className="flex gap-2"><span className="text-[#FF00FF]">►</span> Cosmetic rewards and badges</li>
                        </ul>
                    </motion.div>

                    {/* KPI Targets */}
                    <motion.div variants={itemVariants} className="border border-white/10 bg-black/60 backdrop-blur-md p-8 clip-corner-br hidden md:block">
                        <div className="flex items-center gap-4 mb-6">
                            <Target className="w-6 h-6 text-white" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">KPI Targets</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {[
                                "Wallet creation rate",
                                "First deposit conversion",
                                "First trade conversion",
                                "D7 retention",
                                "Tournament entry rate",
                                "Avg tx/user/day",
                                "Session duration",
                                "Marketplace conversion"
                            ].map((kpi, i) => (
                                <span key={i} className="border border-white/20 bg-white/5 px-3 py-1 text-xs font-mono text-gray-300 uppercase whitespace-nowrap">
                                    {kpi}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="text-center">
                    <p className="text-[#FCEE0A] text-xs font-mono uppercase tracking-widest border border-[#FCEE0A]/30 bg-[#FCEE0A]/10 px-4 py-2 inline-block shadow-[0_0_15px_rgba(252,238,10,0.15)]">
                        This is not a generic growth plan. It is a practical wedge for getting the first 1,000 to 5,000 users quickly.
                    </p>
                </motion.div>

            </motion.div>
        </MotionSlide>
    )
}
