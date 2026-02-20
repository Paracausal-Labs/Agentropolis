'use client'

import { useState } from 'react'
import { useSession } from '@/components/SessionProvider'

const ACTION_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
    'swap': { label: 'Swap', emoji: '🔄', color: '#3b82f6' },
    'lp_position': { label: 'LP Position', emoji: '💧', color: '#8b5cf6' },
    'deliberation': { label: 'Deliberation', emoji: '🏛️', color: '#f59e0b' },
    'token_launch': { label: 'Token Launch', emoji: '🚀', color: '#f97316' },
    'limit_order': { label: 'Limit Order', emoji: '📊', color: '#06b6d4' },
    'agent-deploy': { label: 'Agent Deploy', emoji: '🤖', color: '#22c55e' },
}

function getActionInfo(type: string) {
    return ACTION_LABELS[type] || { label: type, emoji: '⚡', color: '#94a3b8' }
}

function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function SessionEconomics() {
    const { state, chargeHistory } = useSession()
    const [isOpen, setIsOpen] = useState(false)

    if (state.status !== 'active' && state.status !== 'settled') return null
    if (chargeHistory.length === 0 && !isOpen) return null

    // Compute breakdown by type
    const breakdown: Record<string, { count: number; total: number }> = {}
    let totalSpent = 0

    for (const entry of chargeHistory) {
        const amount = parseFloat(entry.amount)
        totalSpent += amount
        if (!breakdown[entry.type]) {
            breakdown[entry.type] = { count: 0, total: 0 }
        }
        breakdown[entry.type].count++
        breakdown[entry.type].total += amount
    }

    const sortedTypes = Object.entries(breakdown).sort((a, b) => b[1].total - a[1].total)

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-20 right-4 z-50 cyber-panel px-3 py-2 bg-black/80 backdrop-blur hover:bg-[#FCEE0A]/10 transition-colors group"
                title="Session Economics"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm">📈</span>
                    <span className="text-[10px] text-[#FCEE0A] font-mono uppercase tracking-wider">
                        {chargeHistory.length} TX
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                        -{totalSpent.toFixed(3)}
                    </span>
                </div>
            </button>

            {/* Dashboard Panel */}
            {isOpen && (
                <div className="fixed top-32 right-4 z-50 w-80 max-h-[70vh] cyber-panel bg-black/95 backdrop-blur-lg border border-[#FCEE0A]/30 overflow-hidden flex flex-col animate-in slide-in-from-right">
                    {/* Header */}
                    <div className="p-4 border-b border-[#FCEE0A]/20 bg-[#FCEE0A]/5">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-[#FCEE0A] text-xs font-mono uppercase tracking-widest">Session Economics</div>
                                <div className="text-white text-lg font-bold font-mono mt-1">
                                    {state.balance} <span className="text-gray-500 text-sm">yUSD</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-px bg-gray-800/50 border-b border-gray-800">
                        <div className="p-3 bg-black/80 text-center">
                            <div className="text-[10px] text-gray-500 uppercase">Total Spent</div>
                            <div className="text-sm text-red-400 font-mono font-bold">{totalSpent.toFixed(3)}</div>
                        </div>
                        <div className="p-3 bg-black/80 text-center">
                            <div className="text-[10px] text-gray-500 uppercase">Actions</div>
                            <div className="text-sm text-[#FCEE0A] font-mono font-bold">{chargeHistory.length}</div>
                        </div>
                        <div className="p-3 bg-black/80 text-center">
                            <div className="text-[10px] text-gray-500 uppercase">Types</div>
                            <div className="text-sm text-[#00F0FF] font-mono font-bold">{sortedTypes.length}</div>
                        </div>
                    </div>

                    {/* Breakdown by Type */}
                    {sortedTypes.length > 0 && (
                        <div className="p-3 border-b border-gray-800/50">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Cost Breakdown</div>
                            <div className="space-y-2">
                                {sortedTypes.map(([type, data]) => {
                                    const info = getActionInfo(type)
                                    const percentage = totalSpent > 0 ? (data.total / totalSpent) * 100 : 0
                                    return (
                                        <div key={type}>
                                            <div className="flex justify-between items-center text-xs mb-1">
                                                <span className="text-gray-300">
                                                    {info.emoji} {info.label}
                                                    <span className="text-gray-600 ml-1">×{data.count}</span>
                                                </span>
                                                <span className="font-mono text-gray-400">{data.total.toFixed(3)}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor: info.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Transaction History */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <div className="p-3">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Transaction Log</div>
                            <div className="space-y-1">
                                {[...chargeHistory].reverse().map((entry, i) => {
                                    const info = getActionInfo(entry.type)
                                    return (
                                        <div
                                            key={`${entry.timestamp}-${i}`}
                                            className="flex items-center justify-between py-1.5 px-2 bg-gray-900/50 border border-gray-800/50 text-xs"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{info.emoji}</span>
                                                <span className="text-gray-300">{info.label}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-red-400 font-mono">-{entry.amount}</span>
                                                <span className="text-gray-600 font-mono text-[10px]">{formatTime(entry.timestamp)}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
