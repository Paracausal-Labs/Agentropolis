// =============================================================================
// GAME DATA - Comprehensive gameplay content definitions
// =============================================================================

import { AGENT_TYPES, COLORS } from './game-constants'

// =============================================================================
// CURRENCY SYSTEM
// =============================================================================

export const CURRENCIES = {
    gold: {
        id: 'gold',
        name: 'Gold',
        icon: '🪙',
        color: '#FFD700',
        description: 'Primary currency earned from battles and missions'
    },
    gems: {
        id: 'gems',
        name: 'Gems',
        icon: '💎',
        color: '#00F5FF',
        description: 'Premium currency for rare items'
    },
    tickets: {
        id: 'tickets',
        name: 'Battle Tickets',
        icon: '🎫',
        color: '#FF00FF',
        description: 'Entry tickets for special battles'
    }
}

// =============================================================================
// SKIN SYSTEM
// =============================================================================

export type SkinTier = 'common' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary' | 'mythic'

export interface AgentSkin {
    id: string
    name: string
    tier: SkinTier
    unlockLevel: number
    price: { currency: 'gold' | 'gems', amount: number }
    colors: {
        primary: string
        secondary: string
        glow: string
    }
    effects?: {
        particles?: boolean
        trail?: boolean
        aura?: boolean
    }
}

export const SKIN_TIERS: Record<SkinTier, { name: string, color: string, glowIntensity: number }> = {
    common: { name: 'Common', color: '#808080', glowIntensity: 0 },
    bronze: { name: 'Bronze', color: '#CD7F32', glowIntensity: 0.2 },
    silver: { name: 'Silver', color: '#C0C0C0', glowIntensity: 0.4 },
    gold: { name: 'Gold', color: '#FFD700', glowIntensity: 0.6 },
    platinum: { name: 'Platinum', color: '#E5E4E2', glowIntensity: 0.8 },
    legendary: { name: 'Legendary', color: '#FF6B00', glowIntensity: 1.0 },
    mythic: { name: 'Mythic', color: '#FF00FF', glowIntensity: 1.2 }
}

