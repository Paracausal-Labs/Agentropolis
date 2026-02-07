'use client'

import { useState, useRef, useEffect } from 'react'
import Scene3D from './Scene3D'
import { Agent3D } from './3d/Agents'
import { COLORS, AGENT_TYPES, PRESET_PROMPTS } from '@/lib/game-constants'
import { useGame } from '@/contexts/GameContext'

interface ChatMessage {
    id: string
    sender: 'user' | 'agent'
    text: string
}

const BACKEND_TO_FRONTEND_AGENT: Record<string, keyof typeof AGENT_TYPES> = {
    'alpha-hunter': 'alphaHunter',
    'risk-sentinel': 'riskSentinel',
    'macro-oracle': 'macroOracle',
    'devils-advocate': 'devilsAdvocate',
    'council-clerk': 'councilClerk',
}

export default function CouncilRoom3D({ onBack }: { onBack: () => void }) {
    const { actions } = useGame()

    // Interaction State
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
    const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)
    const [interactions, setInteractions] = useState<{
        [key: string]: { hasIntroduced: boolean, chatHistory: ChatMessage[] }
    }>({})

    // Deliberation State
    const [currentPrompt, setCurrentPrompt] = useState('')
    const [isDeliberating, setIsDeliberating] = useState(false)
    const [opinions, setOpinions] = useState<{ agent: string; stance: string; reasoning: string; confidence?: number }[]>([])
    const [proposal, setProposal] = useState<any | null>(null)
    const [speakingAgent, setSpeakingAgent] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const abortRef = useRef<AbortController | null>(null)
    const selectedAgentRef = useRef<string | null>(null)

    useEffect(() => { selectedAgentRef.current = selectedAgent }, [selectedAgent])
    useEffect(() => { return () => { abortRef.current?.abort() } }, [])

    // Handlers
    const handleAgentClick = (agentId: string) => {
        if (agentId === 'user') return
        setSelectedAgent(agentId)

        // Initialize interaction state if new
        if (!interactions[agentId]) {
            setInteractions(prev => ({
                ...prev,
                [agentId]: { hasIntroduced: false, chatHistory: [] }
            }))
        }
    }

    const handleStartChat = () => {
        if (selectedAgent && !interactions[selectedAgent].hasIntroduced) {
            setInteractions(prev => ({
                ...prev,
                [selectedAgent]: { ...prev[selectedAgent], hasIntroduced: true }
            }))
        }
    }

    const handleSendMessage = async (text: string) => {
        const agent = selectedAgentRef.current
        if (!agent) return

        const newHistory = [
            ...(interactions[agent]?.chatHistory || []),
            { id: Date.now().toString(), sender: 'user', text } as ChatMessage
        ]

        setInteractions(prev => ({
            ...prev,
            [agent]: { ...prev[agent], chatHistory: newHistory }
        }))

        try {
            const res = await fetch('/api/agents/council', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userPrompt: text }),
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Request failed' }))
                throw new Error(err.message || `API error: ${res.status}`)
            }

            const data = await res.json()

            const currentAgent = selectedAgentRef.current || agent
            const frontendKey = currentAgent as keyof typeof AGENT_TYPES
            const backendMessages = data.deliberation?.messages || []
            const agentMsg = backendMessages.find((m: any) =>
                BACKEND_TO_FRONTEND_AGENT[m.agentId] === frontendKey
            )

            const responseText = agentMsg
                ? `[${agentMsg.opinion}] ${agentMsg.reasoning}`
                : data.deliberation?.messages?.[0]?.reasoning || 'I need more context to respond.'

            setInteractions(prev => ({
                ...prev,
                [agent]: {
                    ...prev[agent],
                    chatHistory: [
                        ...newHistory,
                        { id: (Date.now() + 1).toString(), sender: 'agent', text: responseText } as ChatMessage
                    ]
                }
            }))
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to get response'
            setInteractions(prev => ({
                ...prev,
                [agent]: {
                    ...prev[agent],
                    chatHistory: [
                        ...newHistory,
                        { id: (Date.now() + 1).toString(), sender: 'agent', text: `[ERROR] ${errorMsg}` } as ChatMessage
                    ]
                }
            }))
        }
    }

    const handleConsult = async () => {
        if (!currentPrompt.trim()) return

        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setIsDeliberating(true)
        setOpinions([])
        setProposal(null)
        setError(null)
        actions.startDeliberation()

        try {
            const res = await fetch('/api/agents/council', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userPrompt: currentPrompt }),
                signal: controller.signal,
            })

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({ message: 'Request failed' }))
                throw new Error(errBody.message || `API error: ${res.status}`)
            }

            const data = await res.json()
            const messages = data.deliberation?.messages || []
            const apiProposal = data.proposal

            for (const msg of messages) {
                if (controller.signal.aborted) return

                const frontendAgent = BACKEND_TO_FRONTEND_AGENT[msg.agentId] || msg.agentId
                setSpeakingAgent(frontendAgent)

                const opinion = {
                    agent: frontendAgent,
                    stance: msg.opinion.toLowerCase(),
                    reasoning: msg.reasoning,
                    confidence: msg.confidence,
                }

                setOpinions(prev => [...prev, opinion])
                await new Promise(r => setTimeout(r, 1200))
                setSpeakingAgent(null)
                await new Promise(r => setTimeout(r, 300))
            }

            if (apiProposal) {
                const uiProposal = {
                    id: apiProposal.id || `prop-${Date.now()}`,
                    action: apiProposal.action === 'token_launch'
                        ? `Launch ${apiProposal.tokenSymbol}`
                        : `${apiProposal.strategyType || apiProposal.action || 'swap'}`.toUpperCase(),
                    inputToken: apiProposal.pair?.tokenIn?.symbol || apiProposal.pairedToken || 'ETH',
                    outputToken: apiProposal.pair?.tokenOut?.symbol || apiProposal.tokenSymbol || 'USDC',
                    inputAmount: apiProposal.amountIn || '0',
                    expectedOutput: `${apiProposal.expectedAmountOut || '0'} ${apiProposal.pair?.tokenOut?.symbol || 'USDC'}`,
                    slippage: (apiProposal.maxSlippage || 50) / 100,
                    risk: apiProposal.riskLevel || 'medium',
                    reasoning: apiProposal.reasoning || 'Council deliberation complete.',
                    votes: data.deliberation?.voteTally || { support: 0, oppose: 0, abstain: 0 },
                    consensus: data.deliberation?.consensus || 'contested',
                    status: 'pending' as const,
                    timestamp: Date.now(),
                    _apiProposal: apiProposal,
                }

                setProposal(uiProposal)
                actions.addProposal(uiProposal)
            }
        } catch (err) {
            if ((err as Error).name === 'AbortError') return
            const message = err instanceof Error ? err.message : 'Deliberation failed'
            console.error('[CouncilRoom] Deliberation error:', err)
            setError(message)
        } finally {
            setIsDeliberating(false)
            setSpeakingAgent(null)
        }
    }

    return (
        <div className="w-full h-full relative font-[Rajdhani]">
            {/* 3D Scene */}
            <Scene3D
                cameraPosition={[0, 5.5, 8.5]}
                cameraMode="orbital"
                enablePostProcessing
            >
                {/* Environment */}
                <RoundTable />
                {/* Floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                    <circleGeometry args={[12, 64]} />
                    <meshStandardMaterial color={COLORS.bg.secondary} roughness={0.5} metalness={0.5} />
                    <gridHelper args={[20, 20, '#444', '#111']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} />
                </mesh>

                {/* Agents */}
                <Agent3D
                    position={[0, 0.5, -4]}
                    agentType="alphaHunter"
                    rotation={0}
                    isSelected={selectedAgent === 'alphaHunter'}
                    isHovered={hoveredAgent === 'alphaHunter'}
                    onClick={() => handleAgentClick('alphaHunter')}
                    onPointerOver={() => setHoveredAgent('alphaHunter')}
                    onPointerOut={() => setHoveredAgent(null)}
                />
                <Agent3D
                    position={[3.5, 0.5, -2]}
                    agentType="riskSentinel"
                    rotation={-Math.PI / 3}
                    isSelected={selectedAgent === 'riskSentinel'}
                    isHovered={hoveredAgent === 'riskSentinel'}
                    onClick={() => handleAgentClick('riskSentinel')}
                    onPointerOver={() => setHoveredAgent('riskSentinel')}
                    onPointerOut={() => setHoveredAgent(null)}
                />
                <Agent3D
                    position={[3.5, 0.5, 2]}
                    agentType="macroOracle"
                    rotation={-2 * Math.PI / 3}
                    isSelected={selectedAgent === 'macroOracle'}
                    isHovered={hoveredAgent === 'macroOracle'}
                    onClick={() => handleAgentClick('macroOracle')}
                    onPointerOver={() => setHoveredAgent('macroOracle')}
                    onPointerOut={() => setHoveredAgent(null)}
                />
                <Agent3D
                    position={[0, 0.5, 4]}
                    agentType="devilsAdvocate"
                    rotation={Math.PI}
                    isSelected={selectedAgent === 'devilsAdvocate'}
                    isHovered={hoveredAgent === 'devilsAdvocate'}
                    onClick={() => handleAgentClick('devilsAdvocate')}
                    onPointerOver={() => setHoveredAgent('devilsAdvocate')}
                    onPointerOut={() => setHoveredAgent(null)}
                />
                <Agent3D
                    position={[-3.5, 0.5, 2]}
                    agentType="councilClerk"
                    rotation={2 * Math.PI / 3}
                    isSelected={selectedAgent === 'councilClerk'}
                    isHovered={hoveredAgent === 'councilClerk'}
                    onClick={() => handleAgentClick('councilClerk')}
                    onPointerOver={() => setHoveredAgent('councilClerk')}
                    onPointerOut={() => setHoveredAgent(null)}
                />
                <Agent3D
                    position={[-3.5, 0.5, -2]}
                    agentType="user"
                    rotation={Math.PI / 3}
                    showNameTag
                />

                {/* Speaking Indicator */}
                {speakingAgent && (
                    <mesh position={[0, 4, 0]}>
                        <octahedronGeometry args={[0.5]} />
                        <meshBasicMaterial color={COLORS.neon.yellow} wireframe />
                    </mesh>
                )}
            </Scene3D>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Header */}
                <div className="absolute top-4 left-4 pointer-events-auto">
                    <button onClick={onBack} className="btn-cyber-outline px-6 py-2 bg-black/80">
                        {'<'} EXIT_CHAMBER
                    </button>
                    <div className="mt-4 cyber-panel p-4 bg-black/60 backdrop-blur w-64">
                        <h1 className="text-xl font-bold text-[#FCEE0A] uppercase tracking-widest">Council Chamber</h1>
                        <p className="text-xs text-gray-400 mt-1">Select an agent to interact or start a general deliberation.</p>
                    </div>
                </div>

                {/* Right Panel: Chat or Intro */}
                {selectedAgent && (
                    <div className="absolute top-4 right-4 bottom-24 w-96 bg-black/90 border-l border-[#FCEE0A] pointer-events-auto flex flex-col clip-corner-bl transition-all animate-in slide-in-from-right">
                        {interactions[selectedAgent]?.hasIntroduced ? (
                            // Chat Interface
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-[#FCEE0A]/30 flex justify-between items-center bg-[#FCEE0A]/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="font-bold text-[#FCEE0A] uppercase tracking-wider">{AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES].name}</span>
                                    </div>
                                    <button onClick={() => setSelectedAgent(null)} className="text-gray-500 hover:text-white">✕</button>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {interactions[selectedAgent].chatHistory.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-3 text-sm ${msg.sender === 'user' ? 'bg-[#FCEE0A]/20 text-white border border-[#FCEE0A]/50 clip-corner-br' : 'bg-gray-800 text-gray-200 border border-gray-700 clip-corner-bl'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {interactions[selectedAgent].chatHistory.length === 0 && (
                                        <div className="mt-8 space-y-2">
                                            <div className="text-center text-gray-500 text-xs mb-4">SUGGESTED QUERIES</div>
                                            {PRESET_PROMPTS.map((prompt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSendMessage(prompt.prompt)}
                                                    className="w-full text-left p-2 bg-[#FCEE0A]/5 border border-[#FCEE0A]/20 text-[#FCEE0A] text-xs hover:bg-[#FCEE0A]/20 transition-colors"
                                                >
                                                    {prompt.emoji} {prompt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-gray-800">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Transmission contents..."
                                            className="flex-1 bg-black border border-gray-700 p-2 text-sm text-white focus:border-[#FCEE0A] outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSendMessage((e.target as HTMLInputElement).value);
                                                    (e.target as HTMLInputElement).value = '';
                                                }
                                            }}
                                        />
                                        <button className="px-3 bg-[#FCEE0A] text-black font-bold text-sm hover:bg-white transition-colors">
                                            SEND
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Introduction Panel
                            <div className="p-8 flex flex-col h-full justify-center text-center">
                                <div className="text-6xl mb-6">{AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES].emoji}</div>
                                <h2 className="text-3xl font-black text-white uppercase mb-2 tracking-widest">
                                    {AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES].name}
                                </h2>
                                <h3 className="text-[#00F0FF] font-mono text-sm mb-6 tracking-wider">
                                    STATUS: ONLINE
                                </h3>
                                <p className="text-gray-300 italic mb-8 border-l-2 border-[#FCEE0A] pl-4 text-left">
                                    {'"'}{AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES].catchphrase}{'"'}
                                </p>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleStartChat}
                                        className="w-full btn-cyber h-12"
                                    >
                                        ESTABLISH UPLINK
                                    </button>
                                    <button
                                        onClick={() => setSelectedAgent(null)}
                                        className="w-full text-gray-500 text-xs hover:text-white uppercase tracking-widest"
                                    >
                                        Terminate Connection
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!selectedAgent && !proposal && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl pointer-events-auto">
                        {error && (
                            <div className="mb-2 bg-red-900/80 border border-red-500 p-3 text-red-200 text-sm flex justify-between items-center">
                                <span>{error}</span>
                                <button onClick={() => setError(null)} className="text-red-400 hover:text-white ml-4">✕</button>
                            </div>
                        )}
                        <div className="mb-2 flex gap-2 justify-center">
                            {PRESET_PROMPTS.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPrompt(p.prompt)}
                                    className="btn-cyber-outline text-[10px] py-1 px-3 bg-black/60 hover:bg-[#FCEE0A]/20"
                                >
                                    {p.emoji} {p.label}
                                </button>
                            ))}
                        </div>
                        <div className="cyber-panel p-1 bg-black/90 clip-corner-all">
                            <div className="p-4 flex gap-4">
                                <input
                                    type="text"
                                    value={currentPrompt}
                                    onChange={(e) => setCurrentPrompt(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && currentPrompt.trim()) handleConsult() }}
                                    placeholder="Enter proposal for council deliberation..."
                                    className="flex-1 bg-transparent border-b border-[#FCEE0A]/50 px-4 py-2 text-[#FCEE0A] placeholder-gray-600 focus:outline-none focus:border-[#FCEE0A]"
                                    disabled={isDeliberating}
                                />
                                <button
                                    onClick={handleConsult}
                                    disabled={isDeliberating || !currentPrompt}
                                    className="btn-cyber px-8 disabled:opacity-50"
                                >
                                    {isDeliberating ? 'DELIBERATING...' : 'CONVENE COUNCIL'}
                                </button>
                            </div>
                            {opinions.length > 0 && (
                                <div className="absolute bottom-full left-0 w-full mb-4 space-y-2 px-4">
                                    {opinions.slice(-3).map((op, i) => {
                                        const stanceColor = op.stance === 'support' ? 'text-green-500'
                                            : op.stance === 'neutral' ? 'text-blue-400'
                                            : 'text-red-500'
                                        return (
                                            <div key={i} className="bg-black/80 border border-gray-700 p-3 rounded clip-corner-tr animate-in slide-in-from-bottom">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className={`${stanceColor} font-bold uppercase`}>[{op.stance}]</span>
                                                    <span className="text-[#FCEE0A]">
                                                        {AGENT_TYPES[op.agent as keyof typeof AGENT_TYPES]?.name || op.agent}
                                                        {op.confidence != null && <span className="text-gray-500 ml-2">{op.confidence}%</span>}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300 text-sm">{op.reasoning}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Proposal Result Card */}
                {proposal && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto z-50">
                        <ProposalCard proposal={proposal} onResolve={() => { setProposal(null); setOpinions([]) }} />
                    </div>
                )}
            </div>
        </div>
    )
}

function RoundTable() {
    return (
        <group position={[0, -0.1, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[4, 4, 0.2, 32]} />
                <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Glowing Ring */}
            <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[3.8, 3.9, 64]} />
                <meshBasicMaterial color={COLORS.neon.cyan} />
            </mesh>
            {/* Center Hologram base */}
            <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[1, 1.2, 0.1, 16]} />
                <meshStandardMaterial color="#222" />
            </mesh>
        </group>
    )
}


function ProposalCard({ proposal, onResolve }: { proposal: any, onResolve: () => void }) {
    const { actions } = useGame()
    const votes = proposal.votes || { support: 0, oppose: 0, abstain: 0 }
    const totalVotes = votes.support + votes.oppose + votes.abstain

    const handleExecute = () => {
        actions.executeProposal(proposal.id)
        onResolve()
    }

    const riskColor = proposal.risk === 'low' ? '#00FF00' : proposal.risk === 'high' ? '#FF0000' : '#FFA500'

    return (
        <div className="cyber-panel p-1 w-full max-w-2xl clip-corner-all animate-in zoom-in">
            <div className="bg-[#050510] p-8 clip-corner-all border border-[#FCEE0A]/30">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="text-[#FCEE0A] text-xs font-mono uppercase tracking-widest">FINAL CONSENSUS</div>
                        <h2 className="text-3xl font-black text-white">{proposal.action}</h2>
                    </div>
                    <div className="bg-[#FCEE0A] text-black px-3 py-1 font-bold text-sm uppercase">
                        {proposal.consensus}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#111] p-3 border-l-2 border-[#00F0FF]">
                        <div className="text-gray-500 text-xs uppercase">Input</div>
                        <div className="text-white font-mono font-bold">{proposal.inputAmount} {proposal.inputToken}</div>
                    </div>
                    <div className="bg-[#111] p-3 border-l-2 border-[#00FF00]">
                        <div className="text-gray-500 text-xs uppercase">Expected Output</div>
                        <div className="text-[#00FF00] font-mono font-bold">{proposal.expectedOutput}</div>
                    </div>
                    <div className="bg-[#111] p-3 border-l-2" style={{ borderColor: riskColor }}>
                        <div className="text-gray-500 text-xs uppercase">Risk</div>
                        <div className="font-mono font-bold uppercase" style={{ color: riskColor }}>{proposal.risk}</div>
                    </div>
                </div>

                {totalVotes > 0 && (
                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>SUPPORT: {votes.support}</span>
                            <span>OPPOSE: {votes.oppose}</span>
                            <span>ABSTAIN: {votes.abstain}</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded flex overflow-hidden">
                            {votes.support > 0 && <div className="bg-green-500 h-full" style={{ width: `${(votes.support / totalVotes) * 100}%` }} />}
                            {votes.oppose > 0 && <div className="bg-red-500 h-full" style={{ width: `${(votes.oppose / totalVotes) * 100}%` }} />}
                            {votes.abstain > 0 && <div className="bg-gray-500 h-full" style={{ width: `${(votes.abstain / totalVotes) * 100}%` }} />}
                        </div>
                    </div>
                )}

                <div className="bg-[#222] p-4 text-gray-300 italic mb-8 border border-gray-700">
                    {'"'}{proposal.reasoning}{'"'}
                </div>

                <div className="flex gap-4">
                    <button onClick={handleExecute} className="flex-1 btn-cyber h-14 text-lg">
                        AUTHORIZE EXECUTION
                    </button>
                    <button onClick={onResolve} className="flex-1 btn-cyber-outline h-14 text-lg border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                        REJECT
                    </button>
                </div>
            </div>
        </div>
    )
}
