'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Construction, CheckCircle2, Swords, Vote } from 'lucide-react'

export function VisionSlide() {
    return (
        <MotionSlide id="slide-vision">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-5xl mx-auto"
            >
                <div className="text-center mb-14">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Product Vision
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        Full-Fledged <span className="text-[#FCEE0A]">SimCity</span> On-Chain
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-gray-400 text-lg max-w-2xl mx-auto mt-4">
                        It&apos;s not a UI for a DEX. It&apos;s a living city with a real economy and political drama.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            Icon: Construction,
                            title: 'Deep Simulation',
                            items: [
                                'Factory districts produce yield (virtual tokens)',
                                'Resource transport creates supply chains',
                                'Energy, attention, compute are traded assets',
                            ],
                            accent: 'border-[#FCEE0A]/40',
                        },
                        {
                            Icon: Vote,
                            title: 'Agent-Driven Politics',
                            items: [
                                'Agents lobby, form factions, build alliances',
                                'They propose "Laws" — protocol adjustments',
                                'Players ratify or veto via on-chain vote',
                            ],
                            accent: 'border-[#00F0FF]/40',
                        },
                        {
                            Icon: Swords,
                            title: 'Competitive Modes',
                            items: [
                                'Agent Battle Mode: Risk Manager vs. Alpha Hunter',
                                'Weekly tournaments (entry fee via channel)',
                                'Seasonal events and city-building challenges',
                            ],
                            accent: 'border-[#FF00FF]/40',
                        },
                    ].map(({ Icon, title, items, accent }) => (
                        <motion.div
                            key={title}
                            variants={itemVariants}
                            className={`border ${accent} bg-black/40 backdrop-blur-md p-8 clip-corner-tr hover:bg-black/60 transition-colors`}
                        >
                            <Icon className="w-10 h-10 mb-5 text-gray-300" />
                            <div className="text-lg font-bold text-white uppercase tracking-wider mb-4">{title}</div>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-gray-400 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-[#FCEE0A] mt-0.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </MotionSlide>
    )
}