export const AGENT_SKINS: Record<string, AgentSkin[]> = {
    alphaHunter: [
        { id: 'default', name: 'Default', tier: 'common', unlockLevel: 1, price: { currency: 'gold', amount: 0 }, colors: { primary: '#00ff88', secondary: '#0D5016', glow: '#00ff88' } },
        { id: 'golden_suit', name: 'Golden Suit', tier: 'bronze', unlockLevel: 3, price: { currency: 'gold', amount: 500 }, colors: { primary: '#FFD700', secondary: '#8B7500', glow: '#FFD700' } },
        { id: 'cyber_hunter', name: 'Cyber Hunter', tier: 'silver', unlockLevel: 5, price: { currency: 'gold', amount: 1500 }, colors: { primary: '#00F5FF', secondary: '#006666', glow: '#00F5FF' }, effects: { trail: true } },
        { id: 'apex_predator', name: 'Apex Predator', tier: 'gold', unlockLevel: 7, price: { currency: 'gems', amount: 100 }, colors: { primary: '#FF3366', secondary: '#660022', glow: '#FF3366' }, effects: { particles: true } },
        { id: 'chrome_assassin', name: 'Chrome Assassin', tier: 'legendary', unlockLevel: 10, price: { currency: 'gems', amount: 500 }, colors: { primary: '#C0C0C0', secondary: '#404040', glow: '#FFFFFF' }, effects: { particles: true, aura: true } },
    ],
    riskSentinel: [
        { id: 'default', name: 'Default', tier: 'common', unlockLevel: 1, price: { currency: 'gold', amount: 0 }, colors: { primary: '#ff6b00', secondary: '#4A2800', glow: '#ff6b00' } },
        { id: 'bronze_armor', name: 'Bronze Armor', tier: 'bronze', unlockLevel: 3, price: { currency: 'gold', amount: 500 }, colors: { primary: '#CD7F32', secondary: '#8B5A00', glow: '#CD7F32' } },
        { id: 'silver_guardian', name: 'Silver Guardian', tier: 'silver', unlockLevel: 5, price: { currency: 'gold', amount: 1500 }, colors: { primary: '#C0C0C0', secondary: '#505050', glow: '#FFFFFF' } },
        { id: 'gold_fortress', name: 'Gold Fortress', tier: 'gold', unlockLevel: 7, price: { currency: 'gems', amount: 100 }, colors: { primary: '#FFD700', secondary: '#AA8C00', glow: '#FFD700' }, effects: { aura: true } },
        { id: 'mythic_shield', name: 'Mythic Shield', tier: 'legendary', unlockLevel: 10, price: { currency: 'gems', amount: 500 }, colors: { primary: '#9D00FF', secondary: '#4B0082', glow: '#FF00FF' }, effects: { particles: true, aura: true } },
    ],
    macroOracle: [
        { id: 'default', name: 'Default', tier: 'common', unlockLevel: 1, price: { currency: 'gold', amount: 0 }, colors: { primary: '#9d00ff', secondary: '#2D004D', glow: '#9d00ff' } },
        { id: 'mystic_bronze', name: 'Mystic Bronze', tier: 'bronze', unlockLevel: 3, price: { currency: 'gold', amount: 500 }, colors: { primary: '#CD7F32', secondary: '#5D3000', glow: '#CD7F32' } },
        { id: 'silver_seer', name: 'Silver Seer', tier: 'silver', unlockLevel: 5, price: { currency: 'gold', amount: 1500 }, colors: { primary: '#C0C0C0', secondary: '#404040', glow: '#E0E0E0' } },
        { id: 'golden_prophet', name: 'Golden Prophet', tier: 'gold', unlockLevel: 7, price: { currency: 'gems', amount: 100 }, colors: { primary: '#FFD700', secondary: '#8B6914', glow: '#FFFF00' }, effects: { trail: true } },
        { id: 'cosmic_oracle', name: 'Cosmic Oracle', tier: 'legendary', unlockLevel: 10, price: { currency: 'gems', amount: 500 }, colors: { primary: '#0000FF', secondary: '#000066', glow: '#00FFFF' }, effects: { particles: true, aura: true } },
    ],
    devilsAdvocate: [
        { id: 'default', name: 'Default', tier: 'common', unlockLevel: 1, price: { currency: 'gold', amount: 0 }, colors: { primary: '#ff3366', secondary: '#4D0012', glow: '#ff3366' } },
        { id: 'ember_demon', name: 'Ember Demon', tier: 'bronze', unlockLevel: 3, price: { currency: 'gold', amount: 500 }, colors: { primary: '#FF4500', secondary: '#8B2500', glow: '#FF6600' } },
        { id: 'shadow_fiend', name: 'Shadow Fiend', tier: 'silver', unlockLevel: 5, price: { currency: 'gold', amount: 1500 }, colors: { primary: '#2F2F2F', secondary: '#0F0F0F', glow: '#666666' } },
        { id: 'inferno_lord', name: 'Inferno Lord', tier: 'gold', unlockLevel: 7, price: { currency: 'gems', amount: 100 }, colors: { primary: '#FF0000', secondary: '#8B0000', glow: '#FF4444' }, effects: { particles: true } },
        { id: 'void_reaper', name: 'Void Reaper', tier: 'legendary', unlockLevel: 10, price: { currency: 'gems', amount: 500 }, colors: { primary: '#1a0a2a', secondary: '#000000', glow: '#9d00ff' }, effects: { particles: true, aura: true } },
    ],
    councilClerk: [
        { id: 'default', name: 'Default', tier: 'common', unlockLevel: 1, price: { currency: 'gold', amount: 0 }, colors: { primary: '#00f5ff', secondary: '#003844', glow: '#00f5ff' } },
        { id: 'bronze_scribe', name: 'Bronze Scribe', tier: 'bronze', unlockLevel: 3, price: { currency: 'gold', amount: 500 }, colors: { primary: '#CD7F32', secondary: '#5D3000', glow: '#CD7F32' } },
        { id: 'silver_secretary', name: 'Silver Secretary', tier: 'silver', unlockLevel: 5, price: { currency: 'gold', amount: 1500 }, colors: { primary: '#C0C0C0', secondary: '#505050', glow: '#E0E0E0' } },
        { id: 'golden_arbiter', name: 'Golden Arbiter', tier: 'gold', unlockLevel: 7, price: { currency: 'gems', amount: 100 }, colors: { primary: '#FFD700', secondary: '#AA8C00', glow: '#FFFF00' } },
        { id: 'quantum_clerk', name: 'Quantum Clerk', tier: 'legendary', unlockLevel: 10, price: { currency: 'gems', amount: 500 }, colors: { primary: '#00FFFF', secondary: '#008888', glow: '#00FFFF' }, effects: { particles: true, aura: true } },
    ],
}

