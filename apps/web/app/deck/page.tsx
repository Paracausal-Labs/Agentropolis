'use client'

import dynamic from 'next/dynamic'
import { DeckNavigation } from '@/components/deck/DeckNavigation'
import { HeroSlide } from '@/components/deck/slides/HeroSlide'
import { SummarySlide } from '@/components/deck/slides/SummarySlide'
import { ProblemSlide } from '@/components/deck/slides/ProblemSlide'
import { InsightSlide } from '@/components/deck/slides/InsightSlide'
import { ShippedSlide } from '@/components/deck/slides/ShippedSlide'
import { VisionSlide } from '@/components/deck/slides/VisionSlide'
import { GameLoopsSlide } from '@/components/deck/slides/GameLoopsSlide'
import { RoadmapSlide } from '@/components/deck/slides/RoadmapSlide'
import { ArchitectureSlide } from '@/components/deck/slides/ArchitectureSlide'
import { GtmSlide } from '@/components/deck/slides/GtmSlide'
import { AskSlide } from '@/components/deck/slides/AskSlide'

const DeckBackground = dynamic(() => import('@/components/deck/DeckBackground'), { ssr: false })

export default function DeckPage() {
    return (
        <main className="relative bg-[#050510] text-white font-[Rajdhani] overflow-x-hidden">
            {/* 3D Background */}
            <DeckBackground />

            {/* Overlays */}
            <div className="fixed inset-0 scanline pointer-events-none opacity-20 z-10" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(252,238,10,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(252,238,10,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-10" />

            {/* Navigation */}
            <DeckNavigation />

            {/* Slides Sequence */}
            <HeroSlide />
            <SummarySlide />
            <ProblemSlide />
            <InsightSlide />
            <ShippedSlide />
            <VisionSlide />
            <GameLoopsSlide />
            <RoadmapSlide />
            <ArchitectureSlide />
            <GtmSlide />
            <AskSlide />
        </main>
    )
}
