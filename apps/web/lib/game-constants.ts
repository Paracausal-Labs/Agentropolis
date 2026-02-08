// Cyberpunk color palette based on game design
export const CONFERENCE_ROOM_CONFIG = {
    table: {
        width: 8,
        depth: 4,
        height: 1.2,
    },
    chairPositions: [
        // 2 on each long side, 1 on each short side (total 6)
        [-2.5, 0, -3],
        [2.5, 0, -3],
        [-2.5, 0, 3],
        [2.5, 0, 3],
        [-5, 0, 0],
        [5, 0, 0],
    ] as [number, number, number][],
    floorSize: 20,
}

export const COLORS = {
    // Backgrounds
    bg: {
        primary: '#0a0a1a',
        secondary: '#0f172a',
        tertiary: '#1e1e3f',
        gradient: ['#0a0a1a', '#1a0a2a'],
    },

    // Neon Accents
    neon: {
        cyan: '#00f5ff',
        magenta: '#ff00ff',
        yellow: '#ffd700',
        green: '#00ff88',
        red: '#ff3366',
        orange: '#ff6b00',
        purple: '#9d00ff',
    },

    // Buildings
    building: {
        base: '#2a2a4a',
        windowWarm: '#ffff00',
        windowCool: '#00ffff',
        road: '#1a1a2a',
        grass: '#0a2a1a',
        office: '#1a1a2e',
        residential: '#2d2d44',
        commercial: '#1f1f3a',
        industrial: '#252540',
    },

    // UI
    ui: {
        cardBg: 'rgba(26, 26, 42, 0.8)',
        border: '#3a3a5a',
        textPrimary: '#ffffff',
        textSecondary: '#8a8aa0',
        glass: 'rgba(255, 255, 255, 0.05)',
    },
}

// Agent types with their visual identity
export const AGENT_TYPES = {
    alphaHunter: {
        name: 'Alpha Hunter',
        emoji: '🎯',
        color: COLORS.neon.green,
        secondary: '#0D5016',
        role: 'Seeks yield',
        shape: 'angular',
        catchphrase: "Profit is the only metric that matters.",
        description: "High-yield opportunity detection",
    },
    riskSentinel: {
        name: 'Risk Sentinel',
        emoji: '🛡️',
        color: COLORS.neon.orange,
        secondary: '#4A2800',
        role: 'Identifies risks',
        shape: 'blocky',
        catchphrase: "Safety first. Profits second.",
        description: "Portfolio protection and risk mitigation",
    },
    macroOracle: {
        name: 'Macro Oracle',
        emoji: '🔮',
        color: COLORS.neon.purple,
        secondary: '#2D004D',
        role: 'Market context',
        shape: 'ethereal',
        catchphrase: "The trends don't lie.",
        description: "Market pattern recognition and forecasting",
    },
    devilsAdvocate: {
        name: "Devil's Advocate",
        emoji: '😈',
        color: COLORS.neon.red,
        secondary: '#4D0012',
        role: 'Challenges',
        shape: 'spiky',
        catchphrase: "But have you considered...",
        description: "Finding flaws in any strategy",
    },
    councilClerk: {
        name: 'Council Clerk',
        emoji: '📋',
        color: COLORS.neon.cyan,
        secondary: '#003844',
        role: 'Synthesizes',
        shape: 'geometric',
        catchphrase: "Let me summarize the council's position.",
        description: "Consensus synthesis and documentation",
    },
    user: {
        name: 'You',
        emoji: '👤',
        color: COLORS.neon.yellow,
        secondary: '#504D00',
        role: 'Decision maker',
        shape: 'balanced',
        catchphrase: "I call the shots.",
        description: "Player character",
    },
}

// Animation timings
export const TIMINGS = {
    pageTransition: 400,
    modalOpen: 200,
    modalClose: 150,
    buttonHover: 150,
    agentWalk: 100,
    speechBubble: 300,
    typewriter: 30,
}

// Mock agents for deployment panel
export const MOCK_AGENTS = [
    {
        id: 'luna-dca',
        name: 'Luna DCA',
        strategy: 'dca',
        reputation: 85,
        type: 'alphaHunter',
    },
    {
        id: 'vortex-momentum',
        name: 'Vortex',
        strategy: 'momentum',
        reputation: 72,
        type: 'macroOracle',
    },
    {
        id: 'sentinel-yield',
        name: 'Sentinel',
        strategy: 'yield',
        reputation: 91,
        type: 'riskSentinel',
    },
    {
        id: 'phoenix-arb',
        name: 'Phoenix',
        strategy: 'arbitrage',
        reputation: 78,
        type: 'alphaHunter',
    },
    {
        id: 'guardian-hedge',
        name: 'Guardian',
        strategy: 'hedge',
        reputation: 88,
        type: 'riskSentinel',
    },
    {
        id: 'oracle-macro',
        name: 'Oracle',
        strategy: 'macro',
        reputation: 82,
        type: 'macroOracle',
    },
]