// =============================================================================
// SHOP SYSTEM
// =============================================================================

export interface ShopItem {
    id: string
    type: 'agent' | 'skin' | 'chest' | 'currency' | 'boost'
    name: string
    description: string
    icon: string
    price: { currency: 'gold' | 'gems', amount: number }
    rarity: SkinTier
    agentId?: string
    skinId?: string
    quantity?: number
    discount?: number
}

export const FEATURED_SHOP_ITEMS: ShopItem[] = [
    { id: 'phoenix-arb', type: 'agent', name: 'Phoenix Arbitrage', description: 'Expert arbitrage agent', icon: '🦅', price: { currency: 'gems', amount: 200 }, rarity: 'gold', agentId: 'phoenix-arb' },
    { id: 'guardian-hedge', type: 'agent', name: 'Guardian Hedge', description: 'Defensive hedge specialist', icon: '🛡️', price: { currency: 'gems', amount: 150 }, rarity: 'silver', agentId: 'guardian-hedge' },
    { id: 'oracle-macro', type: 'agent', name: 'Oracle Macro', description: 'Market prediction master', icon: '🔮', price: { currency: 'gems', amount: 250 }, rarity: 'gold', agentId: 'oracle-macro' },
]

export const DAILY_DEALS: ShopItem[] = [
    { id: 'gold-pack-small', type: 'currency', name: 'Gold Pouch', description: '500 Gold', icon: '🪙', price: { currency: 'gems', amount: 20 }, rarity: 'common', quantity: 500 },
    { id: 'gold-pack-medium', type: 'currency', name: 'Gold Chest', description: '2000 Gold', icon: '💰', price: { currency: 'gems', amount: 70 }, rarity: 'bronze', quantity: 2000, discount: 15 },
    { id: 'silver-chest', type: 'chest', name: 'Silver Chest', description: 'Contains rare rewards', icon: '📦', price: { currency: 'gems', amount: 50 }, rarity: 'silver' },
    { id: 'golden-chest', type: 'chest', name: 'Golden Chest', description: 'Contains epic rewards', icon: '🎁', price: { currency: 'gems', amount: 150 }, rarity: 'gold' },
]

// =============================================================================
// MISSION SYSTEM
// =============================================================================

export interface Mission {
    id: string
    type: 'daily' | 'weekly' | 'achievement'
    title: string
    description: string
    icon: string
    target: number
    progress: number
    reward: {
        type: 'gold' | 'gems' | 'xp' | 'chest'
        amount: number
    }
    completed: boolean
    claimed: boolean
}

export const DAILY_MISSION_TEMPLATES: Omit<Mission, 'id' | 'progress' | 'completed' | 'claimed'>[] = [
    { type: 'daily', title: 'Deploy Orders', description: 'Deploy 3 agents', icon: '🤖', target: 3, reward: { type: 'gold', amount: 100 } },
    { type: 'daily', title: 'Council Session', description: 'Complete 2 council deliberations', icon: '🏛️', target: 2, reward: { type: 'gold', amount: 150 } },
    { type: 'daily', title: 'Coin Collector', description: 'Collect 20 coins in the city', icon: '🪙', target: 20, reward: { type: 'gold', amount: 200 } },
    { type: 'daily', title: 'Battle Victor', description: 'Win 1 battle', icon: '⚔️', target: 1, reward: { type: 'gems', amount: 10 } },
    { type: 'daily', title: 'XP Grinder', description: 'Earn 100 XP', icon: '⭐', target: 100, reward: { type: 'gold', amount: 250 } },
]

