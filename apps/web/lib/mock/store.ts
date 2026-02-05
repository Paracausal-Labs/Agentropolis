import { AGENT_TYPES, MOCK_AGENTS } from '../game-constants'

// Types
export interface DeployedAgent {
    id: string
    agentId: string // Reference to MOCK_AGENTS id
    type: keyof typeof AGENT_TYPES
    deployedAt: number
    position: [number, number, number]
    currentPath?: string[]
    currentPathIndex?: number
    isWalking?: boolean
    targetPosition?: [number, number, number]
}

export interface Proposal {
    id: string
    action: string
    inputToken: string
    outputToken: string
    inputAmount: string
    expectedOutput: string
    slippage: number
    risk: 'low' | 'medium' | 'high'
    reasoning: string
    votes: {
        support: number
        oppose: number
        abstain: number
    }
    consensus: 'unanimous' | 'majority' | 'contested' | 'vetoed'
    timestamp: number
    status: 'pending' | 'approved' | 'rejected' | 'executed'
}

export interface Achievement {
    id: string
    unlockedAt: number
}

export interface MockGameState {
    // Session
    isGuest: boolean
    sessionId: string | null

    // Currency
    ytestBalance: number
    xpTotal: number
    level: number

    // Agents
    deployedAgents: DeployedAgent[]
    ownedAgents: string[]

    // Skins
    unlockedSkins: string[]
    equippedSkins: Record<string, string>

    // Progress
    achievements: Achievement[]
    proposalHistory: Proposal[]

    // Stats
    stats: {
        totalTrades: number
        successfulTrades: number
        totalVolumeUsd: number
        councilSessions: number
        agentsDeployed: number
        loginStreak: number
        lastLoginDate: string
    }
}

// Initial State
const DEFAULT_STATE: MockGameState = {
    isGuest: true,
    sessionId: null,
    ytestBalance: 100.00,
    xpTotal: 0,
    level: 1,
    deployedAgents: [],
    ownedAgents: ['luna-dca', 'vortex-momentum', 'sentinel-yield'],
    unlockedSkins: ['default'],
    equippedSkins: {},
    achievements: [],
    proposalHistory: [],
    stats: {
        totalTrades: 0,
        successfulTrades: 0,
        totalVolumeUsd: 0,
        councilSessions: 0,
        agentsDeployed: 0,
        loginStreak: 0,
        lastLoginDate: new Date().toISOString(),
    },
}

const STORAGE_KEY = 'agentropolis_v2_gamestate'

// Store Implementation
class MockStore {
    private state: MockGameState
    private listeners: Set<() => void> = new Set()

    constructor() {
        this.state = DEFAULT_STATE
        if (typeof window !== 'undefined') {
            this.load()
        }
    }

    // --- Core ---

    private load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                this.state = { ...DEFAULT_STATE, ...JSON.parse(stored) }
            }
        } catch (e) {
            console.error('Failed to load game state', e)
        }
    }

    private save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
            this.notify()
        } catch (e) {
            console.error('Failed to save game state', e)
        }
    }

    subscribe(listener: () => void) {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    private notify() {
        this.listeners.forEach(l => l())
    }

    getState() {
        return this.state
    }

    reset() {
        this.state = DEFAULT_STATE
        this.save()
    }

    // --- Actions ---

    deployAgent(agentId: string) {
        const { deployedAgents, ytestBalance } = this.state
        const agentConfig = MOCK_AGENTS.find(a => a.id === agentId)

        if (!agentConfig) throw new Error('Agent not found')
        if (deployedAgents.length >= 6) throw new Error('Max agents reached')
        if (ytestBalance < 0.01) throw new Error('Insufficient funds')

        // Find predefined spawn position (simplified)
        const positions: [number, number, number][] = [
            [-4, 0, -4], [4, 0, -4], [-4, 0, 4], [4, 0, 4], [-6, 0, 0], [6, 0, 0]
        ]
        const position = positions[deployedAgents.length] || [0, 0, 0]

        const newAgent: DeployedAgent = {
            id: Math.random().toString(36).substr(2, 9),
            agentId: agentConfig.id,
            type: agentConfig.type as keyof typeof AGENT_TYPES,
            deployedAt: Date.now(),
            position,
        }

        this.state = {
            ...this.state,
            ytestBalance: ytestBalance - 0.01,
            deployedAgents: [...deployedAgents, newAgent],
            stats: {
                ...this.state.stats,
                agentsDeployed: this.state.stats.agentsDeployed + 1
            }
        }
        this.addXp(10)
        this.save()
        return newAgent
    }

    removeAgent(instanceId: string) {
        this.state = {
            ...this.state,
            deployedAgents: this.state.deployedAgents.filter(a => a.id !== instanceId)
        }
        this.save()
    }

    addXp(amount: number) {
        const oldLevel = this.state.level
        const newXp = this.state.xpTotal + amount

        // Simple level formula: Level = 1 + floor(sqrt(XP / 100))
        // Level 2 at 100 XP, Level 3 at 400 XP, etc.
        const newLevel = 1 + Math.floor(Math.sqrt(newXp / 100))

        this.state = {
            ...this.state,
            xpTotal: newXp,
            level: newLevel
        }

        if (newLevel > oldLevel) {
            // Level up event could be triggered here
        }
        this.save()
    }

    collectCoin(value: number) {
        this.state = {
            ...this.state,
            ytestBalance: this.state.ytestBalance + value
        }
        this.save()
    }

    // --- Council Actions ---

    startDeliberation() {
        this.state = {
            ...this.state,
            stats: {
                ...this.state.stats,
                councilSessions: this.state.stats.councilSessions + 1
            }
        }
        this.addXp(5)
        this.save()
    }

    addProposal(proposal: Proposal) {
        this.state = {
            ...this.state,
            proposalHistory: [proposal, ...this.state.proposalHistory]
        }
        this.save()
    }

    executeProposal(proposalId: string) {
        const proposal = this.state.proposalHistory.find(p => p.id === proposalId)
        if (!proposal) return

        // Mock trade execution
        const inputAmount = parseFloat(proposal.inputAmount)
        const outputAmount = parseFloat(proposal.expectedOutput.replace(/[^0-9.]/g, ''))

        // Simple mock logic: deduct input, add output (simulating swap)
        // In a real mock, we might want to just track PnL, but here let's just assume valid swap

        this.state = {
            ...this.state,
            ytestBalance: this.state.ytestBalance - inputAmount + outputAmount, // Naive mock swap
            stats: {
                ...this.state.stats,
                successfulTrades: this.state.stats.successfulTrades + 1,
                totalTrades: this.state.stats.totalTrades + 1,
                totalVolumeUsd: this.state.stats.totalVolumeUsd + inputAmount
            },
            proposalHistory: this.state.proposalHistory.map(p =>
                p.id === proposalId ? { ...p, status: 'executed' } : p
            )
        }
        this.addXp(50)
        this.save()
    }
}

export const gameStore = new MockStore()
