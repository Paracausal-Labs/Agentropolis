'use client'

import { useState, useRef, useEffect } from 'react'
import Scene3D from './Scene3D'
import { Agent3D } from './3d/Agents'
import { COLORS, AGENT_TYPES, PRESET_PROMPTS, MOCK_AGENTS } from '@/lib/game-constants'
import { useGame } from '@/contexts/GameContext'
import { useStrategyExecutor } from '@/lib/uniswap/strategy-router'
import { useAccount } from 'wagmi'

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
    const { state: gameState, actions } = useGame()
    const { address } = useAccount()

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
    const [hookParameters, setHookParameters] = useState<any | null>(null)
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
        setHookParameters(null)
        setError(null)
        actions.startDeliberation()

        try {
            const res = await fetch('/api/agents/council', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userPrompt: currentPrompt,
                    walletAddress: address,
                    deployedAgents: gameState.deployedAgents.map(a => {
                        const agentConfig = MOCK_AGENTS.find(m => m.id === a.agentId)
                        return {
                            id: a.agentId,
                            name: agentConfig?.name || a.agentId,
                            strategy: agentConfig?.strategy,
                        }
                    }),
                }),
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

            if (data.hookParameters) {
                setHookParameters(data.hookParameters)
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

                {/* Hook Parameters Panel */}
                {hookParameters && (
                    <div className="absolute top-48 left-4 w-64 pointer-events-auto animate-in slide-in-from-left duration-500 z-40">
                        <div className="cyber-panel p-4 bg-black/90 border border-[#00F0FF]/50 clip-corner-br">
                            <div className="flex items-center gap-2 mb-3 border-b border-[#00F0FF]/30 pb-2">
                                <div className="w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse" />
                                <span className="text-[#00F0FF] text-xs font-bold tracking-widest">HOOK PARAMS UPDATED</span>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="text-[#00F0FF] text-[10px] uppercase tracking-wider mb-1">Dynamic Fee</div>
                                    <div className="text-white font-mono text-lg">
                                        {(hookParameters.feeBps / 100).toFixed(2)}%
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[#00F0FF] text-[10px] uppercase tracking-wider mb-1">Max Swap Size</div>
                                    <div className="text-white font-mono text-lg">
                                        {parseFloat((Number(hookParameters.maxSwapSize) / 1e18).toString()).toFixed(2)} ETH
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[#00F0FF] text-[10px] uppercase tracking-wider mb-1">Market Sentiment</div>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`font-mono text-lg ${hookParameters.sentimentScore > 0 ? 'text-green-400' : hookParameters.sentimentScore < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                            {hookParameters.sentimentScore > 0 ? '+' : ''}{hookParameters.sentimentScore}
                                        </span>
                                    </div>
                                    <div className="text-gray-400 text-xs italic mt-1 leading-tight">
                                        &ldquo;{hookParameters.sentimentReason}&rdquo;
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-[#00F0FF]/30">
                                <div className="flex items-center gap-2 text-[10px] text-[#00F0FF]">
                                    <span>ON-CHAIN SYNC</span>
                                    <span className="flex-1 h-px bg-[#00F0FF]/50"></span>
                                    <span>✓</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Panel: Chat, Intro, or Deliberation Transcript */}
                {(selectedAgent || opinions.length > 0) && (
                    <div className="absolute top-4 right-4 bottom-24 w-96 pointer-events-auto flex flex-col transition-all animate-in slide-in-from-right z-10">
                        {selectedAgent ? (
                            <div className="w-full h-full bg-black/90 border-l border-[#FCEE0A] clip-corner-bl flex flex-col">
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
                        ) : (
                            <DeliberationTranscript opinions={opinions} />
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
                        </div>
                    </div>
                )}

                {/* Proposal Result Card */}
                {proposal && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto z-50">
                        <ProposalCard proposal={proposal} opinions={opinions} onResolve={() => { setProposal(null); setOpinions([]) }} />
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


function ProposalCard({ proposal, opinions, onResolve }: { proposal: any, opinions: any[], onResolve: () => void }) {
    const { actions } = useGame()
    const { execute } = useStrategyExecutor()
    const [executing, setExecuting] = useState(false)
    const [swapResult, setSwapResult] = useState<{ status: string; txHash?: string; error?: string } | null>(null)
    const [showDeliberation, setShowDeliberation] = useState(false)
    const votes = proposal.votes || { support: 0, oppose: 0, abstain: 0 }
    const totalVotes = votes.support + votes.oppose + votes.abstain

    const handleExecute = async () => {
        actions.executeProposal(proposal.id)

        const apiProposal = proposal._apiProposal
        if (apiProposal) {
            setExecuting(true)
            try {
                const result = await execute(apiProposal)
                if (result.success) {
                    setSwapResult({ status: 'success', txHash: result.txHash })
                    console.log('[CouncilRoom] Swap executed:', result.txHash)
                } else {
                    setSwapResult({ status: 'error', error: result.error })
                    console.error('[CouncilRoom] Swap failed:', result.error)
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error'
                setSwapResult({ status: 'error', error: msg })
                console.error('[CouncilRoom] Swap error:', err)
            } finally {
                setExecuting(false)
            }
        } else {
            onResolve()
        }
    }

    const riskColor = proposal.risk === 'low' ? '#00FF00' : proposal.risk === 'high' ? '#FF0000' : '#FFA500'

    return (
        <div className="cyber-panel p-1 w-full max-w-2xl clip-corner-all animate-in zoom-in flex flex-col max-h-[90vh]">
            <div className="bg-[#050510] p-8 clip-corner-all border border-[#FCEE0A]/30 overflow-y-auto custom-scrollbar">
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

                <div className="bg-[#222] p-4 text-gray-300 italic mb-6 border border-gray-700">
                    {'"'}{proposal.reasoning}{'"'}
                </div>

                {/* Deliberation Transcript Toggle */}
                <div className="mb-8 border border-gray-800 bg-[#111]">
                    <button 
                        onClick={() => setShowDeliberation(!showDeliberation)}
                        className="w-full flex justify-between items-center p-3 hover:bg-gray-800 transition-colors"
                    >
                        <span className="text-[#FCEE0A] text-xs font-mono uppercase tracking-widest">
                            {showDeliberation ? 'Hide' : 'View'} Full Deliberation ({opinions.length})
                        </span>
                        <span className="text-[#FCEE0A]">{showDeliberation ? '▲' : '▼'}</span>
                    </button>
                    
                    {showDeliberation && (
                        <div className="p-4 border-t border-gray-800 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                            {opinions.map((op, i) => (
                                <div key={i} className="text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span>{AGENT_TYPES[op.agent as keyof typeof AGENT_TYPES]?.emoji}</span>
                                        <span className={`font-bold text-xs uppercase ${
                                            op.stance === 'support' ? 'text-green-500' : 
                                            op.stance === 'neutral' ? 'text-blue-400' : 'text-red-500'
                                        }`}>
                                            {AGENT_TYPES[op.agent as keyof typeof AGENT_TYPES]?.name || op.agent}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-xs pl-6 border-l border-gray-700 ml-1">
                                        {op.reasoning}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {swapResult ? (
                    <div>
                        <div className={`p-3 border mb-4 ${swapResult.status === 'success' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
                            {swapResult.status === 'success' ? (
                                <div>
                                    <div className="font-bold">Swap Executed!</div>
                                    {swapResult.txHash && (
                                        <a href={`https://sepolia.basescan.org/tx/${swapResult.txHash}`} target="_blank" rel="noopener noreferrer" className="underline text-sm">
                                            View on BaseScan
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div className="font-bold">Swap Failed</div>
                                    <div className="text-sm">{swapResult.error}</div>
                                </div>
                            )}
                        </div>
                        <button onClick={onResolve} className="w-full btn-cyber h-14 text-lg">
                            DONE
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <button onClick={handleExecute} disabled={executing} className="flex-1 btn-cyber h-14 text-lg disabled:opacity-50">
                            {executing ? 'EXECUTING...' : 'AUTHORIZE EXECUTION'}
                        </button>
                        <button onClick={onResolve} disabled={executing} className="flex-1 btn-cyber-outline h-14 text-lg border-red-500 text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50">
                            REJECT
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function DeliberationTranscript({ opinions }: { opinions: any[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [opinions])

    return (
        <div className="w-full h-full bg-black/90 border-l border-[#FCEE0A] clip-corner-bl flex flex-col">
            <div className="p-4 border-b border-[#FCEE0A]/30 bg-[#FCEE0A]/10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#FCEE0A] animate-pulse"></div>
                    <span className="font-bold text-[#FCEE0A] uppercase tracking-wider">Council Deliberation</span>
                </div>
            </div>
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {opinions.map((op, i) => {
                     const stanceColor = op.stance === 'support' ? 'text-green-500'
                        : op.stance === 'neutral' ? 'text-blue-400'
                        : 'text-red-500'
                     const borderColor = op.stance === 'support' ? 'border-green-500/30'
                        : op.stance === 'neutral' ? 'border-blue-400/30'
                        : 'border-red-500/30'
                    
                    return (
                        <div key={i} className={`bg-black/40 border ${borderColor} p-3 clip-corner-br animate-in slide-in-from-right duration-500`}>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{AGENT_TYPES[op.agent as keyof typeof AGENT_TYPES]?.emoji}</span>
                                    <span className="text-[#FCEE0A] font-bold text-xs uppercase">
                                        {AGENT_TYPES[op.agent as keyof typeof AGENT_TYPES]?.name || op.agent}
                                    </span>
                                </div>
                                <span className={`${stanceColor} text-[10px] font-bold uppercase border border-current px-1 rounded`}>
                                    {op.stance}
                                </span>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed">{op.reasoning}</p>
                            {op.confidence && (
                                <div className="mt-2 flex justify-end">
                                    <span className="text-[10px] text-gray-500">Confidence: {op.confidence}%</span>
                                </div>
                            )}
                        </div>
                    )
                })}
                {opinions.length === 0 && (
                    <div className="text-center text-gray-500 text-xs mt-10 italic">
                        Waiting for council to convene...
                    </div>
                )}
            </div>
        </div>
    )
}