export const WEEKLY_MISSION_TEMPLATES: Omit<Mission, 'id' | 'progress' | 'completed' | 'claimed'>[] = [
    { type: 'weekly', title: 'Deployment Master', description: 'Deploy 20 agents this week', icon: '🚀', target: 20, reward: { type: 'gems', amount: 50 } },
    { type: 'weekly', title: 'Council Expert', description: 'Complete 10 council sessions', icon: '👑', target: 10, reward: { type: 'gems', amount: 75 } },
    { type: 'weekly', title: 'Battle Champion', description: 'Win 10 battles', icon: '🏆', target: 10, reward: { type: 'chest', amount: 1 } },
    { type: 'weekly', title: 'Wealth Builder', description: 'Earn 5000 gold', icon: '💰', target: 5000, reward: { type: 'gems', amount: 100 } },
]

// =============================================================================
// ACHIEVEMENT SYSTEM
// =============================================================================

export interface AchievementDef {
    id: string
    name: string
    description: string
    icon: string
    xpReward: number
    tiers?: { target: number, reward: number }[]
}

export const ACHIEVEMENTS: AchievementDef[] = [
    { id: 'first_deploy', name: 'First Steps', description: 'Deploy your first agent', icon: '👣', xpReward: 100 },
    { id: 'council_starter', name: 'Council Opener', description: 'Complete first deliberation', icon: '🏛️', xpReward: 150 },
    { id: 'first_trade', name: 'First Trade', description: 'Execute first approved trade', icon: '💱', xpReward: 200 },
    { id: 'full_council', name: 'Full House', description: 'Deploy 6 agents simultaneously', icon: '🎰', xpReward: 500 },
    { id: 'millionaire', name: 'Millionaire', description: 'Accumulate 1,000,000 gold', icon: '💎', xpReward: 1000 },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day login streak', icon: '🔥', xpReward: 500 },
    { id: 'streak_30', name: 'Monthly Master', description: '30-day login streak', icon: '🌟', xpReward: 2000 },
    { id: 'battle_10', name: 'Battle Tested', description: 'Win 10 battles', icon: '⚔️', xpReward: 300 },
    { id: 'battle_100', name: 'War Veteran', description: 'Win 100 battles', icon: '🎖️', xpReward: 1000 },
    { id: 'skin_collector', name: 'Fashion Forward', description: 'Own 10 skins', icon: '👗', xpReward: 400 },
    { id: 'legendary_skin', name: 'Living Legend', description: 'Own a legendary skin', icon: '✨', xpReward: 750 },
]

// =============================================================================
// CHEST SYSTEM
// =============================================================================

export type ChestType = 'wooden' | 'silver' | 'golden' | 'magical' | 'legendary'

export interface ChestDef {
    id: ChestType
    name: string
    icon: string
    unlockTimeHours: number
    color: string
    rewards: {
        goldMin: number
        goldMax: number
        gemsChance: number
        gemsMin: number
        gemsMax: number
        skinChance: number
        minSkinTier: SkinTier
    }
}

export const CHEST_TYPES: Record<ChestType, ChestDef> = {
    wooden: {
        id: 'wooden',
        name: 'Wooden Chest',
        icon: '📦',
        unlockTimeHours: 0.5,
        color: '#8B4513',
        rewards: { goldMin: 50, goldMax: 150, gemsChance: 0.1, gemsMin: 1, gemsMax: 5, skinChance: 0.05, minSkinTier: 'common' }
    },
    silver: {
        id: 'silver',
        name: 'Silver Chest',
        icon: '🪙',
        unlockTimeHours: 3,
        color: '#C0C0C0',
        rewards: { goldMin: 150, goldMax: 400, gemsChance: 0.25, gemsMin: 5, gemsMax: 15, skinChance: 0.15, minSkinTier: 'bronze' }
    },
    golden: {
        id: 'golden',
        name: 'Golden Chest',
        icon: '🎁',
        unlockTimeHours: 8,
        color: '#FFD700',
        rewards: { goldMin: 400, goldMax: 800, gemsChance: 0.5, gemsMin: 15, gemsMax: 40, skinChance: 0.3, minSkinTier: 'silver' }
    },
    magical: {
        id: 'magical',
        name: 'Magical Chest',
        icon: '🔮',
        unlockTimeHours: 12,
        color: '#9D00FF',
        rewards: { goldMin: 800, goldMax: 1500, gemsChance: 0.75, gemsMin: 30, gemsMax: 80, skinChance: 0.5, minSkinTier: 'gold' }
    },
    legendary: {
        id: 'legendary',
        name: 'Legendary Chest',
        icon: '👑',
        unlockTimeHours: 24,
        color: '#FF6B00',
        rewards: { goldMin: 1500, goldMax: 3000, gemsChance: 1.0, gemsMin: 80, gemsMax: 200, skinChance: 0.8, minSkinTier: 'platinum' }
    }
}

