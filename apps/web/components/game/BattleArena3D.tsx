'use client'

import { useState, useEffect, useCallback } from 'react'
import Scene3D from './Scene3D'
import { Agent3D, BattleAgent3D, AttackBurst } from './3d/Agents'
import { COLORS, AGENT_TYPES } from '@/lib/game-constants'
import { MOCK_OPPONENTS } from '@/lib/game-data'
import { useGame } from '@/contexts/GameContext'
import { BattleResult } from '@/lib/mock/store'

interface BattleArena3DProps {
    onBack: () => void
}

type BattlePhase = 'matchmaking' | 'battle' | 'result'

export default function BattleArena3D({ onBack }: BattleArena3DProps) {
    const { state, actions } = useGame()
    const [phase, setPhase] = useState<BattlePhase>('matchmaking')
    const [opponent, setOpponent] = useState<typeof MOCK_OPPONENTS[0] | null>(null)
    const [battleTimer, setBattleTimer] = useState(60)
    const [playerHp, setPlayerHp] = useState(100)
    const [enemyHp, setEnemyHp] = useState(100)
    const [battleResult, setBattleResult] = useState<BattleResult | null>(null)
    const [actionCooldown, setActionCooldown] = useState(false)
    const [battleLog, setBattleLog] = useState<string[]>([])
    const [isPlayerAttacking, setIsPlayerAttacking] = useState(false)
    const [isEnemyAttacking, setIsEnemyAttacking] = useState(false)
    const [attackBurstPos, setAttackBurstPos] = useState<[number, number, number] | null>(null)

    // Find a random opponent near player's trophy range
    const findOpponent = useCallback(() => {
        const playerTrophies = state.trophies
        const validOpponents = MOCK_OPPONENTS.filter(o =>
            Math.abs(o.trophies - playerTrophies) < 200
        )
        const selected = validOpponents.length > 0
            ? validOpponents[Math.floor(Math.random() * validOpponents.length)]
            : MOCK_OPPONENTS[0]
        return selected
    }, [state.trophies])

    // Start matchmaking
    const startMatchmaking = () => {
        setPhase('matchmaking')
        setTimeout(() => {
            const opp = findOpponent()
            setOpponent(opp)
            setPhase('battle')
            setBattleTimer(60)
            setPlayerHp(100)
            setEnemyHp(100)
            setBattleLog(['Battle started!'])
            actions.startBattle(opp)
        }, 2000)
    }

    // Battle timer
    useEffect(() => {
        if (phase !== 'battle') return

        const timer = setInterval(() => {
            setBattleTimer(prev => {
                if (prev <= 1) {
                    // Time's up - whoever has more HP wins
                    endBattle(playerHp > enemyHp)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [phase, playerHp, enemyHp])

    // AI auto-attack
    useEffect(() => {
        if (phase !== 'battle') return

        const aiAttack = setInterval(() => {
            // Trigger enemy attack animation
            setIsEnemyAttacking(true)
            setAttackBurstPos([-3, 1, 0])
            setTimeout(() => {
                setIsEnemyAttacking(false)
                setAttackBurstPos(null)
            }, 600)

            const damage = Math.floor(Math.random() * 15) + 5
            setPlayerHp(prev => {
                const newHp = Math.max(0, prev - damage)
                if (newHp === 0) {
                    endBattle(false)
                }
                return newHp
            })
            setBattleLog(prev => [...prev.slice(-4), `Enemy dealt ${damage} damage!`])
        }, 2500)

        return () => clearInterval(aiAttack)
    }, [phase])

    const attack = (abilityType: 'light' | 'heavy' | 'special') => {
        if (phase !== 'battle' || actionCooldown) return

        setActionCooldown(true)
        setTimeout(() => setActionCooldown(false), 1000)

        let damage = 0
        let message = ''

        switch (abilityType) {
            case 'light':
                damage = Math.floor(Math.random() * 10) + 8
                message = `You dealt ${damage} damage!`
                break
            case 'heavy':
                damage = Math.floor(Math.random() * 20) + 15
                message = `HEAVY ATTACK! ${damage} damage!`
                break
            case 'special':
                damage = Math.floor(Math.random() * 30) + 25
                message = `⚡ SPECIAL ATTACK! ${damage} damage!`
                break
        }

        // Trigger player attack animation
        setIsPlayerAttacking(true)
        setAttackBurstPos([3, 1, 0])
        setTimeout(() => {
            setIsPlayerAttacking(false)
            setAttackBurstPos(null)
        }, 600)

        setEnemyHp(prev => {
            const newHp = Math.max(0, prev - damage)
            if (newHp === 0) {
                setTimeout(() => endBattle(true), 500)
            }
            return newHp
        })
        setBattleLog(prev => [...prev.slice(-4), message])
    }

    const endBattle = (won: boolean) => {
        if (phase === 'result') return
        setPhase('result')
        const result = actions.endBattle(won)
        setBattleResult(result || null)
    }

    const getPlayerAgents = () => {
        return state.deployedAgents.slice(0, 3).map(a => a.type)
    }

    return (
        <div className="w-full h-full relative font-[Rajdhani]">
            {/* 3D Battle Scene */}
            <Scene3D cameraPosition={[0, 6, 12]} cameraMode="orbital" enablePostProcessing>
                {/* Arena Floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                    <planeGeometry args={[30, 20]} />
                    <meshStandardMaterial color="#0a0a1a" metalness={0.3} roughness={0.7} />
                </mesh>

                {/* Arena Boundary Glow */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                    <ringGeometry args={[12, 12.2, 64]} />
                    <meshBasicMaterial color={phase === 'battle' ? COLORS.neon.magenta : COLORS.neon.cyan} />
                </mesh>

                {/* Player Side - Main Battle Agent */}
                {phase === 'battle' && (
                    <BattleAgent3D
                        position={[-4, 0.5, 0]}
                        agentType={(getPlayerAgents()[0] || 'alphaHunter') as keyof typeof AGENT_TYPES}
                        isPlayer={true}
                        isAttacking={isPlayerAttacking}
                        hp={playerHp}
                        maxHp={100}
                    />
                )}

                {/* Enemy Side - Main Battle Agent */}
                {phase === 'battle' && opponent && (
                    <BattleAgent3D
                        position={[4, 0.5, 0]}
                        agentType={(opponent.agents[0] || 'alphaHunter') as keyof typeof AGENT_TYPES}
                        isPlayer={false}
                        isAttacking={isEnemyAttacking}
                        hp={enemyHp}
                        maxHp={100}
                    />
                )}

                {/* Player Side - Backup Agents (smaller, behind) */}
                <group position={[-6, 0, 3]}>
                    {getPlayerAgents().slice(1).map((agentType, i) => (
                        <Agent3D
                            key={i}
                            position={[i * 1.5, 0.3, 0]}
                            agentType={agentType as keyof typeof AGENT_TYPES}
                            rotation={-Math.PI / 6}
                            scale={0.6}
                            isHovered={false}
                        />
                    ))}
                    {getPlayerAgents().length === 0 && (
                        <mesh position={[0, 0.5, 0]}>
                            <boxGeometry args={[1, 1, 1]} />
                            <meshStandardMaterial color="#333" />
                        </mesh>
                    )}
                </group>

                {/* Enemy Side - Backup Agents (smaller, behind) */}
                <group position={[6, 0, -3]}>
                    {opponent?.agents.slice(1).map((agentType, i) => (
                        <Agent3D
                            key={i}
                            position={[-i * 1.5, 0.3, 0]}
                            agentType={agentType as keyof typeof AGENT_TYPES}
                            rotation={Math.PI + Math.PI / 6}
                            scale={0.6}
                            isHovered={false}
                        />
                    ))}
                </group>

                {/* Attack Burst Effect */}
                {attackBurstPos && (
                    <AttackBurst position={attackBurstPos} color={isPlayerAttacking ? '#00FF88' : '#FF3366'} />
                )}
            </Scene3D>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Back Button + Title (positioned below main header) */}
                <div className="absolute top-12 left-4 pointer-events-auto">
                    <button onClick={onBack} className="px-4 py-2 bg-black/90 border border-[#FF3366]/50 text-[#FF3366] text-xs font-bold uppercase tracking-wider hover:bg-[#FF3366] hover:text-white transition-all">
                        {'<'} RETREAT
                    </button>
                </div>

                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#FF3366] uppercase tracking-widest">Battle Arena</h1>
                        <p className="text-xs text-gray-500">🏆 {state.trophies} Trophies</p>
                    </div>
                    {phase === 'battle' && (
                        <div className="cyber-panel px-4 py-2 bg-black/90">
                            <span className={`text-2xl font-bold font-mono ${battleTimer <= 10 ? 'text-[#FF3366] animate-pulse' : 'text-[#FCEE0A]'}`}>
                                {battleTimer}s
                            </span>
                        </div>
                    )}
                </div>

                {/* Matchmaking Phase */}
                {phase === 'matchmaking' && !opponent && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                        <div className="cyber-panel p-12 bg-black/95 text-center">
                            <div className="text-6xl mb-6 animate-spin">⚔️</div>
                            <h2 className="text-3xl font-black text-[#FCEE0A] uppercase tracking-widest mb-2">
                                Finding Opponent
                            </h2>
                            <p className="text-gray-400">Searching for worthy challengers...</p>
                            <div className="mt-6 w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#FCEE0A] to-[#FF3366] animate-pulse w-3/4" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Pre-Battle Start Screen */}
                {phase !== 'matchmaking' && phase !== 'battle' && phase !== 'result' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                        <div className="cyber-panel p-12 bg-black/95 text-center">
                            <h2 className="text-3xl font-black text-white mb-4">Ready for Battle?</h2>
                            <p className="text-gray-400 mb-6">Deploy at least 1 agent before battling!</p>
                            <button onClick={startMatchmaking} className="btn-cyber px-12 py-4 text-xl">
                                ⚔️ FIND OPPONENT
                            </button>
                        </div>
                    </div>
                )}

                {/* Battle Phase */}
                {phase === 'battle' && opponent && (
                    <>
                        {/* HP Bars */}
                        <div className="absolute top-28 left-4 right-4 flex justify-between">
                            {/* Player HP */}
                            <div className="w-72">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-[#00FF88] font-bold">YOU</span>
                                    <span className="text-white font-mono">{playerHp}/100</span>
                                </div>
                                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#00FF88] to-[#00FFFF] transition-all duration-300"
                                        style={{ width: `${playerHp}%` }}
                                    />
                                </div>
                            </div>

                            {/* VS */}
                            <div className="text-3xl font-black text-[#FCEE0A]">VS</div>

                            {/* Enemy HP */}
                            <div className="w-72 text-right">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white font-mono">{enemyHp}/100</span>
                                    <span className="text-[#FF3366] font-bold">{opponent.name}</span>
                                </div>
                                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF3366] transition-all duration-300"
                                        style={{ width: `${enemyHp}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Battle Log */}
                        <div className="absolute top-44 left-1/2 -translate-x-1/2 w-96 cyber-panel bg-black/80 p-3">
                            <div className="text-xs text-gray-500 uppercase mb-1">Battle Log</div>
                            <div className="space-y-1 max-h-20 overflow-y-auto">
                                {battleLog.map((log, i) => (
                                    <div key={i} className="text-sm text-gray-300">{log}</div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
                            <button
                                onClick={() => attack('light')}
                                disabled={actionCooldown}
                                className="btn-cyber px-8 py-4 text-lg disabled:opacity-50"
                            >
                                ⚡ Quick Attack
                            </button>
                            <button
                                onClick={() => attack('heavy')}
                                disabled={actionCooldown}
                                className="btn-cyber px-8 py-4 text-lg bg-[#FF6B00] hover:bg-[#FF8800] disabled:opacity-50"
                            >
                                💥 Heavy Attack
                            </button>
                            <button
                                onClick={() => attack('special')}
                                disabled={actionCooldown}
                                className="btn-cyber px-8 py-4 text-lg bg-[#9D00FF] hover:bg-[#BB00FF] disabled:opacity-50"
                            >
                                🌟 Special Attack
                            </button>
                        </div>
                    </>
                )}

                {/* Result Phase */}
                {phase === 'result' && battleResult && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur pointer-events-auto">
                        <div className="cyber-panel p-12 bg-black/95 text-center max-w-lg animate-in zoom-in">
                            {battleResult.won ? (
                                <>
                                    <div className="text-8xl mb-4">🏆</div>
                                    <h2 className="text-4xl font-black text-[#00FF88] uppercase tracking-widest mb-2">
                                        VICTORY!
                                    </h2>
                                </>
                            ) : (
                                <>
                                    <div className="text-8xl mb-4">💀</div>
                                    <h2 className="text-4xl font-black text-[#FF3366] uppercase tracking-widest mb-2">
                                        DEFEAT
                                    </h2>
                                </>
                            )}

                            <div className="grid grid-cols-3 gap-4 my-8">
                                <div className="cyber-panel p-4 bg-black/60">
                                    <div className="text-3xl">🏆</div>
                                    <div className={`text-2xl font-bold font-mono ${battleResult.trophiesChange >= 0 ? 'text-[#00FF88]' : 'text-[#FF3366]'}`}>
                                        {battleResult.trophiesChange >= 0 ? '+' : ''}{battleResult.trophiesChange}
                                    </div>
                                    <div className="text-xs text-gray-400">Trophies</div>
                                </div>
                                <div className="cyber-panel p-4 bg-black/60">
                                    <div className="text-3xl">🪙</div>
                                    <div className="text-2xl font-bold font-mono text-[#FFD700]">
                                        +{battleResult.goldEarned}
                                    </div>
                                    <div className="text-xs text-gray-400">Gold</div>
                                </div>
                                <div className="cyber-panel p-4 bg-black/60">
                                    <div className="text-3xl">⭐</div>
                                    <div className="text-2xl font-bold font-mono text-[#FCEE0A]">
                                        +{battleResult.xpEarned}
                                    </div>
                                    <div className="text-xs text-gray-400">XP</div>
                                </div>
                            </div>

                            {battleResult.chestWon && (
                                <div className="mb-6 cyber-panel p-4 bg-[#FFD700]/20 border-[#FFD700]">
                                    <span className="text-2xl mr-2">📦</span>
                                    <span className="text-[#FFD700] font-bold">You won a {battleResult.chestWon} chest!</span>
                                </div>
                            )}

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => {
                                        setPhase('matchmaking')
                                        setOpponent(null)
                                        setBattleResult(null)
                                        setBattleLog([])
                                        startMatchmaking()
                                    }}
                                    className="btn-cyber px-8 py-3"
                                >
                                    ⚔️ BATTLE AGAIN
                                </button>
                                <button
                                    onClick={onBack}
                                    className="btn-cyber-outline px-8 py-3"
                                >
                                    EXIT ARENA
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Initial Start Button */}
                {phase !== 'matchmaking' && phase !== 'battle' && phase !== 'result' && state.deployedAgents.length > 0 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
                        <button onClick={startMatchmaking} className="btn-cyber px-12 py-4 text-xl animate-pulse">
                            ⚔️ START BATTLE
                        </button>
                    </div>
                )}
            </div>

            {/* Auto-start matchmaking on mount if we have agents */}
            {phase === 'matchmaking' && !opponent && (
                <AutoStart onStart={startMatchmaking} hasAgents={state.deployedAgents.length > 0} />
            )}
        </div>
    )
}

function AutoStart({ onStart, hasAgents }: { onStart: () => void, hasAgents: boolean }) {
    useEffect(() => {
        if (hasAgents) {
            onStart()
        }
    }, [])
    return null
}
