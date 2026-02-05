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
            <div className="absolute inset-0 pointer-events-none font-[Rajdhani]">
                {/* Header - CYBER REDESIGN */}
                <div className="p-4 pt-24 pointer-events-auto">
                    <div className="flex justify-between items-start">
                        <div className="cyber-panel px-6 py-3 clip-corner-tr flex items-center gap-4">
                            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(252,238,10,0.6)]">🏛️</span>
                            <div>
                                <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-none">
                                    COUNCIL_CHAMBER
                                </h1>
                                <p className="text-[10px] text-[#00F0FF] font-mono mt-0.5 tracking-wide">
                                    // SEQUENCING_DELIBERATION_PROTOCOL
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onBack}
                            className="btn-cyber-outline py-2 px-6 h-auto text-sm clip-corner-tr bg-black/60 hover:bg-[#FCEE0A] hover:text-black transition-all"
                        >
                            {'<'} RETURN_TO_CITY
                        </button>
                    </div>
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

                {/* Bottom Panel - Prompt Input - CYBER REDESIGN */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
                    <div className="max-w-5xl mx-auto">
                        <div className="cyber-panel clip-corner-all p-1">
                            {/* Header */}
                            <div className="bg-[#FCEE0A]/10 border-b border-[#FCEE0A]/30 px-6 py-3 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-[#FCEE0A] tracking-widest leading-none flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#FCEE0A] animate-pulse"></span>
                                    COMMAND_INTERFACE
                                </h3>
                                <p className="text-[10px] text-gray-400 font-mono">
                                    STATUS: AWAITING_INPUT
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-6 bg-black/40">
                                {/* Preset Buttons */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    {PRESET_PROMPTS.map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => setCurrentPrompt(preset.prompt)}
                                            className="group relative px-4 py-3 bg-[#050510] border border-[#FCEE0A]/30 hover:border-[#FCEE0A] text-white text-left transition-all hover:bg-[#FCEE0A]/10"
                                        >
                                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#FCEE0A] group-hover:w-full group-hover:h-full transition-all duration-300"></div>
                                            <div className="flex flex-col">
                                                <span className="text-xl mb-1">{preset.emoji}</span>
                                                <span className="text-[10px] text-[#00F0FF] font-mono mb-0.5">{preset.label.split(':')[0]}</span>
                                                <span className="text-xs font-bold tracking-wide">{preset.label.split(':')[1]}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Input */}
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={currentPrompt}
                                            onChange={(e) => setCurrentPrompt(e.target.value)}
                                            placeholder="ENTER_COMMAND_PARAMETERS..."
                                            className="w-full px-6 py-4 bg-[#050510] text-[#00F0FF] border border-[#FCEE0A]/30 focus:border-[#FCEE0A] focus:outline-none focus:bg-[#FCEE0A]/5 font-mono tracking-wide placeholder-gray-600 clip-corner-tr"
                                            disabled={isDeliberating}
                                        />
                                        <div className="absolute right-3 bottom-2 text-[10px] text-[#FCEE0A]/50 font-mono">_</div>
                                    </div>
                                    <button
                                        onClick={handleConsult}
                                        disabled={isDeliberating || !currentPrompt.trim()}
                                        className="btn-cyber w-64 clip-corner-tr disabled:opacity-50 disabled:grayscale"
                                    >
                                        {isDeliberating ? 'PROCESSING...' : 'EXECUTE >>'}
                                    </button>
                                </div>
                            </div>
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

// Components remain similar but styled... 
function RoundTable() {
    return (
        <group>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[2, 2, 0.2, 32]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>
            {/* Glowing edge */}
            <mesh position={[0, 0.5, 0]}>
                <torusGeometry args={[2, 0.02, 16, 64]} />
                <meshBasicMaterial color="#FCEE0A" toneMapped={false} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[2.2, 2.2, 0.05, 32]} />
                <meshBasicMaterial color="#FCEE0A" transparent opacity={0.1} />
            </mesh>
        </group>
    )
}

function SpeakingIndicator({ position, color }: { position: [number, number, number]; color: string }) {
    const ref = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (ref.current) {
            ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.1)
            ref.current.rotation.z += 0.02
        }
    })

    return (
        <mesh ref={ref} position={[position[0], position[1] + 2.5, position[2]]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshBasicMaterial color={color} wireframe />
        </mesh>
    )
}