// =============================================================================
// LEAGUE SYSTEM
// =============================================================================

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'champion'

export interface LeagueDef {
    id: LeagueTier
    name: string
    icon: string
    color: string
    minTrophies: number
    maxTrophies: number
    seasonReward: { gold: number, gems: number, chest: ChestType }
}

export const LEAGUES: Record<LeagueTier, LeagueDef> = {
    bronze: { id: 'bronze', name: 'Bronze League', icon: '🥉', color: '#CD7F32', minTrophies: 0, maxTrophies: 399, seasonReward: { gold: 500, gems: 10, chest: 'silver' } },
    silver: { id: 'silver', name: 'Silver League', icon: '🥈', color: '#C0C0C0', minTrophies: 400, maxTrophies: 799, seasonReward: { gold: 1000, gems: 25, chest: 'golden' } },
    gold: { id: 'gold', name: 'Gold League', icon: '🥇', color: '#FFD700', minTrophies: 800, maxTrophies: 1199, seasonReward: { gold: 2000, gems: 50, chest: 'golden' } },
    platinum: { id: 'platinum', name: 'Platinum League', icon: '💎', color: '#E5E4E2', minTrophies: 1200, maxTrophies: 1799, seasonReward: { gold: 4000, gems: 100, chest: 'magical' } },
    diamond: { id: 'diamond', name: 'Diamond League', icon: '💠', color: '#00F5FF', minTrophies: 1800, maxTrophies: 2499, seasonReward: { gold: 8000, gems: 200, chest: 'magical' } },
    champion: { id: 'champion', name: 'Champion League', icon: '👑', color: '#FF00FF', minTrophies: 2500, maxTrophies: 99999, seasonReward: { gold: 15000, gems: 500, chest: 'legendary' } },
}

// =============================================================================
// BATTLE SYSTEM
// =============================================================================

export interface BattleAbility {
    id: string
    name: string
    description: string
    icon: string
    damage: number
    cooldown: number
    manaCost: number
    effects?: ('stun' | 'heal' | 'buff' | 'debuff')[]
}

export interface BattleAgentStats {
    agentType: string
    hp: number
    attack: number
    defense: number
    speed: number
    abilities: BattleAbility[]
}

