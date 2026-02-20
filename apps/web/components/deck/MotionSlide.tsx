import { useRef } from 'react'
import { motion, useInView, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MotionSlideProps {
    id: string
    className?: string
    children: React.ReactNode
}

export function MotionSlide({ id, className, children }: MotionSlideProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: false, margin: "-20%" })

    return (
        <section
            id={id}
            ref={ref}
            className={cn(
                "relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden",
                className
            )}
        >
            {/* Top Border accent */}
            <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCEE0A]/60 to-transparent"
            />

            {children}
        </section>
    )
}

// Reusable Motion Primitives for internal slide content

export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
}

export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            type: "spring",
            stiffness: 50,
            damping: 20
        }
    }
}

export const textRevealVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
}
