'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Scene3D from './Scene3D'
import { Building, Road, Ground, StreetLamp } from './3d/Buildings'
import { Agent3D, DeploymentEffect, Coin3D, FloatingText } from './3d/Agents'
import { MOCK_AGENTS, BUILDINGS_CONFIG, LAMP_POSITIONS, COIN_CONFIG, WALKING_PATH_NODES, ROADS_CONFIG, INITIAL_COINS } from '@/lib/game-constants'
import { useGame } from '@/contexts/GameContext'

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { IDENTITY_REGISTRY_ADDRESS, REGISTER_ABI, addUserAgentTokenId } from '@/lib/erc8004/client'

// Separate component for game logic loop inside Canvas
function GameLoop() {
    // This could handle frame-by-frame updates if needed
    // Currently logic is handled via useEffect in main component or inside individual agents
    return null
}

interface CityView3DProps {
    onEnterCouncil: () => void
}

export default function CityView3D({ onEnterCouncil }: CityView3DProps) {
    const { state, actions } = useGame()
    const [showDeployEffect, setShowDeployEffect] = useState<[number, number, number] | null>(null)
    const [coins, setCoins] = useState<{ id: string, position: [number, number, number], type: 'bronze' | 'silver' | 'gold', collected: boolean }[]>([])
    const [visuals, setVisuals] = useState<{ id: number, position: [number, number, number], text: string, color: string }[]>([])
    const [hasMounted, setHasMounted] = useState(false)
    const [showMarketplace, setShowMarketplace] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    // Initialize coins
    useEffect(() => {
        const initialCoins = INITIAL_COINS.map(c => ({
            ...c,
            position: c.position as [number, number, number],
            type: c.type as 'gold' | 'silver' | 'bronze',
            collected: false
        }))
        setCoins(initialCoins)
    }, [])

    const handleDeployAgent = async (agentId: string) => {
        // Calculate spawn position based on count
        // Spawn near the start of the main avenue
        const spawnPos = [0 + (Math.random() - 0.5) * 2, 0, 8 + (Math.random() - 0.5) * 2] as [number, number, number]

        setShowDeployEffect(spawnPos)
        await actions.deployAgent(agentId)
        setTimeout(() => setShowDeployEffect(null), 2000)
    }

    // Coin Collection Logic (Simplified distance check)
    // In a real game, this would be in the game loop
    const checkCoinCollection = (agentPos: [number, number, number]) => {
        setCoins(prev => prev.map(coin => {
            if (coin.collected) return coin
            const dx = agentPos[0] - coin.position[0]
            const dz = agentPos[2] - coin.position[2]
            const dist = Math.sqrt(dx * dx + dz * dz)

            if (dist < 1.0) {
                // Collect!
                actions.collectCoin(COIN_CONFIG[coin.type].value)
                // Add visual
                const val = COIN_CONFIG[coin.type].value
                const text = `+${val >= 1 ? val : val.toFixed(1)} ETH`
                setVisuals(prev => [...prev, {
                    id: Date.now(),
                    position: [...coin.position] as [number, number, number],
                    text,
                    color: COIN_CONFIG[coin.type].color === '#CD7F32' ? '#FCEE0A' : COIN_CONFIG[coin.type].color // Ensure decent contrast
                }])
                return { ...coin, collected: true }
            }
            return coin
        }))
    }

    // Auto-walking logic wrapper component
    const AutoWalkingAgents = useMemo(() => {
        return state.deployedAgents.map((agent) => (
            <WalkingAgentWrapper
                key={agent.id}
                agent={agent}
                onPosUpdate={checkCoinCollection}
            />
        ))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.deployedAgents, coins])

    return (
        <div className="w-full h-full relative">
            {/* 3D Scene */}
            <div style={showMarketplace ? { visibility: 'hidden' } : undefined}>
            <Scene3D
                cameraPosition={[22, 22, 22]}
                cameraMode="isometric"
                enablePostProcessing
            >
                {/* Logic Loop */}
                <GameLoop />

                {/* Environment */}
                <Ground />

                {/* Roads - Dynamic Grid from Config */}
                {ROADS_CONFIG.map((road, i) => (
                    <Road
                        key={i}
                        position={road.position as [number, number, number]}
                        width={road.width}
                        length={road.length}
                        rotation={road.rotation}
                    />
                ))}

                {/* Buildings */}
                {BUILDINGS_CONFIG.map((b, i) => (
                    <Building
                        key={i}
                        position={b.position as [number, number, number]}
                        width={b.size[0]}
                        height={b.size[1]}
                        depth={b.size[2]}
                        type={b.type as any}
                        onClick={b.type === 'council' ? onEnterCouncil : undefined}
                    />
                ))}

                {/* Street Lamps */}
                {LAMP_POSITIONS.map((pos, i) => (
                    <StreetLamp key={`lamp-${i}`} position={pos} />
                ))}

                {/* Coins */}
                {coins.map(coin => (
                    <Coin3D key={coin.id} position={coin.position} type={coin.type} isCollected={coin.collected} />
                ))}

                {/* Score Visuals */}
                {visuals.map(v => (
                    <FloatingText
                        key={v.id}
                        position={v.position}
                        text={v.text}
                        color={v.color}
                        onComplete={() => setVisuals(prev => prev.filter(p => p.id !== v.id))}
                    />
                ))}

                {/* Agents */}
                {AutoWalkingAgents}

                {/* Effects */}
                {showDeployEffect && <DeploymentEffect position={showDeployEffect} />}
            </Scene3D>
            </div>

            {/* Deployment Panel (Right Side) */}
            <div className="absolute top-12 right-4 w-72 max-h-[calc(100vh-6rem)] overflow-y-auto cyber-panel clip-corner-all bg-black/90">
                <AgentPanel
                    agents={MOCK_AGENTS}
                    deployedCount={state.deployedAgents.length}
                    onDeploy={handleDeployAgent}
                    deployedIds={state.deployedAgents.map(a => a.agentId)}
                    balance={state.ytestBalance}
                />
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#050510]/95 border-t border-[#FCEE0A]/30 px-4 py-2 z-30">
                <div className="flex justify-between items-center font-mono text-xs">
                    <div className="flex gap-4 items-center">
                        <span className="text-[#FCEE0A] uppercase tracking-wider">
                            ACTIVE_AGENTS: <span className="text-white font-bold">{state.deployedAgents.length}/6</span>
                        </span>
                        <div className="h-3 w-px bg-[#FCEE0A]/30"></div>
                        <button
                            onClick={() => setShowMarketplace(true)}
                            className="text-[#00F0FF] uppercase tracking-wider hover:text-[#FCEE0A] transition-colors"
                        >
                            {'>'} AGENT_MARKETPLACE
                        </button>
                    </div>
                    <div className="flex gap-3 items-center">
                        <span className="text-gray-500">XP:</span>
                        <span className="text-[#00F0FF] font-bold">{hasMounted ? state.xpTotal : 0}</span>
                        <div className="h-3 w-px bg-gray-600"></div>
                        <span className="text-gray-500">BALANCE:</span>
                        <span className="text-[#FCEE0A] font-bold">{hasMounted ? state.ytestBalance.toFixed(3) : '0.000'} YES</span>
                    </div>
                </div>
            </div>

            {showMarketplace && <AgentMarketplace onClose={() => setShowMarketplace(false)} />}
        </div>
    )
}

