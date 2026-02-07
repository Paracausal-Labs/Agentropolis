'use client'

import { useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import Scene3D from './Scene3D'
import { Building, Road, Ground, StreetLamp } from './3d/Buildings'
import { Agent3D, DeploymentEffect, Coin3D, FloatingText } from './3d/Agents'
import { MOCK_AGENTS, BUILDINGS_CONFIG, LAMP_POSITIONS, COIN_CONFIG, WALKING_PATH_NODES, ROADS_CONFIG, INITIAL_COINS } from '@/lib/game-constants'
import { useGame } from '@/contexts/GameContext'

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

    // Fix hydration mismatch
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
                        <span className="text-[#00F0FF] animate-pulse">
                            {'>'} CITY_OPERATIONS_NORMAL
                        </span>
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

            {/* Hover Trap for Buildings */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ display: 'none' }} // Actually handled by 3D events, but could add UI tooltips here
            />
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

            {/* Agent List */}
            <div className="p-3 space-y-2">
                {agents.map((agent) => {
                    const isDeployed = deployedIds.includes(agent.id)
                    const canAfford = balance >= 0.01

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
                                    <h3 className="font-bold text-white leading-none mb-1 text-sm uppercase font-mono tracking-wider">
                                        {agent.name}
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
