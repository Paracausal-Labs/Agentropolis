'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Twitter, Github, Trophy } from 'lucide-react'

export function FooterSlide() {
    return (
        <MotionSlide id="slide-footer">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center min-h-[60vh] justify-center"
            >
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 text-center text-white"
                    style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
                >
                    JOIN THE <span className="text-[#FCEE0A] relative inline-block" style={{ textShadow: '-3px 0px 0px #00F0FF, 3px 0px 0px #FF00FF' }}>COUNCIL</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-gray-400 text-center max-w-2xl mx-auto mb-14 font-medium md:text-lg">
                    We are building the first simulation game that runs at the speed of thought, settled on the trust of code.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6 mb-32">
                    <a
                        href="https://x.com/paracausallabs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-[#FCEE0A] text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-white hover:scale-105 transition-all"
                    >
                        <Twitter className="w-5 h-5" />
                        Follow Updates
                    </a>

                    <a
                        href="https://github.com/Paracausal-Labs/Agentropolis"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 border border-white/20 bg-black/40 text-white px-8 py-4 font-bold uppercase tracking-widest hover:border-white/50 hover:bg-white/10 transition-all"
                    >
                        <Github className="w-5 h-5" />
                        View Code
                    </a>

                    <a
                        href="https://ethglobal.com/showcase/agentropolis-qhtbb"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 border border-white/20 bg-black/40 text-white px-8 py-4 font-bold uppercase tracking-widest hover:border-white/50 hover:bg-white/10 transition-all"
                    >
                        <Trophy className="w-5 h-5" />
                        Showcase
                    </a>
                </motion.div>

                <motion.div variants={itemVariants} className="w-full border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-gray-500 tracking-widest uppercase gap-4">
                    <div>© 2026 Paracausal Labs</div>
                    <div>Agentropolis V0.1.0</div>
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}
