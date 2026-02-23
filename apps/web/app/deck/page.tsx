'use client'

import dynamic from 'next/dynamic'
import { DeckNavigation } from '@/components/deck/DeckNavigation'
import { HeroSlide } from '@/components/deck/slides/HeroSlide'
import { WhyNowSlide } from '@/components/deck/slides/WhyNowSlide'
import { ProductOverviewSlide } from '@/components/deck/slides/ProductOverviewSlide'
import { WhyYellowSlide } from '@/components/deck/slides/WhyYellowSlide'
import { ArchitectureSlide } from '@/components/deck/slides/ArchitectureSlide'
import { TransactionLoopsSlide } from '@/components/deck/slides/TransactionLoopsSlide'
import { EconomicsSlide } from '@/components/deck/slides/EconomicsSlide'
import { RevenueModelSlide } from '@/components/deck/slides/RevenueModelSlide'
import { GtmSlide } from '@/components/deck/slides/GtmSlide'
import { CampusWedgeSlide } from '@/components/deck/slides/CampusWedgeSlide'
import { RoadmapSlide } from '@/components/deck/slides/RoadmapSlide'
import { ShippedSlide } from '@/components/deck/slides/ShippedSlide'
import { AskSlide } from '@/components/deck/slides/AskSlide'
import { PartnershipAskSlide } from '@/components/deck/slides/PartnershipAskSlide'
import { FooterSlide } from '@/components/deck/slides/FooterSlide'

const DeckBackground = dynamic(() => import('@/components/deck/DeckBackground'), { ssr: false })

export default function DeckPage() {
    return (
        <main className="deck-theme relative overflow-x-hidden">
            {/* 3D Background */}
            <DeckBackground />

            {/* Overlays */}
            <div className="fixed inset-0 scanline pointer-events-none opacity-20 z-10" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(252,238,10,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(252,238,10,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-10" />

            {/* Navigation */}
            <DeckNavigation />

            {/* Slides Sequence */}
            <HeroSlide />
            <WhyNowSlide />
            <ProductOverviewSlide />
            <WhyYellowSlide />
            <ArchitectureSlide />
            <TransactionLoopsSlide />
            <EconomicsSlide />
            <RevenueModelSlide />
            <GtmSlide />
            <CampusWedgeSlide />
            <RoadmapSlide />
            <ShippedSlide />
            <AskSlide />
            <PartnershipAskSlide />
            <FooterSlide />
        </main>
    )
}
