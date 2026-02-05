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
            <div className="absolute top-4 right-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto">
                <AgentPanel
                    agents={MOCK_AGENTS}
                    deployedCount={deployedAgents.length}
                    onDeploy={handleDeployAgent}
                    deployedIds={deployedAgents.map((a) => a.id)}
                />
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="container mx-auto flex justify-between items-center text-white">
                    <div className="flex gap-6">
                        <span className="text-sm">Agents: {deployedAgents.length}/6</span>
                        <span className="text-sm text-cyan-400">Click Council Hall to deliberate</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Agent Deployment Panel Component
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
        <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-4 shadow-2xl shadow-cyan-500/20">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                🤖 Deploy Agents
            </h2>

            <div className="space-y-3 mb-4">
                {agents.map((agent) => {
                    const isDeployed = deployedIds.includes(agent.id)

                    return (
                        <div
                            key={agent.id}
                            className={`
                bg-black/40 rounded-xl p-3 border transition-all duration-300
                ${isDeployed ? 'border-green-500/50' : 'border-gray-700/50 hover:border-cyan-500/50'}
              `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-white">{agent.name}</h3>
                                    <p className="text-xs text-gray-400">{agent.strategy}</p>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                    <span>★</span>
                                    <span>{agent.reputation}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => onDeploy(agent.id)}
                                disabled={isDeployed || deployedCount >= 6}
                                className={`
                  w-full py-2 rounded-lg font-semibold text-sm transition-all
                  ${isDeployed
                                        ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                                        : deployedCount >= 6
                                            ? 'bg-gray-700/20 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/50'
                                    }
                `}
                            >
                                {isDeployed ? '✓ Deployed' : 'Deploy'}
                            </button>
                        </div>
                    )
                })}
            </div>

            <div className="text-center text-sm text-gray-400 pt-3 border-t border-gray-700/50">
                {deployedCount}/6 agents deployed
            </div>
        </div>
    )
}
