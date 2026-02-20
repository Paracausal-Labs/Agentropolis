'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function DeckNavigation() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="fixed top-6 left-6 z-50 mix-blend-difference"
        >
            <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-white/10 group gap-2 pl-2 pr-4">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="font-mono uppercase tracking-widest text-xs">Back to City</span>
                </Button>
            </Link>
        </motion.div>
    )
}
