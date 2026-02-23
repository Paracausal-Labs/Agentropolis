'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Maximize, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react'

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    flowchart: { curve: 'stepAfter' }
})

interface MermaidDiagramProps {
    chart: string
    id: string
}

export function MermaidDiagram({ chart, id }: MermaidDiagramProps) {
    const [svgContent, setSvgContent] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [fitScale, setFitScale] = useState<number | null>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const svgWrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let isMounted = true
        setError('')
        setSvgContent('')
        setFitScale(null)

        const renderDiagram = async () => {
            try {
                const safeId = `mg_${id.replace(/[^a-zA-Z0-9]/g, '_')}`
                document.getElementById(safeId)?.remove()
                const { svg } = await mermaid.render(safeId, chart)
                if (isMounted) setSvgContent(svg)
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err)
                console.error('Mermaid rendering failed', msg)
                if (isMounted) setError(msg)
            }
        }
        renderDiagram()
        return () => { isMounted = false }
    }, [chart, id])

    // Compute fit-to-container scale from SVG's natural dimensions
    useEffect(() => {
        if (!svgContent || !containerRef.current || !svgWrapperRef.current) return

        requestAnimationFrame(() => {
            const svgEl = svgWrapperRef.current?.querySelector('svg')
            if (!svgEl || !containerRef.current) return

            // Read intrinsic size from SVG attributes or viewBox
            const vb = svgEl.viewBox?.baseVal
            const attrW = parseFloat(svgEl.getAttribute('width') || '0')
            const attrH = parseFloat(svgEl.getAttribute('height') || '0')
            const svgW = attrW || vb?.width || 800
            const svgH = attrH || vb?.height || 600

            const padding = 48
            const containerW = containerRef.current.clientWidth - padding
            const containerH = containerRef.current.clientHeight - padding

            // Fit to container then apply 3x boost so diagram fills the box better
            const scale = Math.min(containerW / svgW, containerH / svgH)
            setFitScale(Math.min(Math.max(scale * 3, 0.15), 5))
        })
    }, [svgContent, isFullscreen])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(console.error)
        } else {
            document.exitFullscreen()
        }
    }

    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', onChange)
        return () => document.removeEventListener('fullscreenchange', onChange)
    }, [])

    const containerClass = isFullscreen
        ? 'fixed inset-0 z-50 p-8'
        : 'w-full h-[420px] md:h-[520px]'

    return (
        <div
            ref={containerRef}
            className={`relative group border border-white/10 bg-[#0d1117] overflow-hidden ${containerClass}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {error ? (
                <div className="flex items-center justify-center w-full h-full text-red-400 text-xs font-mono p-4">
                    ⚠ {error}
                </div>
            ) : !svgContent || fitScale === null ? (
                <div className="flex items-center justify-center w-full h-full text-gray-500 text-xs font-mono">
                    {svgContent ? 'Fitting…' : 'Rendering diagram…'}
                    {/* Hidden render target to measure SVG */}
                    {svgContent && (
                        <div
                            ref={svgWrapperRef}
                            style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', lineHeight: 0 }}
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                    )}
                </div>
            ) : (
                <TransformWrapper
                    key={`${fitScale}-${isFullscreen}`}
                    initialScale={fitScale}
                    minScale={0.1}
                    maxScale={5}
                    centerOnInit
                    wheel={{ step: 0.08, disabled: !isHovered }}
                    pinch={{ step: 5, disabled: !isHovered }}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            {/* Hint shown when not hovered */}
                            {!isHovered && (
                                <div className="absolute inset-0 flex items-end justify-center pb-3 z-10 pointer-events-none">
                                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                                        Hover to zoom
                                    </span>
                                </div>
                            )}

                            {/* Controls */}
                            <div className="absolute top-3 right-3 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 border border-[#FCEE0A]/30 p-1.5 rounded">
                                <button onClick={() => zoomIn()} className="p-1 hover:text-[#FCEE0A] text-gray-400 transition-colors" title="Zoom In">
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <button onClick={() => zoomOut()} className="p-1 hover:text-[#FCEE0A] text-gray-400 transition-colors" title="Zoom Out">
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <button onClick={() => resetTransform()} className="p-1 hover:text-[#00F0FF] text-gray-400 transition-colors" title="Fit to box">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <div className="w-px bg-white/20 mx-1" />
                                <button onClick={toggleFullscreen} className="p-1 hover:text-[#FF00FF] text-gray-400 transition-colors" title="Fullscreen">
                                    <Maximize className="w-4 h-4" />
                                </button>
                            </div>

                            <TransformComponent
                                wrapperStyle={{ width: '100%', height: '100%' }}
                                contentStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                            >
                                <div
                                    ref={svgWrapperRef}
                                    style={{ lineHeight: 0 }}
                                    dangerouslySetInnerHTML={{ __html: svgContent }}
                                />
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            )}
        </div>
    )
}
