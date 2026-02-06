'use client'

import { useState } from 'react'
import Scene3D from './Scene3D'
import { LEAGUES, getLeagueForTrophies, LeagueTier } from '@/lib/game-data'
import { useGame } from '@/contexts/GameContext'

interface Leaderboard3DProps {
    onBack: () => void
}

// Mock leaderboard data
const MOCK_LEADERBOARD = [
    { rank: 1, name: 'CryptoKing', trophies: 3250, level: 15 },
    { rank: 2, name: 'DeFiQueen', trophies: 2890, level: 14 },
    { rank: 3, name: 'BlockchainMaster', trophies: 2750, level: 13 },
    { rank: 4, name: 'YieldHunter', trophies: 2600, level: 12 },
    { rank: 5, name: 'TokenWizard', trophies: 2450, level: 12 },
    { rank: 6, name: 'SwapLord', trophies: 2300, level: 11 },
    { rank: 7, name: 'NFT_Trader', trophies: 2150, level: 11 },
    { rank: 8, name: 'GasOptimizer', trophies: 2000, level: 10 },
    { rank: 9, name: 'LiquidityPro', trophies: 1850, level: 10 },
    { rank: 10, name: 'ArbitrageBot', trophies: 1700, level: 9 },
]

export default function Leaderboard3D({ onBack }: Leaderboard3DProps) {
    const { state, actions } = useGame()
    const [selectedTab, setSelectedTab] = useState<'global' | 'league'>('global')
    const playerLeague = actions.getLeague()

    // Calculate player's rank (mock)
    const playerRank = MOCK_LEADERBOARD.findIndex(p => state.trophies >= p.trophies) + 1 || MOCK_LEADERBOARD.length + 1

    return (
        <div className="w-full h-full relative font-[Rajdhani]">
            {/* 3D Background */}
            <Scene3D cameraPosition={[0, 5, 10]} cameraMode="orbital" enablePostProcessing>
                {/* Floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                    <planeGeometry args={[30, 20]} />
                    <meshStandardMaterial color="#0a0a1a" metalness={0.3} roughness={0.7} />
                </mesh>

                {/* Trophy Podium */}
                <group position={[0, 0, -3]}>
                    {/* First Place */}
                    <mesh position={[0, 1.5, 0]}>
                        <boxGeometry args={[2, 3, 2]} />
                        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
                    </mesh>
                    <pointLight position={[0, 3.5, 0]} intensity={3} color="#FFD700" />

                    {/* Second Place */}
                    <mesh position={[-3, 1, 0]}>
                        <boxGeometry args={[2, 2, 2]} />
                        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
                    </mesh>

                    {/* Third Place */}
                    <mesh position={[3, 0.5, 0]}>
                        <boxGeometry args={[2, 1, 2]} />
                        <meshStandardMaterial color="#CD7F32" metalness={0.8} roughness={0.2} />
                    </mesh>
                </group>

                {/* Floating Trophy */}
                <mesh position={[0, 4, -3]} rotation={[0, Date.now() * 0.001, 0]}>
                    <octahedronGeometry args={[1]} />
                    <meshBasicMaterial color="#FFD700" wireframe />
                </mesh>
            </Scene3D>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Back Button + Title (positioned below main header) */}
                <div className="absolute top-12 left-4 pointer-events-auto">
                    <button onClick={onBack} className="px-4 py-2 bg-black/90 border border-[#FFD700]/50 text-[#FFD700] text-xs font-bold uppercase tracking-wider hover:bg-[#FFD700] hover:text-black transition-all">
                        {'<'} EXIT
                    </button>
                </div>

                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center">
                    <h1 className="text-2xl font-black text-[#FFD700] uppercase tracking-widest">Leaderboard</h1>
                    <p className="text-xs text-gray-500">Global Rankings & League Standings</p>
                </div>

                {/* Tab Navigation */}
                <div className="absolute top-24 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
                    <button
                        onClick={() => setSelectedTab('global')}
                        className={`px-8 py-2 font-bold uppercase tracking-wider transition-all ${selectedTab === 'global'
                            ? 'bg-[#FFD700] text-black'
                            : 'bg-black/80 text-gray-400 hover:text-[#FFD700]'
                            }`}
                    >
                        🌍 Global
                    </button>
                    <button
                        onClick={() => setSelectedTab('league')}
                        className={`px-8 py-2 font-bold uppercase tracking-wider transition-all ${selectedTab === 'league'
                            ? 'bg-[#FFD700] text-black'
                            : 'bg-black/80 text-gray-400 hover:text-[#FFD700]'
                            }`}
                    >
                        {playerLeague.icon} My League
                    </button>
                </div>

                {/* League Progress */}
                <div className="absolute top-36 left-1/2 -translate-x-1/2 w-full max-w-2xl pointer-events-auto">
                    <div className="cyber-panel bg-black/90 p-4 mb-4">
                        <div className="flex justify-between items-center mb-3">
                            {Object.values(LEAGUES).map((league) => (
                                <div
                                    key={league.id}
                                    className={`text-center transition-all ${playerLeague.id === league.id
                                        ? 'scale-125'
                                        : state.trophies >= league.minTrophies
                                            ? 'opacity-100'
                                            : 'opacity-40'
                                        }`}
                                >
                                    <div className="text-2xl">{league.icon}</div>
                                    <div className="text-[10px] text-gray-500">{league.minTrophies}</div>
                                </div>
                            ))}
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#CD7F32] via-[#FFD700] to-[#FF00FF] transition-all"
                                style={{ width: `${Math.min(100, (state.trophies / 2500) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Leaderboard List */}
                <div className="absolute top-56 left-1/2 -translate-x-1/2 w-full max-w-2xl max-h-[400px] overflow-y-auto pointer-events-auto">
                    <div className="cyber-panel bg-black/90 p-4">
                        {selectedTab === 'global' ? (
                            <GlobalLeaderboard players={MOCK_LEADERBOARD} />
                        ) : (
                            <LeagueLeaderboard
                                league={playerLeague}
                            />
                        )}

                        {/* Player's Position */}
                        <div className="mt-4 pt-4 border-t border-[#FFD700]/30">
                            <div className="flex items-center gap-4 p-3 bg-[#FFD700]/10 border border-[#FFD700]/50 rounded">
                                <div className="text-2xl font-bold text-[#FFD700]">#{playerRank}</div>
                                <div className="text-2xl">{playerLeague.icon}</div>
                                <div className="flex-1">
                                    <div className="font-bold text-white">You</div>
                                    <div className="text-xs text-gray-400">Level {state.level}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-[#FFD700] font-mono">🏆 {state.trophies}</div>
                                    <div className="text-xs text-gray-400">{playerLeague.name}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Season Rewards Preview */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
                    <div className="cyber-panel bg-black/90 p-4">
                        <div className="text-center text-sm text-gray-400 mb-2">Season Rewards for {playerLeague.name}</div>
                        <div className="flex gap-4">
                            <div className="text-center">
                                <div className="text-xl">🪙</div>
                                <div className="text-[#FFD700] font-bold">{playerLeague.seasonReward.gold}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl">💎</div>
                                <div className="text-[#00F5FF] font-bold">{playerLeague.seasonReward.gems}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl">📦</div>
                                <div className="text-gray-300 font-bold capitalize">{playerLeague.seasonReward.chest}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function GlobalLeaderboard({ players }: { players: typeof MOCK_LEADERBOARD }) {
    return (
        <div className="space-y-2">
            {players.map((player) => {
                const league = getLeagueForTrophies(player.trophies)
                const isTop3 = player.rank <= 3

                return (
                    <div
                        key={player.rank}
                        className={`flex items-center gap-4 p-3 transition-all ${isTop3
                            ? 'bg-gradient-to-r from-[#FFD700]/20 to-transparent border-l-4 border-[#FFD700]'
                            : 'bg-black/40 border-l-4 border-gray-700'
                            }`}
                    >
                        <div className={`text-2xl font-bold ${player.rank === 1 ? 'text-[#FFD700]' :
                            player.rank === 2 ? 'text-[#C0C0C0]' :
                                player.rank === 3 ? 'text-[#CD7F32]' :
                                    'text-gray-500'
                            }`}>
                            #{player.rank}
                        </div>
                        <div className="text-xl">{league.icon}</div>
                        <div className="flex-1">
                            <div className="font-bold text-white">{player.name}</div>
                            <div className="text-xs text-gray-400">Level {player.level}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-[#FFD700] font-mono">🏆 {player.trophies}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function LeagueLeaderboard({ league }: { league: typeof LEAGUES[LeagueTier] }) {
    // Generate mock players for the league
    const leaguePlayers = Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        name: `${league.name.split(' ')[0]}Player${i + 1}`,
        trophies: league.maxTrophies - Math.floor(Math.random() * (league.maxTrophies - league.minTrophies)),
        level: Math.floor(Math.random() * 5) + 5
    })).sort((a, b) => b.trophies - a.trophies)

    return (
        <div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
                <div className="text-4xl">{league.icon}</div>
                <div>
                    <h3 className="text-xl font-bold" style={{ color: league.color }}>{league.name}</h3>
                    <p className="text-xs text-gray-400">{league.minTrophies} - {league.maxTrophies} Trophies</p>
                </div>
            </div>
            <div className="space-y-2">
                {leaguePlayers.map((player) => (
                    <div
                        key={player.rank}
                        className="flex items-center gap-4 p-3 bg-black/40 border-l-4"
                        style={{ borderColor: league.color }}
                    >
                        <div className="text-xl font-bold text-gray-500">#{player.rank}</div>
                        <div className="flex-1">
                            <div className="font-bold text-white">{player.name}</div>
                            <div className="text-xs text-gray-400">Level {player.level}</div>
                        </div>
                        <div className="font-bold font-mono" style={{ color: league.color }}>
                            🏆 {player.trophies}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
