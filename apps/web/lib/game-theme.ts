// Cyberpunk Game Theme - NEON COMMAND

export const GAME_COLORS = {
    // Primary Colors
    neon: {
        yellow: '#FCEE0A',
        pink: '#FF00FF',
        cyan: '#00F0FF',
    },

    // Backgrounds
    bg: {
        void: '#050510',
        panel: 'rgba(10, 10, 16, 0.9)',
        grid: 'rgba(252, 238, 10, 0.05)',
    },

    // UI Elements
    ui: {
        border: '#FCEE0A',
        text: '#ffffff',
        dim: '#666666',
        success: '#00FF00',
        danger: '#FF0000',
    }
}

// Agent Types (keeping 3D colors consistent but names techy)
export const AGENT_TYPES = {
    alphaHunter: { name: 'UNIT: ALPHA', emoji: '🎯', color: '#FFD700', role: 'Yield Hunter' },
    riskSentinel: { name: 'UNIT: AEGIS', emoji: '🛡️', color: '#00f5ff', role: 'Risk Ops' },
    macroOracle: { name: 'UNIT: SEER', emoji: '🔮', color: '#ff00ff', role: 'Data Core' },
    devilsAdvocate: { name: 'UNIT: ROGUE', emoji: '😈', color: '#ff3366', role: 'Counter-Logic' },
    councilClerk: { name: 'UNIT: ADMIN', emoji: '📋', color: '#ffffff', role: 'Protocol' },
    user: { name: 'COMMANDER', emoji: '👤', color: '#00f5ff', role: 'Admin' },
}

// Mock Agents Data
export const MOCK_AGENTS = [
    { id: 'luna', name: 'LUNA.EXE', type: 'alphaHunter', strategy: 'DCA_V2', reputation: 85 },
    { id: 'vortex', name: 'VORTEX.AI', type: 'riskSentinel', strategy: 'MOMENTUM_X', reputation: 72 },
    { id: 'sentinel', name: 'SENTINEL_PRIME', type: 'macroOracle', strategy: 'YIELD_MAX', reputation: 91 },
    { id: 'phoenix', name: 'PHOENIX_CORE', type: 'devilsAdvocate', strategy: 'ARB_BOT', reputation: 78 },
    { id: 'guardian', name: 'GUARDIAN_SYS', type: 'riskSentinel', strategy: 'HEDGE_PROTO', reputation: 88 },
    { id: 'oracle', name: 'ORACLE_DAEMON', type: 'macroOracle', strategy: 'MACRO_SCAN', reputation: 82 },
]

// Preset Prompts - COMMAND LINE STYLE
export const PRESET_PROMPTS = [
    { label: 'EXECUTE: YIELD_SCAN', prompt: 'Scanning for max yield opportunities...', emoji: '💰' },
    { label: 'INIT: SWAP_PROTOCOL', prompt: 'Initiate ETH to Stablecoin swap...', emoji: '🔄' },
    { label: 'LOCATE: LIQUIDITY', prompt: 'Locate high-volume LP nodes...', emoji: '🚀' },
    { label: 'DEPLOY: NEW_TOKEN', prompt: 'Initialize token launch sequence...', emoji: '🎯' },
]

export const ANIMATIONS = {
    fast: 100,
    normal: 250,
    slow: 500,
}
