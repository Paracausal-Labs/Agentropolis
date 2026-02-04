'use client'

import type { DeliberationResult } from '@agentropolis/shared'

interface RiskIndicatorProps {
  riskLevel: 'low' | 'medium' | 'high'
  confidence: number
  deliberation?: DeliberationResult
  compact?: boolean
}

const RISK_COLORS = {
  low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
}

const CONSENSUS_LABELS = {
  unanimous: { label: 'Unanimous', color: 'text-green-400' },
  majority: { label: 'Majority', color: 'text-blue-400' },
  contested: { label: 'Contested', color: 'text-yellow-400' },
  vetoed: { label: 'VETOED', color: 'text-red-400' },
}

export function RiskIndicator({ riskLevel, confidence, deliberation, compact }: RiskIndicatorProps) {
  const colors = RISK_COLORS[riskLevel]

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
          {riskLevel.toUpperCase()}
        </span>
        <span className="text-xs text-slate-400">{confidence}%</span>
      </div>
    )
  }

  return (
    <div className={`rounded-lg p-4 ${colors.bg} border ${colors.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${colors.text}`}>
            {riskLevel.toUpperCase()} RISK
          </span>
          {deliberation && (
            <span className={`text-xs ${CONSENSUS_LABELS[deliberation.consensus].color}`}>
              ({CONSENSUS_LABELS[deliberation.consensus].label})
            </span>
          )}
        </div>
        <span className="text-sm text-slate-300">{confidence}% confidence</span>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            confidence >= 75 ? 'bg-green-500' : confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${confidence}%` }}
        />
      </div>

      {deliberation && (
        <div className="flex gap-4 text-xs text-slate-400">
          <span className="text-green-400">{deliberation.voteTally.support} support</span>
          <span className="text-red-400">{deliberation.voteTally.oppose} oppose</span>
          <span className="text-slate-500">{deliberation.voteTally.abstain} abstain</span>
        </div>
      )}
    </div>
  )
}

interface ConfidenceMeterProps {
  value: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ConfidenceMeter({ value, label, size = 'md' }: ConfidenceMeterProps) {
  const sizes = {
    sm: { ring: 40, stroke: 4, text: 'text-xs' },
    md: { ring: 60, stroke: 6, text: 'text-sm' },
    lg: { ring: 80, stroke: 8, text: 'text-base' },
  }

  const { ring, stroke, text } = sizes[size]
  const radius = (ring - stroke) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  const color =
    value >= 75 ? 'stroke-green-500' : value >= 50 ? 'stroke-yellow-500' : 'stroke-red-500'

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: ring, height: ring }}>
        <svg className="transform -rotate-90" width={ring} height={ring}>
          <circle
            className="stroke-slate-700"
            strokeWidth={stroke}
            fill="transparent"
            r={radius}
            cx={ring / 2}
            cy={ring / 2}
          />
          <circle
            className={`${color} transition-all duration-500`}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={ring / 2}
            cy={ring / 2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-white ${text}`}>{value}%</span>
        </div>
      </div>
      {label && <span className="mt-1 text-xs text-slate-400">{label}</span>}
    </div>
  )
}

interface VoteTallyProps {
  tally: { support: number; oppose: number; abstain: number }
}

export function VoteTally({ tally }: VoteTallyProps) {
  const total = tally.support + tally.oppose + tally.abstain
  if (total === 0) return null

  return (
    <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-slate-700">
      {tally.support > 0 && (
        <div
          className="bg-green-500 transition-all"
          style={{ width: `${(tally.support / total) * 100}%` }}
        />
      )}
      {tally.abstain > 0 && (
        <div
          className="bg-slate-500 transition-all"
          style={{ width: `${(tally.abstain / total) * 100}%` }}
        />
      )}
      {tally.oppose > 0 && (
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${(tally.oppose / total) * 100}%` }}
        />
      )}
    </div>
  )
}
