'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Bot, Map, Zap, Package, Award, Target } from 'lucide-react'

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
                        Proof of Work
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        <span className="text-[#FCEE0A]">HackMoney 2026</span> Winner
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Proof items */}
                    <div className="space-y-4">
                        <motion.div variants={itemVariants} className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">What We Delivered</motion.div>
                        {[
                            {
                                Icon: Bot,
                                title: 'AI Council Deliberation',
                                body: 'Real-time Llama-3.3-70b debate loop — 5 agents with distinct personalities.',
                            },
                            {
                                Icon: Map,
                                title: 'City-Building Loop',
                                body: 'Isometric 3D environment built with React Three Fiber + procedural rendering.',
                            },
                            {
                                Icon: Zap,
                                title: 'Yellow Integration',
                                body: 'Working Nitrolite state channel for agent fees and session management.',
                            },
                            {
                                Icon: Package,
                                title: 'Live Repo',
                                body: 'Turborepo (Next.js 14 + Foundry). Runnable in minutes.',
                            },
                        ].map(({ Icon, title, body }) => (
                            <motion.div key={title} variants={itemVariants} className="flex items-start gap-4 border border-[#FCEE0A]/10 bg-black/30 p-4 hover:bg-black/50 transition-colors">
                                <Icon className="w-6 h-6 text-gray-400 shrink-0" />
                                <div>
                                    <div className="font-bold text-white text-sm">{title}</div>
                                    <div className="text-gray-500 text-xs mt-1">{body}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Awards */}
                    <div className="space-y-6">
                        <motion.div variants={itemVariants} className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">Awards Won</motion.div>

                        <motion.div variants={itemVariants} className="border border-[#FCEE0A]/40 bg-black/40 p-8 clip-corner-tr space-y-3 backdrop-blur-md">
                            <Award className="w-10 h-10 text-[#FCEE0A]" />
                            <div className="text-[#FCEE0A] text-sm font-mono uppercase tracking-widest">1st Place</div>
                            <div className="text-xl font-bold text-white leading-snug">
                                Yellow Network — Integrate Yellow SDK
                            </div>
                            <div className="text-gray-500 text-sm">Trading apps / Prediction markets / Marketplaces</div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="border border-[#00F0FF]/30 bg-black/40 p-8 clip-corner-tr space-y-3 backdrop-blur-md">
                            <Target className="w-10 h-10 text-[#00F0FF]" />
                            <div className="text-[#00F0FF] text-sm font-mono uppercase tracking-widest">Prize Pool</div>
                            <div className="text-xl font-bold text-white leading-snug">ENS — Integrate ENS</div>
                            <div className="text-gray-500 text-sm">Agent discovery via ENS text records</div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </MotionSlide>
    )
}
