import { AGENT_TYPES, MOCK_AGENTS } from '../game-constants'

export interface DeployedAgent {
    id: string
    agentId: string
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
    votes: { support: number; oppose: number; abstain: number }
    consensus: 'unanimous' | 'majority' | 'contested' | 'vetoed'
    timestamp: number
    status: 'pending' | 'approved' | 'rejected' | 'executed'
}

export interface MockGameState {
    isGuest: boolean
    sessionId: string | null
    ytestBalance: number
    gold: number
    gems: number
    xpTotal: number
    level: number
    deployedAgents: DeployedAgent[]
    ownedAgents: string[]
    proposalHistory: Proposal[]
    trophies: number
    stats: {
        totalTrades: number
        successfulTrades: number
        totalVolumeUsd: number
        councilSessions: number
        agentsDeployed: number
        coinsCollected: number
    }
}

const DEFAULT_STATE: MockGameState = {
    isGuest: true,
    sessionId: null,
    ytestBalance: 100.00,
    gold: 1000,
    gems: 50,
    xpTotal: 0,
    level: 1,
    deployedAgents: [],
    ownedAgents: ['luna-dca', 'vortex-momentum', 'sentinel-yield'],
    proposalHistory: [],
    trophies: 0,
    stats: {
        totalTrades: 0,
        successfulTrades: 0,
        totalVolumeUsd: 0,
        councilSessions: 0,
        agentsDeployed: 0,
        coinsCollected: 0,
    },
}

const STORAGE_KEY = 'agentropolis_v3_gamestate'

class MockStore {
    private state: MockGameState
    private listeners: Set<() => void> = new Set()

    constructor() {
        this.state = { ...DEFAULT_STATE }
        if (typeof window !== 'undefined') {
            this.load()
        }
    }

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

    getState() { return this.state }

    reset() {
        this.state = { ...DEFAULT_STATE }
        this.save()
    }

    deployAgent(agentId: string) {
        const { deployedAgents, ytestBalance } = this.state
        const agentConfig = MOCK_AGENTS.find(a => a.id === agentId)

        if (deployedAgents.length >= 6) throw new Error('Max agents reached')
        if (ytestBalance < 0.01) throw new Error('Insufficient funds')

        const positions: [number, number, number][] = [
            [-4, 0, -4], [4, 0, -4], [-4, 0, 4], [4, 0, 4], [-6, 0, 0], [6, 0, 0]
        ]
        const position = positions[deployedAgents.length] || [0, 0, 0]

        const newAgent: DeployedAgent = {
            id: Math.random().toString(36).substr(2, 9),
            agentId: agentConfig?.id || agentId,
            type: (agentConfig?.type || 'alphaHunter') as keyof typeof AGENT_TYPES,
            deployedAt: Date.now(),
            position,
        }

        this.state = {
            ...this.state,
            ytestBalance: ytestBalance - 0.01,
            deployedAgents: [...deployedAgents, newAgent],
            stats: { ...this.state.stats, agentsDeployed: this.state.stats.agentsDeployed + 1 }
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
        const newLevel = 1 + Math.floor(Math.sqrt(newXp / 100))
        this.state = { ...this.state, xpTotal: newXp, level: newLevel }
        this.save()
        return newLevel > oldLevel
    }

    addGold(amount: number) {
        this.state = { ...this.state, gold: this.state.gold + amount }
        this.save()
    }

    addGems(amount: number) {
        this.state = { ...this.state, gems: this.state.gems + amount }
        this.save()
    }

    collectCoin(value: number) {
        this.state = {
            ...this.state,
            ytestBalance: this.state.ytestBalance + value,
            stats: { ...this.state.stats, coinsCollected: this.state.stats.coinsCollected + 1 }
        }
        this.save()
    }

    startDeliberation() {
        this.state = {
            ...this.state,
            stats: { ...this.state.stats, councilSessions: this.state.stats.councilSessions + 1 }
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

        const inputAmount = parseFloat(proposal.inputAmount)
        const outputAmount = parseFloat(proposal.expectedOutput.replace(/[^0-9.]/g, ''))

        this.state = {
            ...this.state,
            ytestBalance: this.state.ytestBalance - inputAmount + outputAmount,
            stats: {
                ...this.state.stats,
                successfulTrades: this.state.stats.successfulTrades + 1,
                totalTrades: this.state.stats.totalTrades + 1,
                totalVolumeUsd: this.state.stats.totalVolumeUsd + inputAmount
            },
            proposalHistory: this.state.proposalHistory.map(p =>
                p.id === proposalId ? { ...p, status: 'executed' as const } : p
            )
        }
        this.addXp(50)
        this.save()
    }

    getLeague() {
        const t = this.state.trophies
        if (t >= 2500) return { icon: '👑', name: 'Champion', color: '#FF00FF' }
        if (t >= 1800) return { icon: '💠', name: 'Diamond', color: '#00F5FF' }
        if (t >= 1200) return { icon: '💎', name: 'Platinum', color: '#E5E4E2' }
        if (t >= 800) return { icon: '🥇', name: 'Gold', color: '#FFD700' }
        if (t >= 400) return { icon: '🥈', name: 'Silver', color: '#C0C0C0' }
        return { icon: '🥉', name: 'Bronze', color: '#CD7F32' }
    }
}

export const gameStore = new MockStore()
