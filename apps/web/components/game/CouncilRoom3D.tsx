'use client'

import { useState, useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import Scene3D from './Scene3D'
import { Agent3D } from './3d/Agents'
import { COLORS, AGENT_TYPES, PRESET_PROMPTS } from '@/lib/game-constants'

interface Opinion {
    agent: string
    stance: 'support' | 'concern' | 'oppose' | 'neutral'
    reasoning: string
}

interface Proposal {
    action: string
    amount: string
    expected: string
    risk: 'low' | 'medium' | 'high'
    reasoning: string
    votes: {
        support: number
        oppose: number
        abstain: number
    }
    consensus: 'unanimous' | 'majority' | 'contested' | 'vetoed'
}

export default function CouncilRoom3D({ onBack }: { onBack: () => void }) {
    const [currentPrompt, setCurrentPrompt] = useState('')
    const [isDeliberating, setIsDeliberating] = useState(false)
    const [opinions, setOpinions] = useState<Opinion[]>([])
    const [proposal, setProposal] = useState<Proposal | null>(null)
    const [speakingAgent, setSpeakingAgent] = useState<string | null>(null)

    const handleConsult = useCallback(async () => {
        if (!currentPrompt.trim()) return

        setIsDeliberating(true)
        setOpinions([])
        setProposal(null)

        // Mock deliberation sequence
        const agents = ['alphaHunter', 'riskSentinel', 'macroOracle', 'devilsAdvocate', 'councilClerk']

        for (let i = 0; i < agents.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 2000))

            setSpeakingAgent(agents[i])

            const mockOpinion: Opinion = {
                agent: agents[i],
                stance: i === 1 ? 'concern' : i === 3 ? 'oppose' : 'support',
                reasoning: getMockReasoning(agents[i], currentPrompt),
            }

            setOpinions((prev) => [...prev, mockOpinion])

            await new Promise((resolve) => setTimeout(resolve, 1000))
            setSpeakingAgent(null)
        }

        // Generate proposal
        await new Promise((resolve) => setTimeout(resolve, 500))
        setProposal({
            action: 'Swap 0.1 WETH → USDC',
            amount: '0.1 WETH (~$330)',
            expected: '~328 USDC (0.5% slippage)',
            risk: 'medium',
            reasoning: 'Based on current market conditions and your moderate risk profile, swapping to USDC provides stability while ETH shows volatility signs...',
            votes: { support: 3, oppose: 1, abstain: 0 },
            consensus: 'majority',
        })

        setIsDeliberating(false)
    }, [currentPrompt])

    const handleApprove = () => {
        // Mock approval - show success state
        alert('✅ Trade approved! (Mock - no real transaction)')
        setProposal(null)
        setOpinions([])
    }

    const handleReject = () => {
        setProposal(null)
        setOpinions([])
    }

    return (
        <div className="w-full h-full relative">
            {/* 3D Scene */}
            <Scene3D
                cameraPosition={[0, 8, 12]}
                cameraMode="orbital"
                enablePostProcessing
            >
                {/* Table */}
                <RoundTable />

                {/* Agent Positions around table */}
                <Agent3D position={[0, 0.5, -3]} agentType="alphaHunter" scale={0.8} />
                <Agent3D position={[2.5, 0.5, -1.5]} agentType="riskSentinel" scale={0.8} />
                <Agent3D position={[2.5, 0.5, 1.5]} agentType="macroOracle" scale={0.8} />
                <Agent3D position={[0, 0.5, 3]} agentType="devilsAdvocate" scale={0.8} />
                <Agent3D position={[-2.5, 0.5, 1.5]} agentType="councilClerk" scale={0.8} />
                <Agent3D position={[-2.5, 0.5, -1.5]} agentType="user" scale={0.8} />

                {/* Speaking indicator */}
                {speakingAgent && (
                    <SpeakingIndicator
                        position={getAgentPosition(speakingAgent)}
                        color={AGENT_TYPES[speakingAgent as keyof typeof AGENT_TYPES]?.color || COLORS.neon.cyan}
                    />
                )}

                {/* Floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                    <planeGeometry args={[20, 20]} />
                    <meshStandardMaterial color={COLORS.bg.secondary} />
                </mesh>
            </Scene3D>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Header */}
                <div className="p-4 flex justify-between items-center pointer-events-auto">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                        🏛️ THE COUNCIL
                    </h1>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg transition-all"
                    >
                        ← Back to City
                    </button>
                </div>

                {/* Speech bubbles */}
                {opinions.map((opinion, idx) => (
                    <SpeechBubble
                        key={idx}
                        agent={opinion.agent}
                        stance={opinion.stance}
                        reasoning={opinion.reasoning}
                        isActive={idx === opinions.length - 1}
                    />
                ))}

                {/* Bottom Panel - Prompt Input */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">What would you like to do?</h3>

                        {/* Preset Buttons */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            {PRESET_PROMPTS.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => setCurrentPrompt(preset.prompt)}
                                    className="px-4 py-3 bg-gray-800/60 hover:bg-gray-700/60 text-white rounded-lg text-sm font-medium transition-all border border-gray-700/50 hover:border-cyan-500/50"
                                >
                                    {preset.emoji} {preset.label.split(' ').slice(1).join(' ')}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={currentPrompt}
                                onChange={(e) => setCurrentPrompt(e.target.value)}
                                placeholder="Type your request..."
                                className="flex-1 px-4 py-3 bg-black/40 text-white rounded-lg border border-gray-700/50 focus:border-cyan-500/50 focus:outline-none"
                                disabled={isDeliberating}
                            />
                            <button
                                onClick={handleConsult}
                                disabled={isDeliberating || !currentPrompt.trim()}
                                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                            >
                                {isDeliberating ? '⏳ Deliberating...' : '🚀 Consult Council'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Proposal Card */}
                {proposal && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-6 pointer-events-auto">
                        <ProposalCard
                            proposal={proposal}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

// Components
function RoundTable() {
    return (
        <group>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[2, 2, 0.2, 32]} />
                <meshStandardMaterial
                    color={COLORS.building.base}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>
            {/* Glowing edge */}
            <mesh position={[0, 0.5, 0]}>
                <torusGeometry args={[2, 0.05, 16, 32]} />
                <meshBasicMaterial color={COLORS.neon.cyan} />
            </mesh>
        </group>
    )
}

function SpeakingIndicator({ position, color }: { position: [number, number, number]; color: string }) {
    const ref = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (ref.current) {
            ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.3)
        }
    })

    return (
        <mesh ref={ref} position={[position[0], position[1] + 2, position[2]]}>
            <ringGeometry args={[0.8, 1, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
    )
}

function SpeechBubble({ agent, stance, reasoning, isActive }: Opinion & { isActive: boolean }) {
    const stanceColor = {
        support: 'border-green-500',
        concern: 'border-yellow-500',
        oppose: 'border-red-500',
        neutral: 'border-gray-500',
    }[stance]

    return (
        <div
            className={`
        absolute top-20 left-1/2 -translate-x-1/2 max-w-lg
        bg-black/80 backdrop-blur-xl rounded-xl border-2 ${stanceColor} p-4
        transition-all duration-300
        ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}
        >
            <p className="text-white text-sm leading-relaxed">{reasoning}</p>
            <p className="text-gray-400 text-xs mt-2">
                - {AGENT_TYPES[agent as keyof typeof AGENT_TYPES]?.name}
            </p>
        </div>
    )
}

function ProposalCard({
    proposal,
    onApprove,
    onReject,
}: {
    proposal: Proposal
    onApprove: () => void
    onReject: () => void
}) {
    return (
        <div className="bg-gradient-to-br from-gray-900/98 to-purple-900/98 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/50 p-6 shadow-2xl shadow-cyan-500/30 animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-white mb-4">📜 Council Proposal</h2>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Action:</span>
                    <span className="text-white font-semibold">{proposal.action}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">{proposal.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Expected:</span>
                    <span className="text-green-400">{proposal.expected}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Risk:</span>
                    <span className={`font-semibold ${proposal.risk === 'low' ? 'text-green-400' :
                            proposal.risk === 'medium' ? 'text-yellow-400' :
                                'text-red-400'
                        }`}>
                        {proposal.risk.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="bg-black/40 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300 leading-relaxed">{proposal.reasoning}</p>
            </div>

            <div className="flex gap-2 mb-6">
                <div className="flex-1 text-center">
                    <span className="text-green-400 font-bold">🟢 Support: {proposal.votes.support}</span>
                </div>
                <div className="flex-1 text-center">
                    <span className="text-red-400 font-bold">🔴 Oppose: {proposal.votes.oppose}</span>
                </div>
                <div className="flex-1 text-center">
                    <span className="text-gray-400 font-bold">⚪ Abstain: {proposal.votes.abstain}</span>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onApprove}
                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all"
                >
                    ✅ APPROVE TRADE
                </button>
                <button
                    onClick={onReject}
                    className="flex-1 py-4 bg-gray-800 text-white rounded-xl font-bold text-lg border border-gray-700 hover:bg-gray-700 transition-all"
                >
                    ❌ REJECT
                </button>
            </div>
        </div>
    )
}

// Helper functions
function getAgentPosition(agent: string): [number, number, number] {
    const positions: Record<string, [number, number, number]> = {
        alphaHunter: [0, 0.5, -3],
        riskSentinel: [2.5, 0.5, -1.5],
        macroOracle: [2.5, 0.5, 1.5],
        devilsAdvocate: [0, 0.5, 3],
        councilClerk: [-2.5, 0.5, 1.5],
        user: [-2.5, 0.5, -1.5],
    }
    return positions[agent] || [0, 0, 0]
}

function getMockReasoning(agent: string, prompt: string): string {
    const responses: Record<string, string> = {
        alphaHunter: 'This aligns with yield optimization. I analyze the opportunity and SUPPORT this move.',
        riskSentinel: 'I see moderate risk here. Slippage could be higher. Proceed with CAUTION.',
        macroOracle: 'Market sentiment suggests stability. The timing appears favorable. I SUPPORT.',
        devilsAdvocate: 'Have we considered the gas costs? What if ETH pumps tomorrow? I OPPOSE for now.',
        councilClerk: 'Based on council input, consensus leans toward approval with risk awareness. Final proposal synthesized.',
    }
    return responses[agent] || 'Processing...'
}
