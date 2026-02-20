'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Roadmap } from '../Roadmap'

export function RoadmapSlide() {
    return (
        <MotionSlide id="slide-roadmap">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="relative z-20 w-full max-w-6xl mx-auto"
            >
                <div className="text-center mb-14">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Key Slide
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        <span className="text-[#FCEE0A]">90-Day</span> Roadmap
                    </motion.h2>
                </div>

                <Roadmap />

                <motion.div
                    variants={itemVariants}
                    className="mt-16 text-center max-w-2xl mx-auto border border-[#FCEE0A]/10 bg-[#FCEE0A]/5 p-4 text-xs text-gray-400 font-mono backdrop-blur-sm"
                >
                    <span className="text-[#FCEE0A]">RISKS → </span>
                    Anti-cheat verification, session drops, game balancing.{' '}
                    <span className="text-[#FCEE0A]">MITIGATION → </span>
                    Server-side adjudicators in beta, channel heartbeats, phased balancing.
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}
