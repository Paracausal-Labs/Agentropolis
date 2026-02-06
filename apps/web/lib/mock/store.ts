import { AGENT_TYPES, MOCK_AGENTS } from '../game-constants'
import {
    ChestType, LeagueTier, Mission,
    generateDailyMissions, generateWeeklyMissions, getLeagueForTrophies, rollChestRewards,
    BATTLE_REWARDS, CHEST_TYPES
} from '../game-data'

// =============================================================================
// TYPES
// =============================================================================

export interface DeployedAgent {
    id: string
    agentId: string
    type: keyof typeof AGENT_TYPES
    deployedAt: number
    position: [number, number, number]
    skinId?: string
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

export interface Achievement {
    id: string
    unlockedAt: number
}

export interface Chest {
    id: string
    type: ChestType
    unlockStartedAt?: number
    isReady?: boolean
}

export interface BattleAgent {
    agentType: string
    currentHp: number
    maxHp: number
    position: number
}

export interface BattleState {
    id: string
    playerAgents: BattleAgent[]
    enemyAgents: BattleAgent[]
    playerMana: number
    enemyMana: number
    turn: number
    phase: 'deploying' | 'battling' | 'finished'
    winner?: 'player' | 'enemy'
    opponent: { name: string; trophies: number; level: number }
}

export interface BattleResult {
    id: string
    won: boolean
    trophiesChange: number
    goldEarned: number
    xpEarned: number
    chestWon?: ChestType
    timestamp: number
}

// =============================================================================
// MAIN GAME STATE
// =============================================================================

export interface MockGameState {
    // Session
    isGuest: boolean
    sessionId: string | null

    // Currencies
    ytestBalance: number
    gold: number
    gems: number
    xpTotal: number
    level: number

    // Agents
    deployedAgents: DeployedAgent[]
    ownedAgents: string[]

    // Skins
    unlockedSkins: string[]
    equippedSkins: Record<string, string> // agentType -> skinId

    // Progress
    achievements: Achievement[]
    proposalHistory: Proposal[]

    // Battle System
    trophies: number
    currentBattle: BattleState | null
    battleHistory: BattleResult[]
    winStreak: number

    // Chests
    chestInventory: Chest[]
    chestSlots: (Chest | null)[] // 4 slots for unlocking

    // Missions
    dailyMissions: Mission[]
    weeklyMissions: Mission[]
    lastDailyReset: number
    lastWeeklyReset: number

    // Stats
    stats: {
        totalTrades: number
        successfulTrades: number
        totalVolumeUsd: number
        councilSessions: number
        agentsDeployed: number
        battlesWon: number
        battlesLost: number
        coinsCollected: number
        loginStreak: number
        lastLoginDate: string
    }
}

// =============================================================================
// DEFAULT STATE
// =============================================================================

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
    unlockedSkins: ['default'],
    equippedSkins: {},
    achievements: [],
    proposalHistory: [],
    trophies: 0,
    currentBattle: null,
    battleHistory: [],
    winStreak: 0,
    chestInventory: [
        { id: 'starter-chest-1', type: 'wooden' },
        { id: 'starter-chest-2', type: 'silver' },
    ],
    chestSlots: [null, null, null, null],
    dailyMissions: [],
    weeklyMissions: [],
    lastDailyReset: 0,
    lastWeeklyReset: 0,
    stats: {
        totalTrades: 0,
        successfulTrades: 0,
        totalVolumeUsd: 0,
        councilSessions: 0,
        agentsDeployed: 0,
        battlesWon: 0,
        battlesLost: 0,
        coinsCollected: 0,
        loginStreak: 0,
        lastLoginDate: new Date().toISOString(),
    },
}

const STORAGE_KEY = 'agentropolis_v3_gamestate'

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

class MockStore {
    private state: MockGameState
    private listeners: Set<() => void> = new Set()

