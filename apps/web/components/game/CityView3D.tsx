'use client'

import { useState, useCallback } from 'react'
import Scene3D from './Scene3D'
import { Building, Road, Ground } from './3d/Buildings'
import { Agent3D, DeploymentEffect } from './3d/Agents'
import { MOCK_AGENTS } from '@/lib/game-constants'

interface DeployedAgent {
    id: string
    position: [number, number, number]
    type: keyof typeof import('@/lib/game-constants').AGENT_TYPES
}

export default function CityView3D({ onEnterCouncil }: { onEnterCouncil: () => void }) {
    const [deployedAgents, setDeployedAgents] = useState<DeployedAgent[]>([])
    const [showDeployEffect, setShowDeployEffect] = useState<[number, number, number] | null>(null)
    const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null)

    const handleDeployAgent = useCallback((agentId: string) => {
        const agent = MOCK_AGENTS.find((a) => a.id === agentId)
        if (!agent || deployedAgents.length >= 6) return

        // Predefined positions for agents
        const positions: [number, number, number][] = [
            [-4, 0, -4],
            [4, 0, -4],
            [-4, 0, 4],
            [4, 0, 4],
            [-6, 0, 0],
            [6, 0, 0],
        ]

        const position = positions[deployedAgents.length]

        setShowDeployEffect(position)
        setTimeout(() => {
            setDeployedAgents((prev) => [
                ...prev,
                {
                    id: agentId,
                    position,
                    type: agent.type as keyof typeof import('@/lib/game-constants').AGENT_TYPES,
                },
            ])
            setShowDeployEffect(null)
        }, 1000)
    }, [deployedAgents])

    return (
        <div className="w-full h-full relative">
            {/* 3D Scene */}
            <Scene3D
                cameraPosition={[12, 12, 12]}
                cameraMode="isometric"
                enablePostProcessing
            >
                {/* Ground */}
                <Ground />

                {/* Roads */}
                <Road position={[0, 0, 0]} width={1.5} length={20} />
                <Road position={[0, 0, 0]} width={20} length={1.5} rotation={Math.PI / 2} />
                <Road position={[5, 0, 0]} width={1.5} length={10} />
                <Road position={[-5, 0, 0]} width={1.5} length={10} />

                {/* Buildings */}
                {/* Council Hall - CENTER */}
                <Building
                    position={[0, 2, 0]}
                    width={3}
                    height={4}
                    depth={3}
                    type="council"
                    onClick={onEnterCouncil}
                    isHovered={hoveredBuilding === 'council'}
                />

                {/* Office Buildings */}
                <Building
                    position={[-6, 1.5, -6]}
                    width={2}
                    height={3}
                    depth={2}
                    type="office"
                />
                <Building
                    position={[6, 1.5, -6]}
                    width={2}
                    height={3}
                    depth={2}
                    type="office"
                />

                {/* Houses */}
                <Building
                    position={[-6, 1, 6]}
                    width={1.5}
                    height={2}
                    depth={1.5}
                    type="house"
                />
                <Building
                    position={[6, 1, 6]}
                    width={1.5}
                    height={2}
                    depth={1.5}
                    type="house"
                />

                {/* Shops */}
                <Building
                    position={[-3, 0.75, -8]}
                    width={2}
                    height={1.5}
                    depth={1.5}
                    type="shop"
                />
                <Building
                    position={[3, 0.75, -8]}
                    width={2}
                    height={1.5}
                    depth={1.5}
                    type="shop"
                />

                {/* Deployed Agents */}
                {deployedAgents.map((agent) => (
                    <Agent3D
                        key={agent.id}
                        position={agent.position}
                        agentType={agent.type}
                        isWalking={false}
                    />
                ))}

                {/* Deployment Effect */}
                {showDeployEffect && <DeploymentEffect position={showDeployEffect} />}
            </Scene3D>

            {/* UI Overlay - Agent Deployment Panel */}
            <div className="absolute top-24 right-4 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto cyber-panel clip-corner-all">
                <AgentPanel
                    agents={MOCK_AGENTS}
                    deployedCount={deployedAgents.length}
                    onDeploy={handleDeployAgent}
                    deployedIds={deployedAgents.map((a) => a.id)}
                />
            </div>

            {/* Bottom Bar - Tactical Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#050510]/90 border-t border-[#FCEE0A]/30 p-2 pointer-events-none">
                <div className="container mx-auto flex justify-between items-center font-mono text-xs">
                    <div className="flex gap-6 items-center">
                        <span className="text-[#FCEE0A] uppercase tracking-wider">
                            ACTIVE_AGENTS: <span className="text-white font-bold ml-1">{deployedAgents.length}/6</span>
                        </span>
                        <div className="h-4 w-[1px] bg-[#FCEE0A]/30"></div>
                        <span className="text-[#00F0FF] animate-pulse">
                            {'>'} AWAITING_ORDERS
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Agent Deployment Panel Component - CYBERPUNK THEME
function AgentPanel({
    agents,
    deployedCount,
    onDeploy,
    deployedIds,
}: {
    agents: typeof MOCK_AGENTS
    deployedCount: number
    onDeploy: (id: string) => void
    deployedIds: string[]
}) {
    return (
        <div className="bg-transparent overflow-hidden">
            {/* Header */}
            <div className="bg-[#FCEE0A]/10 border-b border-[#FCEE0A]/30 px-5 py-3 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-black text-[#FCEE0A] uppercase tracking-widest leading-none">
                        UNIT_DEPLOY
                    </h2>
                    <div className="flex gap-1 mt-1">
                        <span className="w-1 h-1 bg-[#FCEE0A]"></span>
                        <span className="w-1 h-1 bg-[#FCEE0A]"></span>
                        <span className="w-1 h-1 bg-[#FCEE0A]"></span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-[#00F0FF] uppercase font-mono">Capacity</div>
                    <div className="text-xl font-bold text-white leading-none font-mono">
                        {deployedCount}<span className="text-gray-500 text-sm">/6</span>
                    </div>
                </div>
            </div>

            {/* Agent List */}
            <div className="p-3 space-y-2">
                {agents.map((agent) => {
                    const isDeployed = deployedIds.includes(agent.id)

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
                            {/* Agent Info */}
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-white leading-none mb-1 text-sm uppercase font-mono tracking-wider">
                                        {agent.name}
                                    </h3>
                                    <p className="text-[10px] text-[#8a8a8a] uppercase tracking-wide font-mono">
                                        STRAT: <span className="text-[#00F0FF]">{agent.strategy}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-[#FCEE0A] font-mono">REP: {agent.reputation}</span>
                                </div>
                            </div>

                            {/* Deploy Button */}
                            <button
                                onClick={() => onDeploy(agent.id)}
                                disabled={isDeployed || deployedCount >= 6}
                                className={`
                                    w-full py-1.5 font-bold text-xs uppercase tracking-widest transition-all clip-corner-tr
                                    ${isDeployed
                                        ? 'bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 cursor-not-allowed'
                                        : deployedCount >= 6
                                            ? 'bg-gray-900 text-gray-500 border border-gray-800 cursor-not-allowed'
                                            : 'bg-[#FCEE0A] text-black hover:bg-[#FF00FF] hover:text-white'
                                    }
                                `}
                            >
                                {isDeployed ? '>> ACTIVE <<' : 'INITIALIZE'}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