function SpeechBubble({ agent, stance, reasoning, isActive }: Opinion & { isActive: boolean }) {
    const stanceColors = {
        support: 'border-[#00FF00] text-[#00FF00]',
        concern: 'border-[#FFD700] text-[#FFD700]',
        oppose: 'border-[#FF0000] text-[#FF0000]',
        neutral: 'border-[#888888] text-[#888888]',
    }[stance]

    return (
        <div
            className={`
        absolute top-24 left-1/2 -translate-x-1/2 max-w-xl
        bg-black/90 backdrop-blur-md p-0.5 clip-corner-all
        transition-all duration-300
        ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}
        >
            <div className={`border ${stanceColors.split(' ')[0]} p-6 clip-corner-all bg-[#050510]`}>
                <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
                    <span className="text-[10px] text-gray-500 font-mono tracking-widest">INCOMING_TRANSMISSION</span>
                    <span className={`text-xs font-bold uppercase ${stanceColors.split(' ')[1]}`}>
                        [{stance.toUpperCase()}]
                    </span>
                </div>
                <p className="text-white text-lg font-mono leading-relaxed typewriter-text">
                    "{reasoning}"
                </p>
                <div className="mt-3 text-right">
                    <span className="bg-[#FCEE0A] text-black text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest">
                        {AGENT_TYPES[agent as keyof typeof AGENT_TYPES]?.name}
                    </span>
                </div>
            </div>
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
        <div className="cyber-panel clip-corner-all p-1 animate-in zoom-in duration-300">
            <div className="bg-[#050510] p-6 clip-corner-all">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-[#FCEE0A]/30 pb-4">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest leading-none">
                            PROPOSAL_0x8F2
                        </h2>
                        <span className="text-[10px] text-[#00F0FF] font-mono">HASH: 7a9...f42c</span>
                    </div>
                    <div className="text-xs border border-[#FCEE0A] text-[#FCEE0A] px-2 py-1 uppercase tracking-wider">
                        AWAITING_AUTH
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#FCEE0A]/5 p-3 border-l-2 border-[#FCEE0A]">
                        <div className="text-[10px] text-gray-500 font-mono uppercase">Action Protocol</div>
                        <div className="text-white font-bold tracking-wide">{proposal.action}</div>
                    </div>
                    <div className="bg-[#FCEE0A]/5 p-3 border-l-2 border-[#FCEE0A]">
                        <div className="text-[10px] text-gray-500 font-mono uppercase">Value Transfer</div>
                        <div className="text-white font-mono">{proposal.amount}</div>
                    </div>
                    <div className="bg-[#FCEE0A]/5 p-3 border-l-2 border-[#FCEE0A]">
                        <div className="text-[10px] text-gray-500 font-mono uppercase">Yield Projection</div>
                        <div className="text-[#00FF00] font-mono">{proposal.expected}</div>
                    </div>
                    <div className="bg-[#FCEE0A]/5 p-3 border-l-2 border-[#FCEE0A]">
                        <div className="text-[10px] text-gray-500 font-mono uppercase">Risk Factor</div>
                        <div className={`${proposal.risk === 'low' ? 'text-[#00FF00]' : proposal.risk === 'medium' ? 'text-[#FFD700]' : 'text-[#FF0000]'} font-bold uppercase`}>
                            {proposal.risk.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="bg-[#222] border border-gray-700 p-4 mb-6 relative">
                    <div className="absolute top-0 left-0 bg-[#FCEE0A] text-black text-[9px] px-1 font-bold">ANALYSIS</div>
                    <p className="text-sm text-gray-300 font-mono leading-relaxed pt-2 opacity-80">
                        {proposal.reasoning}
                    </p>
                </div>

                <div className="flex gap-2 mb-6 font-mono text-xs">
                    <div className="flex-1 bg-black border border-[#00FF00]/30 p-2 text-center">
                        <div className="text-[#00FF00] font-bold text-lg">{proposal.votes.support}</div>
                        <div className="text-gray-500">SUPPORT</div>
                    </div>
                    <div className="flex-1 bg-black border border-[#FF0000]/30 p-2 text-center">
                        <div className="text-[#FF0000] font-bold text-lg">{proposal.votes.oppose}</div>
                        <div className="text-gray-500">OPPOSE</div>
                    </div>
                    <div className="flex-1 bg-black border border-gray-700 p-2 text-center">
                        <div className="text-gray-400 font-bold text-lg">{proposal.votes.abstain}</div>
                        <div className="text-gray-600">ABSTAIN</div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onApprove}
                        className="flex-1 btn-cyber clip-corner-tr hover:bg-[#00FF00] hover:shadow-[0_0_20px_#00FF00]"
                    >
                        CONFIRM_EXECUTION
                    </button>
                    <button
                        onClick={onReject}
                        className="flex-1 py-4 bg-transparent border border-[#FF0000] text-[#FF0000] font-bold tracking-widest uppercase hover:bg-[#FF0000] hover:text-white transition-all clip-corner-tr"
                    >
                        ABORT
                    </button>
                </div>
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