// Preset prompts
export const PRESET_PROMPTS = [
    {
        label: '🔄 Swap ETH→USDC',
        prompt: 'Swap 0.005 WETH to USDC',
        emoji: '🔄',
    },
    {
        label: '💰 Swap USDC→ETH',
        prompt: 'Swap 10 USDC to WETH',
        emoji: '💰',
    },
    {
        label: '📊 DCA Strategy',
        prompt: 'DCA 0.01 ETH into USDC weekly',
        emoji: '📊',
    },
    {
        label: '🛡️ Risk Assessment',
        prompt: 'Is it safe to swap 0.1 ETH to USDC right now?',
        emoji: '🛡️',
    },
]

// Wide 3x3 Grid - Spacing 10 units
// Vertical Lines: x = -10, 0, 10
// Horizontal Lines: z = -10, 0, 10
export const WALKING_PATH_NODES = [
    // Top Row (z = -10)
    { id: '1', position: [-10, 0, -10], connections: ['2', '4'] },
    { id: '2', position: [0, 0, -10], connections: ['1', '3', '5'] },
    { id: '3', position: [10, 0, -10], connections: ['2', '6'] },

    // Middle Row (z = 0)
    { id: '4', position: [-10, 0, 0], connections: ['1', '5', '7'] },
    { id: '5', position: [0, 0, 0], connections: ['2', '4', '6', '8'] }, // Center
    { id: '6', position: [10, 0, 0], connections: ['3', '5', '9'] },

    // Bottom Row (z = 10)
    { id: '7', position: [-10, 0, 10], connections: ['4', '8'] },
    { id: '8', position: [0, 0, 10], connections: ['5', '7', '9'] },
    { id: '9', position: [10, 0, 10], connections: ['6', '8'] },
]

// Road Configuration - Wide
// Width 2 for roads, Length 22 to cover spacing
export const ROADS_CONFIG = [
    // Vertical Roads (Along Z)
    { position: [-10, 0, 0], width: 2, length: 22, rotation: 0 },
    { position: [0, 0, 0], width: 2, length: 22, rotation: 0 },
    { position: [10, 0, 0], width: 2, length: 22, rotation: 0 },

    // Horizontal Roads (Along X) - Corrected rotation logic
    // We used width for X-size in vertical, so for horizontal we want X-size to be long (22)
    // and Z-size to be short (2). Rotation 0 is fine.
    { position: [0, 0, -10], width: 22, length: 2, rotation: 0 },
    { position: [0, 0, 0], width: 22, length: 2, rotation: 0 },
    { position: [0, 0, 10], width: 22, length: 2, rotation: 0 },
]


// Buildings Config - Spaced Out & Varied Sizes
export const BUILDINGS_CONFIG = [
    // Council Hall (Purple, Back Center) - increased size for grandeur
    { type: 'council', position: [0, 5, -15], size: [8, 12, 8] },

    // Top Row Blocks
    // Left Block - Tall Tower
    { type: 'office', position: [-5, 6, -5], size: [3, 12, 3] },
    // Right Block - Wide Corporate Block
    { type: 'office', position: [5, 4, -5], size: [6, 8, 5] },

    // Middle Row Blocks
    // Left - Tech Cluster
    { type: 'commercial', position: [-5, 3, 5], size: [3, 6, 3] },
    // Right - Trading Floor
    { type: 'commercial', position: [5, 2.5, 5], size: [5, 5, 5] },

    // Flanks (Outer Left -15, Outer Right 15)
    { type: 'industrial', position: [-15, 4, 0], size: [5, 8, 5] },
    { type: 'industrial', position: [15, 3, 0], size: [4, 6, 6] },

    // Front Row Corners - Skyline feel
    { type: 'residential', position: [-15, 2, 10], size: [2, 5, 2] },
    { type: 'residential', position: [15, 2.5, 10], size: [3, 4, 3] },
]

// Coin Configuration
export const COIN_CONFIG = {
    bronze: { value: 0.1, color: '#CD7F32' },
    silver: { value: 0.5, color: '#C0C0C0' },
    gold: { value: 1.0, color: '#FFD700' },
}

// Procedurally generate coins
const generateCoins = () => {
    const coins = []
    let id = 0
    // Lining Vertical Roads
    for (const x of [-10, 0, 10]) {
        for (let z = -10; z <= 10; z += 2.5) {
            coins.push({
                id: `c-${id++}`,
                position: [x, 0.5, z],
                type: Math.random() > 0.8 ? 'gold' : (Math.random() > 0.5 ? 'silver' : 'bronze')
            })
        }
    }
    // Lining Horizontal Roads
    for (const z of [-10, 0, 10]) {
        for (let x = -8; x <= 8; x += 3) {
            if (Math.abs(x) < 2) continue // Skip center intersection overlap
            coins.push({
                id: `c-${id++}`,
                position: [x, 0.5, z],
                type: 'bronze'
            })
        }
    }
    return coins
}

export const INITIAL_COINS = generateCoins()

// Street Lamps - Spaced Intersections
export const LAMP_POSITIONS: [number, number, number][] = [
    // Corners
    [-10, 0, -10], [10, 0, -10], [-10, 0, 10], [10, 0, 10],
    // Mids
    [-10, 0, 0], [10, 0, 0], [0, 0, -10], [0, 0, 10],
    // Center is usually clear for traffic, maybe corners of center block
    [-2, 0, -2], [2, 0, -2], [-2, 0, 2], [2, 0, 2]
]
