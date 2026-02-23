'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Roadmap } from '../Roadmap'
import { MermaidDiagram } from '../MermaidDiagram'

const ganttChart = `
gantt
    title Agentropolis 90-Day Execution Plan
    dateFormat  YYYY-MM-DD
    section Foundation
    Base mainnet hooks and config         :a1, 2026-03-01, 14d
    Yellow production clearnode integration :a2, 2026-03-01, 14d
    Channel lifecycle hardening          :a3, 2026-03-05, 12d

    section Product Core
    Agent API and auth                   :b1, 2026-03-15, 14d
    Dashboard and risk controls          :b2, 2026-03-18, 16d
    Performance oracle indexing          :b3, 2026-03-20, 14d

    section Monetization
    Agent and Strategy NFTs              :c1, 2026-04-01, 10d
    Marketplace settlement via Yellow    :c2, 2026-04-03, 12d
    Tournament contracts and scoring     :c3, 2026-04-08, 14d

    section Launch
    Campus pilot and onboarding          :d1, 2026-04-20, 18d
    Public launch and co-marketing       :d2, 2026-05-05, 16d
    Metrics reporting to Yellow          :d3, 2026-05-10, 10d
`

export function RoadmapSlide() {
    return (
        <MotionSlide id="slide-roadmap">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="relative z-20 w-full max-w-6xl mx-auto flex flex-col items-center"
            >
                <div className="text-center mb-10 w-full">
                    <motion.div variants={itemVariants} className="inline-block border border-[#FCEE0A] text-[#FCEE0A] text-xs font-mono uppercase tracking-[0.3em] px-4 py-1 mb-6">
                        Execution
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                        <span className="text-[#FCEE0A]">90-Day</span> Execution Plan
                    </motion.h2>
                </div>

                <div className="w-full">
                    <Roadmap />
                </div>

                <motion.div
                    variants={itemVariants}
                    className="mt-8 border border-white/10 bg-black/60 backdrop-blur-md p-4 w-full h-[400px] flex flex-col"
                >
                    <div className="text-center mb-2">
                        <span className="text-[10px] font-mono tracking-widest text-gray-500 border border-white/20 px-2 py-0.5 uppercase">Timeline</span>
                    </div>
                    <div className="flex-1 w-full h-full relative">
                        <MermaidDiagram chart={ganttChart} id="roadmap-gantt" />
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="mt-8 text-center max-w-2xl mx-auto border border-white/10 bg-white/5 p-4 text-sm text-gray-400 font-mono backdrop-blur-sm"
                >
                    <span className="text-white font-bold tracking-wider">Note: </span>
                    We already shipped the prototype stack in a hackathon. This roadmap is about production hardening and launch, not starting from zero.
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}