    constructor() {
        this.state = { ...DEFAULT_STATE }
        if (typeof window !== 'undefined') {
            this.load()
            this.checkDailyReset()
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
        this.state = { ...DEFAULT_STATE }
        this.save()
    }

    // --- Daily Reset Check ---

    private checkDailyReset() {
        const now = Date.now()
        const oneDayMs = 24 * 60 * 60 * 1000
        const oneWeekMs = 7 * oneDayMs

        // Check daily reset
        if (now - this.state.lastDailyReset > oneDayMs) {
            this.state.dailyMissions = generateDailyMissions()
            this.state.lastDailyReset = now
        }

        // Check weekly reset
        if (now - this.state.lastWeeklyReset > oneWeekMs) {
            this.state.weeklyMissions = generateWeeklyMissions()
            this.state.lastWeeklyReset = now
        }

        // Initialize if empty
        if (this.state.dailyMissions.length === 0) {
            this.state.dailyMissions = generateDailyMissions()
            this.state.lastDailyReset = now
        }
        if (this.state.weeklyMissions.length === 0) {
            this.state.weeklyMissions = generateWeeklyMissions()
            this.state.lastWeeklyReset = now
        }

        this.save()
    }

    // --- Agent Actions ---

    deployAgent(agentId: string) {
        const { deployedAgents, ytestBalance } = this.state
        const agentConfig = MOCK_AGENTS.find(a => a.id === agentId)

        if (!agentConfig) throw new Error('Agent not found')
        if (deployedAgents.length >= 6) throw new Error('Max agents reached')
        if (ytestBalance < 0.01) throw new Error('Insufficient funds')

        const positions: [number, number, number][] = [
            [-4, 0, -4], [4, 0, -4], [-4, 0, 4], [4, 0, 4], [-6, 0, 0], [6, 0, 0]
        ]
        const position = positions[deployedAgents.length] || [0, 0, 0]
        const equippedSkin = this.state.equippedSkins[agentConfig.type] || 'default'

        const newAgent: DeployedAgent = {
            id: Math.random().toString(36).substr(2, 9),
            agentId: agentConfig.id,
            type: agentConfig.type as keyof typeof AGENT_TYPES,
            deployedAt: Date.now(),
            position,
            skinId: equippedSkin,
        }

        this.state = {
            ...this.state,
            ytestBalance: ytestBalance - 0.01,
            deployedAgents: [...deployedAgents, newAgent],
            stats: { ...this.state.stats, agentsDeployed: this.state.stats.agentsDeployed + 1 }
        }
        this.addXp(10)
        this.updateMissionProgress('deploy', 1)
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

    // --- Currency Actions ---

    addXp(amount: number) {
        const oldLevel = this.state.level
        const newXp = this.state.xpTotal + amount
        const newLevel = 1 + Math.floor(Math.sqrt(newXp / 100))

        this.state = { ...this.state, xpTotal: newXp, level: newLevel }
        this.updateMissionProgress('xp', amount)
        this.save()
        return newLevel > oldLevel
    }

    addGold(amount: number) {
        this.state = { ...this.state, gold: this.state.gold + amount }
        this.updateMissionProgress('gold', amount)
        this.save()
    }

    addGems(amount: number) {
        this.state = { ...this.state, gems: this.state.gems + amount }
        this.save()
    }

    spendGold(amount: number): boolean {
        if (this.state.gold < amount) return false
        this.state = { ...this.state, gold: this.state.gold - amount }
        this.save()
        return true
    }

    spendGems(amount: number): boolean {
        if (this.state.gems < amount) return false
        this.state = { ...this.state, gems: this.state.gems - amount }
        this.save()
        return true
    }

    collectCoin(value: number) {
        this.state = {
            ...this.state,
            ytestBalance: this.state.ytestBalance + value,
            stats: { ...this.state.stats, coinsCollected: this.state.stats.coinsCollected + 1 }
        }
        this.updateMissionProgress('coin', 1)
        this.save()
    }

    // --- Skin Actions ---

    unlockSkin(skinId: string) {
        if (!this.state.unlockedSkins.includes(skinId)) {
            this.state = {
                ...this.state,
                unlockedSkins: [...this.state.unlockedSkins, skinId]
            }
            this.save()
        }
    }

    equipSkin(agentType: string, skinId: string) {
        this.state = {
            ...this.state,
            equippedSkins: { ...this.state.equippedSkins, [agentType]: skinId }
        }
        // Update deployed agents of this type
        this.state.deployedAgents = this.state.deployedAgents.map(a =>
            a.type === agentType ? { ...a, skinId } : a
        )
        this.save()
    }

    // --- Shop Actions ---

    purchaseAgent(agentId: string, price: { currency: 'gold' | 'gems', amount: number }): boolean {
        const success = price.currency === 'gold'
            ? this.spendGold(price.amount)
            : this.spendGems(price.amount)

        if (success && !this.state.ownedAgents.includes(agentId)) {
            this.state = {
                ...this.state,
                ownedAgents: [...this.state.ownedAgents, agentId]
            }
            this.save()
        }
        return success
    }

    purchaseSkin(skinId: string, price: { currency: 'gold' | 'gems', amount: number }): boolean {
        const success = price.currency === 'gold'
            ? this.spendGold(price.amount)
            : this.spendGems(price.amount)

        if (success) {
            this.unlockSkin(skinId)
        }
        return success
    }

    purchaseChest(chestType: ChestType, price: { currency: 'gold' | 'gems', amount: number }): boolean {
        const success = price.currency === 'gold'
            ? this.spendGold(price.amount)
            : this.spendGems(price.amount)

        if (success) {
            const newChest: Chest = {
                id: `chest-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                type: chestType
            }
            this.state = {
                ...this.state,
                chestInventory: [...this.state.chestInventory, newChest]
            }
            this.save()
        }
        return success
    }

    // --- Chest Actions ---

    startChestUnlock(chestId: string, slotIndex: number) {
        const chest = this.state.chestInventory.find(c => c.id === chestId)
        if (!chest || slotIndex < 0 || slotIndex >= 4) return
        if (this.state.chestSlots[slotIndex]) return // Slot occupied

        // Remove from inventory, add to slot
        this.state = {
            ...this.state,
            chestInventory: this.state.chestInventory.filter(c => c.id !== chestId),
            chestSlots: this.state.chestSlots.map((slot, i) =>
                i === slotIndex ? { ...chest, unlockStartedAt: Date.now() } : slot
            )
        }
        this.save()
    }

    checkChestReady(slotIndex: number): boolean {
        const chest = this.state.chestSlots[slotIndex]
        if (!chest || !chest.unlockStartedAt) return false

        const unlockTime = CHEST_TYPES[chest.type].unlockTimeHours * 60 * 60 * 1000
        return Date.now() - chest.unlockStartedAt >= unlockTime
    }

    openChest(slotIndex: number): { gold: number, gems: number, skinId?: string } | null {
        if (!this.checkChestReady(slotIndex)) return null

        const chest = this.state.chestSlots[slotIndex]
        if (!chest) return null

        const rewards = rollChestRewards(chest.type)

        this.state = {
            ...this.state,
            gold: this.state.gold + rewards.gold,
            gems: this.state.gems + rewards.gems,
            chestSlots: this.state.chestSlots.map((slot, i) => i === slotIndex ? null : slot)
        }

        if (rewards.skinId) {
            this.unlockSkin(rewards.skinId)
        }

        this.save()
        return rewards
    }

    // --- Battle Actions ---

    startBattle(opponent: { name: string; trophies: number; level: number; agents: string[] }) {
        const playerAgents: BattleAgent[] = this.state.deployedAgents.slice(0, 3).map((a, i) => ({
            agentType: a.type,
            currentHp: 100,
            maxHp: 100,
            position: i
        }))

        const enemyAgents: BattleAgent[] = opponent.agents.map((type, i) => ({
            agentType: type,
            currentHp: 100,
            maxHp: 100,
            position: i
        }))

        const battle: BattleState = {
            id: `battle-${Date.now()}`,
            playerAgents,
            enemyAgents,
            playerMana: 5,
            enemyMana: 5,
            turn: 1,
            phase: 'battling',
            opponent
        }

        this.state = { ...this.state, currentBattle: battle }
        this.save()
    }

    updateBattle(update: Partial<BattleState>) {
        if (!this.state.currentBattle) return
        this.state = {
            ...this.state,
            currentBattle: { ...this.state.currentBattle, ...update }
        }
        this.save()
    }

    endBattle(won: boolean) {
        if (!this.state.currentBattle) return

        const trophyChange = won
            ? Math.floor(Math.random() * (BATTLE_REWARDS.win.trophiesMax - BATTLE_REWARDS.win.trophiesMin + 1)) + BATTLE_REWARDS.win.trophiesMin
            : Math.floor(Math.random() * (BATTLE_REWARDS.loss.trophiesMax - BATTLE_REWARDS.loss.trophiesMin + 1)) + BATTLE_REWARDS.loss.trophiesMin

        const goldEarned = won
            ? Math.floor(Math.random() * (BATTLE_REWARDS.win.goldMax - BATTLE_REWARDS.win.goldMin + 1)) + BATTLE_REWARDS.win.goldMin
            : Math.floor(Math.random() * (BATTLE_REWARDS.loss.goldMax - BATTLE_REWARDS.loss.goldMin + 1)) + BATTLE_REWARDS.loss.goldMin

        const xpEarned = won ? BATTLE_REWARDS.win.xp : BATTLE_REWARDS.loss.xp

        let chestWon: ChestType | undefined
        if (won && Math.random() < BATTLE_REWARDS.win.chestChance) {
            chestWon = 'wooden'
            this.state.chestInventory.push({
                id: `chest-battle-${Date.now()}`,
                type: chestWon
            })
        }

        const result: BattleResult = {
            id: this.state.currentBattle.id,
            won,
            trophiesChange: trophyChange,
            goldEarned,
            xpEarned,
            chestWon,
            timestamp: Date.now()
        }

        this.state = {
            ...this.state,
            trophies: Math.max(0, this.state.trophies + trophyChange),
            gold: this.state.gold + goldEarned,
            currentBattle: null,
            battleHistory: [result, ...this.state.battleHistory.slice(0, 49)],
            winStreak: won ? this.state.winStreak + 1 : 0,
            stats: {
                ...this.state.stats,
                battlesWon: this.state.stats.battlesWon + (won ? 1 : 0),
                battlesLost: this.state.stats.battlesLost + (won ? 0 : 1)
            }
        }

        this.addXp(xpEarned)
        this.updateMissionProgress('battle', won ? 1 : 0)
        this.save()

        return result
    }

    // --- Mission Actions ---

    private updateMissionProgress(type: string, amount: number) {
        const updateMissions = (missions: Mission[]): Mission[] => {
            return missions.map(m => {
                if (m.completed || m.claimed) return m

                let shouldUpdate = false
                if (type === 'deploy' && m.title.includes('Deploy')) shouldUpdate = true
                if (type === 'coin' && m.title.includes('Coin')) shouldUpdate = true
                if (type === 'battle' && m.title.includes('Battle') && amount > 0) shouldUpdate = true
                if (type === 'xp' && m.title.includes('XP')) shouldUpdate = true
                if (type === 'gold' && m.title.includes('Wealth')) shouldUpdate = true
                if (type === 'council' && m.title.includes('Council')) shouldUpdate = true

                if (shouldUpdate) {
                    const newProgress = m.progress + amount
                    return {
                        ...m,
                        progress: newProgress,
                        completed: newProgress >= m.target
                    }
                }
                return m
            })
        }

        this.state = {
            ...this.state,
            dailyMissions: updateMissions(this.state.dailyMissions),
            weeklyMissions: updateMissions(this.state.weeklyMissions)
        }
    }

    claimMissionReward(missionId: string) {
        const findAndClaim = (missions: Mission[]): { missions: Mission[], reward?: Mission['reward'] } => {
            let reward: Mission['reward'] | undefined
            const updated = missions.map(m => {
                if (m.id === missionId && m.completed && !m.claimed) {
                    reward = m.reward
                    return { ...m, claimed: true }
                }
                return m
            })
            return { missions: updated, reward }
        }

        const dailyResult = findAndClaim(this.state.dailyMissions)
        const weeklyResult = findAndClaim(this.state.weeklyMissions)

        const reward = dailyResult.reward || weeklyResult.reward

        if (reward) {
            if (reward.type === 'gold') this.addGold(reward.amount)
            else if (reward.type === 'gems') this.addGems(reward.amount)
            else if (reward.type === 'xp') this.addXp(reward.amount)
            else if (reward.type === 'chest') {
                this.state.chestInventory.push({
                    id: `chest-mission-${Date.now()}`,
                    type: 'golden'
                })
            }
        }

        this.state = {
            ...this.state,
            dailyMissions: dailyResult.missions,
            weeklyMissions: weeklyResult.missions
        }
        this.save()
    }

    // --- Council Actions ---

    startDeliberation() {
        this.state = {
            ...this.state,
            stats: { ...this.state.stats, councilSessions: this.state.stats.councilSessions + 1 }
        }
        this.addXp(5)
        this.updateMissionProgress('council', 1)
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

    // --- League Helpers ---

    getLeague() {
        return getLeagueForTrophies(this.state.trophies)
    }
}

export const gameStore = new MockStore()
