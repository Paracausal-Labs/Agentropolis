'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Milestone {
    month: string
    title: string
    items: string[]
    status: 'completed' | 'current' | 'future'
    color: string
}

const ROADMAP_DATA: Milestone[] = [
    {
        month: "Month 1",
        title: "Game-First Alpha",
        items: [
            "Playable single-player loop",
            "Yellow Channel integration (Micro-actions)",
            "Onboarding & Tutorial flows"
        ],
        status: 'current',
        color: "text-[#FCEE0A]"
    },
    {
        month: "Month 2",
        title: "Economy V1",
        items: [
            "In-game Marketplace (Agent upgrades)",
            "Crafting & Progression Systems",
            "Hardened Session Management"
        ],
        status: 'future',
        color: "text-[#00F0FF]"
    },
    {
        month: "Month 3",
        title: "Multiplayer Beta",
        items: [
            "PvP Agent Battles (P2P matchmaking)",
            "Public Playtest Dashboard",
            "Content Launch Cycle"
        ],
        status: 'future',
        color: "text-[#FF00FF]"
    }
]

export function Roadmap() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const lineHeight = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"])

    return (
        <div ref={containerRef} className="relative max-w-4xl mx-auto pl-8 md:pl-0">
            {/* Central Timeline Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2">
                <motion.div
                    style={{ height: lineHeight }}
                    className="w-full bg-gradient-to-b from-[#FCEE0A] via-[#00F0FF] to-[#FF00FF]"
                />
            </div>

            <div className="space-y-24 py-12">
                {ROADMAP_DATA.map((milestone, index) => (
                    <MilestoneCard
                        key={index}
                        milestone={milestone}
                        index={index}
                        isLeft={index % 2 === 0}
                    />
                ))}
            </div>
        </div>
    )
}

function MilestoneCard({ milestone, index, isLeft }: { milestone: Milestone, index: number, isLeft: boolean }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className={cn(
                "relative md:w-1/2 md:px-12",
                isLeft ? "md:mr-auto md:text-right" : "md:ml-auto md:text-left"
            )}
        >
            {/* Timeline Node */}
            <div className={cn(
                "absolute top-0 flex items-center justify-center w-8 h-8 rounded-full bg-black border-2 z-10",
                "left-[-1.05rem] md:left-auto",
                isLeft ? "md:-right-4" : "md:-left-4",
                milestone.color.replace('text-', 'border-')
            )}>
                {milestone.status === 'completed' ? (
                    <CheckCircle2 className={cn("w-4 h-4", milestone.color)} />
                ) : milestone.status === 'current' ? (
                    <div className={cn("w-3 h-3 rounded-full animate-pulse bg-current", milestone.color)} />
                ) : (
                    <Circle className="w-4 h-4 text-gray-600" />
                )}
            </div>

            {/* Content Card */}
            <div className={cn(
                "p-6 bg-black/40 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors",
                "clip-corner-tr"
            )}>
                <div className={cn("text-xs font-mono uppercase tracking-widest mb-2", milestone.color)}>
                    {milestone.month}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{milestone.title}</h3>
                <ul className={cn(
                    "space-y-2 text-sm text-gray-400",
                    isLeft ? "md:items-end" : "md:items-start"
                )}>
                    {milestone.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 justify-start md:justify-[inherit]">
                            {!isLeft && <span className="w-1 h-1 bg-gray-600 rounded-full shrink-0" />}
                            <span>{item}</span>
                            {isLeft && <span className="w-1 h-1 bg-gray-600 rounded-full shrink-0" />}
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    )
}


