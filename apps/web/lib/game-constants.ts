// Cyberpunk color palette based on game design
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
    },

    // Buildings
    building: {
        base: '#2a2a4a',
        windowWarm: '#ffff00',
        windowCool: '#00ffff',
        road: '#1a1a2a',
        grass: '#0a2a1a',
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
        color: COLORS.neon.yellow,
        role: 'Seeks yield',
    },
    riskSentinel: {
        name: 'Risk Sentinel',
        emoji: '🛡️',
        color: COLORS.neon.cyan,
        role: 'Identifies risks',
    },
    macroOracle: {
        name: 'Macro Oracle',
        emoji: '🔮',
        color: COLORS.neon.magenta,
        role: 'Market context',
    },
    devilsAdvocate: {
        name: "Devil's Advocate",
        emoji: '😈',
        color: COLORS.neon.red,
        role: 'Challenges',
    },
    councilClerk: {
        name: 'Council Clerk',
        emoji: '📋',
        color: COLORS.ui.textPrimary,
        role: 'Synthesizes',
    },
    user: {
        name: 'You',
        emoji: '👤',
        color: COLORS.neon.cyan,
        role: 'Decision maker',
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
        label: '💰 Passive Income',
        prompt: 'I want passive income from my 0.1 ETH',
        emoji: '💰',
    },
    {
        label: '🔄 Simple Swap',
        prompt: 'Swap 0.05 ETH to USDC',
        emoji: '🔄',
    },
    {
        label: '📈 High Yield LP',
        prompt: 'Provide liquidity for maximum yield',
        emoji: '📈',
    },
    {
        label: '🚀 Launch Token',
        prompt: 'Launch a memecoin for the lobster community',
        emoji: '🚀',
    },
]
