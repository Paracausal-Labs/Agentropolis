'use client'

import { motion } from 'framer-motion'
import { MotionSlide, itemVariants, containerVariants } from '../MotionSlide'
import { Github, Twitter } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function AskSlide() {
    return (
        <MotionSlide id="slide-ask">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-20 w-full max-w-4xl mx-auto text-center"
            >
                <motion.h2 variants={itemVariants} className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white mb-8 leading-none">
                    Join the <span className="text-[#FCEE0A] text-glitch">Council</span>
                </motion.h2>

                <motion.p variants={itemVariants} className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                    We are building the first simulation game that runs at the speed of thought, settled on the trust of code.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <Link href="https://x.com/paracausallabs" target="_blank">
                        <Button size="lg" className="bg-[#FCEE0A] text-black hover:bg-[#FCEE0A]/80 font-bold uppercase tracking-wide px-8 h-14 text-lg">
                            <Twitter className="w-5 h-5 mr-2" /> Follow Updates
                        </Button>
                    </Link>
                    <Link href="https://github.com/Paracausal-Labs/Agentropolis" target="_blank">
                        <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 uppercase tracking-wide px-8 h-14 text-lg">
                            <Github className="w-5 h-5 mr-2" /> View Code
                        </Button>
                    </Link>
                    <Link href="https://ethglobal.com/showcase/agentropolis-qhtbb" target="_blank">
                        <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 uppercase tracking-wide px-8 h-14 text-lg">
                            Showcase
                        </Button>
                    </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-24 pt-8 border-t border-white/5 flex justify-between items-center text-xs text-gray-600 font-mono uppercase tracking-widest">
                    <div>© 2026 Paracausal Labs</div>
                    <div>Agentropolis v0.1.0</div>
                </motion.div>
            </motion.div>
        </MotionSlide>
    )
}