export const AGENT_BATTLE_STATS: Record<string, BattleAgentStats> = {
    alphaHunter: {
        agentType: 'alphaHunter',
        hp: 100,
        attack: 25,
        defense: 10,
        speed: 15,
        abilities: [
            { id: 'quick_strike', name: 'Quick Strike', description: 'Fast attack dealing moderate damage', icon: '⚡', damage: 20, cooldown: 1, manaCost: 2 },
            { id: 'profit_surge', name: 'Profit Surge', description: 'High damage critical hit', icon: '💰', damage: 40, cooldown: 3, manaCost: 5 },
        ]
    },
    riskSentinel: {
        agentType: 'riskSentinel',
        hp: 150,
        attack: 15,
        defense: 25,
        speed: 8,
        abilities: [
            { id: 'shield_bash', name: 'Shield Bash', description: 'Defensive attack with stun chance', icon: '🛡️', damage: 15, cooldown: 2, manaCost: 3, effects: ['stun'] },
            { id: 'fortify', name: 'Fortify', description: 'Increase defense temporarily', icon: '🏰', damage: 0, cooldown: 4, manaCost: 4, effects: ['buff'] },
        ]
    },
    macroOracle: {
        agentType: 'macroOracle',
        hp: 80,
        attack: 30,
        defense: 8,
        speed: 12,
        abilities: [
            { id: 'forecast', name: 'Forecast', description: 'Predict and buff next attack', icon: '🔮', damage: 25, cooldown: 2, manaCost: 3, effects: ['buff'] },
            { id: 'market_crash', name: 'Market Crash', description: 'AOE damage to enemies', icon: '📉', damage: 35, cooldown: 4, manaCost: 6 },
        ]
    },
    devilsAdvocate: {
        agentType: 'devilsAdvocate',
        hp: 90,
        attack: 28,
        defense: 12,
        speed: 14,
        abilities: [
            { id: 'counter_argument', name: 'Counter Argument', description: 'Deals damage and debuffs enemy', icon: '😈', damage: 22, cooldown: 2, manaCost: 3, effects: ['debuff'] },
            { id: 'chaos_factor', name: 'Chaos Factor', description: 'Random high damage', icon: '🎲', damage: 50, cooldown: 5, manaCost: 7 },
        ]
    },
    councilClerk: {
        agentType: 'councilClerk',
        hp: 70,
        attack: 12,
        defense: 15,
        speed: 10,
        abilities: [
            { id: 'document', name: 'Document', description: 'Light attack that reveals enemy stats', icon: '📋', damage: 10, cooldown: 1, manaCost: 2 },
            { id: 'consensus_heal', name: 'Consensus Heal', description: 'Heal ally agents', icon: '💚', damage: -30, cooldown: 4, manaCost: 5, effects: ['heal'] },
        ]
    },
}

// Battle rewards based on trophy range
export const BATTLE_REWARDS = {
    win: { trophiesMin: 20, trophiesMax: 35, goldMin: 50, goldMax: 150, xp: 50, chestChance: 0.3 },
    loss: { trophiesMin: -15, trophiesMax: -25, goldMin: 10, goldMax: 30, xp: 15, chestChance: 0 },
}

// Mock opponents for battles
export const MOCK_OPPONENTS = [
    { name: 'TraderBot_42', trophies: 250, level: 3, agents: ['alphaHunter', 'riskSentinel'] },
    { name: 'DeFiKing', trophies: 450, level: 5, agents: ['macroOracle', 'devilsAdvocate', 'councilClerk'] },
    { name: 'YieldFarmer99', trophies: 320, level: 4, agents: ['alphaHunter', 'macroOracle'] },
    { name: 'CryptoSage', trophies: 580, level: 6, agents: ['riskSentinel', 'councilClerk', 'alphaHunter'] },
    { name: 'BlockchainWizard', trophies: 720, level: 7, agents: ['devilsAdvocate', 'macroOracle', 'riskSentinel'] },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getLeagueForTrophies(trophies: number): LeagueDef {
    for (const league of Object.values(LEAGUES).reverse()) {
        if (trophies >= league.minTrophies) return league
    }
    return LEAGUES.bronze
}

export function generateDailyMissions(): Mission[] {
    // Pick 3 random daily missions
    const shuffled = [...DAILY_MISSION_TEMPLATES].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3).map((template, i) => ({
        ...template,
        id: `daily-${Date.now()}-${i}`,
        progress: 0,
        completed: false,
        claimed: false
    }))
}

export function generateWeeklyMissions(): Mission[] {
    // Pick 2 random weekly missions
    const shuffled = [...WEEKLY_MISSION_TEMPLATES].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 2).map((template, i) => ({
        ...template,
        id: `weekly-${Date.now()}-${i}`,
        progress: 0,
        completed: false,
        claimed: false
    }))
}

export function rollChestRewards(chestType: ChestType): { gold: number, gems: number, skinId?: string } {
    const chest = CHEST_TYPES[chestType]
    const rewards: { gold: number, gems: number, skinId?: string } = {
        gold: Math.floor(Math.random() * (chest.rewards.goldMax - chest.rewards.goldMin + 1)) + chest.rewards.goldMin,
        gems: 0
    }

    if (Math.random() < chest.rewards.gemsChance) {
        rewards.gems = Math.floor(Math.random() * (chest.rewards.gemsMax - chest.rewards.gemsMin + 1)) + chest.rewards.gemsMin
    }

    // Skin drop logic could be added here
    return rewards
}