// Wrapper to handle individual agent walking logic
function WalkingAgentWrapper({ agent, onPosUpdate }: { agent: any, onPosUpdate: (pos: [number, number, number]) => void }) {
    const [position, setPosition] = useState<[number, number, number]>(agent.position)
    const [target, setTarget] = useState<[number, number, number] | null>(null)
    const [rotation, setRotation] = useState(0)

    // Graph-based walk logic
    useEffect(() => {
        if (!target) {
            // Find current node ID or closest node
            let currentNodeId = '5' // Default center

            // Find closest node to current position
            let minDist = Infinity
            WALKING_PATH_NODES.forEach(node => {
                const t = node.position as [number, number, number]
                const d = Math.pow(t[0] - position[0], 2) + Math.pow(t[2] - position[2], 2)
                if (d < minDist) {
                    minDist = d
                    currentNodeId = node.id
                }
            })

            // Get connected nodes
            const node = WALKING_PATH_NODES.find(n => n.id === currentNodeId)
            if (node && node.connections.length > 0) {
                // Pick random connection
                const nextId = node.connections[Math.floor(Math.random() * node.connections.length)]
                const nextNode = WALKING_PATH_NODES.find(n => n.id === nextId)
                if (nextNode) {
                    // Add slight jitter but keep on road width
                    const t = nextNode.position as [number, number, number]
                    // Road width is 2, so +/- 0.8 is safe
                    setTarget([t[0] + (Math.random() - 0.5) * 1.5, t[1], t[2] + (Math.random() - 0.5) * 1.5])
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target])

    // Movement Loop
    useFrame((_, delta) => {
        if (target) {
            const speed = 2 * delta
            const dx = target[0] - position[0]
            const dz = target[2] - position[2]
            const dist = Math.sqrt(dx * dx + dz * dz)

            if (dist < 0.2) {
                setTarget(null) // Arrived
            } else {
                // Move towards target
                const vx = (dx / dist) * speed
                const vz = (dz / dist) * speed
                const newPos: [number, number, number] = [position[0] + vx, position[1], position[2] + vz]

                setPosition(newPos)
                setRotation(Math.atan2(dx, dz))
                onPosUpdate(newPos)
            }
        }
    })

    return (
        <Agent3D
            position={position}
            agentType={agent.type}
            isWalking={!!target}
            rotation={rotation}
            showNameTag
            isHovered // Keep name tag mostly visible for effect
        />
    )
}

interface RegistryAgent {
    agentId: number
    name: string
    description: string
    image: string
    strategy: string
    riskTolerance: string
    reputation?: number
    registrySource: string
}

function AgentMarketplace({ onClose }: { onClose: () => void }) {
    const [agents, setAgents] = useState<RegistryAgent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/agents/list')
            .then(res => res.json())
            .then(data => { setAgents(data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#050510]">
            <div className="w-[600px] max-h-[80vh] bg-[#050510] border border-[#FCEE0A]/40 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-[#FCEE0A]/10 border-b border-[#FCEE0A]/30">
                    <div>
                        <h2 className="text-lg font-black text-[#FCEE0A] uppercase tracking-widest">AGENT_REGISTRY</h2>
                        <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">ERC-8004 ON-CHAIN REGISTRY // BASE SEPOLIA</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-[#FCEE0A] text-xl font-bold transition-colors">
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(80vh-60px)] p-4 space-y-3 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-8">
                            <span className="text-[#00F0FF] font-mono text-sm animate-pulse">QUERYING ON-CHAIN REGISTRY...</span>
                        </div>
                    ) : agents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 font-mono text-sm">NO AGENTS FOUND</div>
                    ) : (
                        agents.map(agent => (
                            <div key={agent.agentId} className="bg-black/60 border border-[#FCEE0A]/20 p-4 hover:border-[#FCEE0A]/50 transition-all">
                                <div className="flex gap-4">
                                    <img
                                        src={agent.image}
                                        alt={agent.name}
                                        className="w-16 h-16 object-cover border border-[#FCEE0A]/30"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">{agent.name}</h3>
                                            <span className="text-[8px] bg-[#00FF88]/20 text-[#00FF88] px-1.5 py-0.5 border border-[#00FF88]/30 font-mono uppercase">
                                                {agent.registrySource}
                                            </span>
                                            <a
                                                href={`https://sepolia.basescan.org/token/0x8004A818BFB912233c491871b3d84c89A494BD9e?a=${agent.agentId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[8px] bg-[#00F0FF]/20 text-[#00F0FF] px-1.5 py-0.5 border border-[#00F0FF]/30 font-mono hover:bg-[#00F0FF]/40 transition-colors"
                                            >
                                                #{agent.agentId}
                                            </a>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">{agent.description}</p>
                                        <div className="flex gap-3 text-[10px] font-mono">
                                            <span className="text-[#FCEE0A]">STRATEGY: <span className="text-white">{agent.strategy?.toUpperCase()}</span></span>
                                            <span className="text-[#FCEE0A]">RISK: <span className="text-white">{agent.riskTolerance?.toUpperCase()}</span></span>
                                            {agent.reputation !== undefined && (
                                                <span className="text-[#FCEE0A]">REP: <span className="text-white">{agent.reputation}/100</span></span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

function AgentPanel({
    agents,
    deployedCount,
    onDeploy,
    deployedIds,
    balance
}: {
    agents: typeof MOCK_AGENTS
    deployedCount: number
    onDeploy: (id: string) => void
    deployedIds: string[]
    balance: number
}) {
    const [isCreating, setIsCreating] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        strategy: 'dca',
        riskTolerance: 'moderate',
        description: ''
    })
    const CUSTOM_AGENTS_KEY = 'agentropolis_custom_agents'
    const [customAgents, setCustomAgents] = useState<{ id: string; name: string; strategy: string; reputation: number; type: string; txHash?: string }[]>(() => {
        if (typeof window === 'undefined') return []
        try {
            const stored = localStorage.getItem(CUSTOM_AGENTS_KEY)
            return stored ? JSON.parse(stored) : []
        } catch { return [] }
    })
    const processedHashRef = useRef<string | null>(null)
    const formDataRef = useRef(formData)
    formDataRef.current = formData
    
    const { isConnected } = useAccount()
    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        if (isSuccess && receipt && hash && processedHashRef.current !== hash) {
            processedHashRef.current = hash
            const transferLog = receipt.logs[0]
            if (transferLog && transferLog.topics[3]) {
                const tokenId = parseInt(transferLog.topics[3], 16)
                addUserAgentTokenId(tokenId)

                const fd = formDataRef.current
                const newAgent = {
                    id: tokenId.toString(),
                    name: fd.name || `Agent #${tokenId}`,
                    strategy: fd.strategy,
                    reputation: 50,
                    type: fd.strategy === 'dca' || fd.strategy === 'arbitrage' ? 'alphaHunter' : 'macroOracle',
                    txHash: hash
                }
                
                setCustomAgents(prev => {
                    const updated = [...prev, newAgent]
                    localStorage.setItem(CUSTOM_AGENTS_KEY, JSON.stringify(updated))
                    return updated
                })
                
                fetch('/api/agents/metadata', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tokenId, metadata: fd })
                }).catch(e => console.error('Failed to update metadata', e))

                setIsCreating(false)
                setFormData({ name: '', strategy: 'dca', riskTolerance: 'moderate', description: '' })
            }
        }
    }, [isSuccess, receipt, hash])

    const handleRegister = async () => {
        if (!isConnected) return
        
        const tempId = Date.now()
        
        try {
            await fetch('/api/agents/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokenId: tempId, metadata: formData })
            })

            const metadataURI = `${window.location.origin}/api/agents/metadata?tokenId=${tempId}`
            
            writeContract({
                address: IDENTITY_REGISTRY_ADDRESS,
                abi: REGISTER_ABI,
                functionName: 'register',
                args: [metadataURI]
            })
        } catch (e) {
            console.error('Registration failed', e)
        }
    }

    const allAgents = [...customAgents, ...agents.map(a => ({ ...a, txHash: undefined as string | undefined }))]

    return (
        <div className="bg-transparent overflow-hidden">
            {/* Header */}
            <div className="bg-[#FCEE0A]/10 border-b border-[#FCEE0A]/30 px-5 py-3 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-black text-[#FCEE0A] uppercase tracking-widest leading-none">
                        UNIT_DEPLOY
                    </h2>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-white leading-none font-mono">
                        {deployedCount}<span className="text-gray-500 text-sm">/6</span>
                    </div>
                </div>
            </div>

            <div className="p-3 border-b border-[#FCEE0A]/30">
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="w-full py-2 bg-[#FCEE0A]/20 border border-[#FCEE0A] text-[#FCEE0A] font-bold text-xs uppercase tracking-widest hover:bg-[#FCEE0A] hover:text-black transition-all"
                >
                    {isCreating ? 'CANCEL CREATION' : '+ CREATE AGENT'}
                </button>

                {isCreating && (
                    <div className="mt-3 space-y-3 bg-black/60 p-3 border border-[#FCEE0A]/30">
                        <div>
                            <label className="block text-[10px] text-[#FCEE0A] uppercase tracking-wider mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/80 border border-[#FCEE0A]/30 text-white text-xs p-2 focus:border-[#FCEE0A] outline-none font-mono"
                                placeholder="AGENT NAME"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-[#FCEE0A] uppercase tracking-wider mb-1">Strategy</label>
                                <select
                                    value={formData.strategy}
                                    onChange={e => setFormData({ ...formData, strategy: e.target.value })}
                                    className="w-full bg-black/80 border border-[#FCEE0A]/30 text-white text-xs p-2 focus:border-[#FCEE0A] outline-none font-mono uppercase"
                                >
                                    <option value="dca">DCA</option>
                                    <option value="momentum">Momentum</option>
                                    <option value="arbitrage">Arbitrage</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-[#FCEE0A] uppercase tracking-wider mb-1">Risk</label>
                                <select
                                    value={formData.riskTolerance}
                                    onChange={e => setFormData({ ...formData, riskTolerance: e.target.value })}
                                    className="w-full bg-black/80 border border-[#FCEE0A]/30 text-white text-xs p-2 focus:border-[#FCEE0A] outline-none font-mono uppercase"
                                >
                                    <option value="conservative">Low</option>
                                    <option value="moderate">Mid</option>
                                    <option value="aggressive">High</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] text-[#FCEE0A] uppercase tracking-wider mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black/80 border border-[#FCEE0A]/30 text-white text-xs p-2 focus:border-[#FCEE0A] outline-none font-mono h-16 resize-none"
                                placeholder="AGENT BEHAVIOR..."
                            />
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={!isConnected || isPending || isConfirming || !formData.name}
                            className={`
                                w-full py-2 font-bold text-xs uppercase tracking-widest transition-all
                                ${!isConnected 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : isPending || isConfirming
                                        ? 'bg-[#FCEE0A]/50 text-black cursor-wait'
                                        : 'bg-[#FCEE0A] text-black hover:bg-[#FF00FF] hover:text-white'
                                }
                            `}
                        >
                            {!isConnected ? 'CONNECT WALLET' : isPending ? 'CONFIRM TX...' : isConfirming ? 'REGISTERING...' : 'REGISTER ON-CHAIN'}
                        </button>
                    </div>
                )}
            </div>

            {/* Agent List */}
            <div className="p-3 space-y-2">
                {allAgents.map((agent) => {
                    const isDeployed = deployedIds.includes(agent.id)
                    const canAfford = balance >= 0.01
                    const isCustom = !!agent.txHash

                    return (
                        <div
                            key={agent.id}
                            className={`
                                relative p-3 border-l-2 transition-all duration-200 group
                                ${isDeployed
                                    ? 'bg-[#FCEE0A]/5 border-[#00FF00]'
                                    : 'bg-black/40 border-[#FCEE0A]/30 hover:bg-[#FCEE0A]/5 hover:border-[#FCEE0A]'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-white leading-none mb-1 text-sm uppercase font-mono tracking-wider flex items-center gap-2">
                                        {agent.name}
                                        {isCustom && (
                                            <a 
                                                href={`https://sepolia.basescan.org/tx/${agent.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[8px] bg-[#00F0FF]/20 text-[#00F0FF] px-1 rounded border border-[#00F0FF]/30 hover:bg-[#00F0FF]/40"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                TX
                                            </a>
                                        )}
                                    </h3>
                                    <p className="text-[10px] text-[#8a8a8a] uppercase tracking-wide font-mono">
                                        {agent.strategy}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-[#FCEE0A] font-mono">0.01 YES</span>
                                </div>
                            </div>

                            <button
                                onClick={() => onDeploy(agent.id)}
                                disabled={isDeployed || deployedCount >= 6 || !canAfford}
                                className={`
                                    w-full py-1.5 font-bold text-xs uppercase tracking-widest transition-all clip-corner-tr
                                    ${isDeployed
                                        ? 'bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 cursor-not-allowed'
                                        : !canAfford
                                            ? 'bg-red-900/50 text-red-500 border border-red-900 cursor-not-allowed'
                                            : 'bg-[#FCEE0A] text-black hover:bg-[#FF00FF] hover:text-white'
                                    }
                                `}
                            >
                                {isDeployed ? '>> ACTIVE <<' : canAfford ? 'INITIALIZE' : 'INSUFFICIENT FUNDS'}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
