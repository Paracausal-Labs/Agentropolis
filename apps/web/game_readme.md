# 🏙️ AGENTROPOLIS — Game Design & Mock Implementation

> **"SimCity meets DeFi"** — A cyberpunk city-builder where AI agents walk the streets, deliberate your financial future, and execute real on-chain trades.

---

## 📋 Table of Contents

1. [Game Overview](#-game-overview)
2. [Game Sitemap](#-game-sitemap)
3. [Core Game Loop](#-core-game-loop)
4. [Game Mechanics](#-game-mechanics)
5. [Economy & Earning System](#-economy--earning-system)
6. [Agent Skins & Customization](#-agent-skins--customization)
7. [Mock Implementation](#-mock-implementation)
8. [State Management](#-state-management)
9. [Development Roadmap](#-development-roadmap)

---

## 🎮 Game Overview

### The Pitch
Agentropolis transforms complex DeFi operations into an engaging city-builder experience. Deploy autonomous AI agents, watch them debate around a council table, and approve their proposals to execute real blockchain transactions.

### Core Value Proposition
| Traditional DeFi | Agentropolis |
|------------------|--------------|
| Spreadsheets & buttons | Living, animated city |
| Read-only dashboards | Watch agents reason in real-time |
| Intimidating interfaces | Playful, game-like experience |
| Blind trust in protocols | Full transparency via council deliberation |

---

## 🗺️ Game Sitemap

```
AGENTROPOLIS
│
├── 🏠 LANDING PAGE (/)
│   ├── Hero Section (Title, CTA buttons)
│   ├── Feature Cards (Yellow, AI Agents, Uniswap)
│   └── Footer (Stats, System Status)
│
├── 🎮 MAIN APP (/app)
│   │
│   ├── 🏙️ CITY VIEW (Default)
│   │   ├── 3D Isometric City
│   │   ├── Agent Deployment Panel (Right)
│   │   ├── Top Header (Balance, Status, Connect)
│   │   └── Bottom Info Bar (Agent Count, Status)
│   │
│   ├── 🏛️ COUNCIL ROOM
│   │   ├── 3D Council Table View
│   │   ├── Agent Positions (5 AI + 1 User)
│   │   ├── Command Input (Presets + Custom)
│   │   ├── Speech Bubbles (Agent Deliberation)
│   │   └── Proposal Card (Approve/Reject)
│   │
│   └── 📊 FUTURE SCREENS
│       ├── Agent Marketplace (Buy/Upgrade Agents)
│       ├── Agent Detail View (Stats, History)
│       ├── Leaderboard (Agent Rankings)
│       ├── Settings (Sound, Theme, BYOA Config)
│       └── Transaction History
│
├── 🛒 MARKETPLACE (/marketplace) [PLANNED]
│   ├── Agent Shop
│   ├── Skin Gallery
│   └── Upgrade Store
│
└── 📈 LEADERBOARD (/leaderboard) [PLANNED]
    ├── Top Agents
    ├── User Rankings
    └── Achievement Badges
```

---

## 🔁 Core Game Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                      AGENTROPOLIS GAME LOOP                      │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │ 1. CONNECT   │  Connect wallet or play as guest
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ 2. DEPOSIT   │  Fund your session (mock: start with 100 YTEST)
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ 3. DEPLOY    │  Select and deploy agents to city (costs YTEST)
    │    AGENTS    │  Max 6 agents at a time
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ 4. ENTER     │  Click Council Hall building
    │   COUNCIL    │  Transition to deliberation room
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ 5. SUBMIT    │  Choose preset or type custom request
    │   REQUEST    │  "Swap 0.1 ETH to USDC"
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ 6. WATCH     │  Agents speak one-by-one
    │ DELIBERATION │  Support / Concern / Oppose animations
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ 7. REVIEW    │  See synthesized proposal
    │   PROPOSAL   │  Action, Amount, Risk, Reasoning
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │ 8. DECIDE                             │
    │                                       │
    │   ┌────────────┐    ┌────────────┐   │
    │   │ ✅ APPROVE  │    │ ❌ REJECT   │   │
    │   └─────┬──────┘    └─────┬──────┘   │
    │         │                  │          │
    │         ▼                  ▼          │
    │   Execute Trade      Dismiss Card     │
    │   (Mock or Real)     Return to Input  │
    └──────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ 9. EARN      │  Successful trades = XP + Rewards
    │   REWARDS    │  Level up agents, unlock skins
    └──────┬───────┘
           │
           ▼
        REPEAT
```

---

## ⚙️ Game Mechanics

### 1. Agent Deployment System

```typescript
// Agent Deployment Rules
const DEPLOYMENT_RULES = {
  maxAgents: 6,          // Maximum agents in city
  deployCost: 0.01,      // Cost in YTEST to deploy
  cooldownMs: 30000,     // Cooldown between deployments
  positions: [           // Fixed spawn positions
    [-4, 0, -4], [4, 0, -4],
    [-4, 0, 4],  [4, 0, 4],
    [-6, 0, 0],  [6, 0, 0],
  ],
}
```

**Deployment Flow:**
1. User selects agent from panel
2. Check balance >= deployCost
3. Deduct YTEST from balance
4. Play deployment animation (particle effect)
5. Agent spawns at next available position
6. Agent begins idle animation / walkabout

### 2. Council Deliberation System

```typescript
// Council Agent Personalities
const COUNCIL_AGENTS = {
  alphaHunter: {
    bias: 'yield',           // Prefers high APY options
    weight: 1.0,             // Vote weight
    speakOrder: 1,           // First to speak
  },
  riskSentinel: {
    bias: 'safety',          // Conservative, risk-averse
    weight: 1.5,             // Higher weight (can VETO with 2x)
    speakOrder: 2,
  },
  macroOracle: {
    bias: 'market',          // Considers market conditions
    weight: 1.0,
    speakOrder: 3,
  },
  devilsAdvocate: {
    bias: 'skeptical',       // Always challenges
    weight: 0.8,
    speakOrder: 4,
  },
  councilClerk: {
    bias: 'neutral',         // Synthesizes opinions
    weight: 0,               // No vote, just summarizes
    speakOrder: 5,
  },
}
```

**Deliberation Algorithm (Mock):**
1. Parse user prompt for intent (swap/LP/stake/launch)
2. Each agent generates opinion based on personality
3. Calculate consensus:
   - **Unanimous**: All support (green)
   - **Majority**: 3+ support (blue)
   - **Contested**: 2 support, 2+ oppose (yellow)
   - **Vetoed**: Risk Sentinel strongly opposes (red)

### 3. Proposal Generation

```typescript
interface Proposal {
  id: string              // Unique proposal ID
  action: string          // "Swap", "Add LP", "Stake", "Launch"
  inputToken: string      // Token to spend
  outputToken: string     // Token to receive
  inputAmount: string     // Amount to spend
  expectedOutput: string  // Expected return
  slippage: number        // 0.5% default
  risk: 'low' | 'medium' | 'high'
  reasoning: string       // Council's explanation
  votes: {
    support: number
    oppose: number
    abstain: number
  }
  consensus: 'unanimous' | 'majority' | 'contested' | 'vetoed'
}
```

### 4. Action Execution

| Action Type | Mock Behavior | Real Implementation |
|-------------|---------------|---------------------|
| Swap | Show success animation, update mock balance | Uniswap v4 swap |
| Add LP | Show success, add to "positions" list | Uniswap v4 add liquidity |
| Stake | Show success, start earning display | Protocol staking |
| Launch Token | Show mock token launch | Clanker token creation |

---

## 💰 Economy & Earning System

### Currency Types

```
┌─────────────────────────────────────────────────────────────────┐
│                        DUAL CURRENCY SYSTEM                      │
├──────────────────────────────┬──────────────────────────────────┤
│          YTEST (💎)           │           XP (⭐)                 │
│        (Session Currency)     │       (Progression Currency)     │
├──────────────────────────────┼──────────────────────────────────┤
│ • Deposited from wallet       │ • Earned from successful actions │
│ • Used for agent deploys      │ • Unlocks skins & features       │
│ • Used for council fees       │ • Cannot be purchased            │
│ • Withdrawable at session end │ • Persists across sessions       │
│ • Real value (backed by USDC) │ • No real value, pure game       │
└──────────────────────────────┴──────────────────────────────────┘
```

### Earning Mechanisms

```typescript
const EARNING_RATES = {
  // XP Earnings
  xp: {
    deployAgent: 10,         // Per agent deployed
    consultCouncil: 5,       // Per deliberation started
    approveProposal: 25,     // Per approved proposal
    successfulTrade: 50,     // When trade executes successfully
    dailyLogin: 100,         // First login of the day
    weekStreak: 500,         // 7-day login streak bonus
  },
  
  // YTEST Earnings (from successful trades)
  ytest: {
    tradeProfitCut: 0.001,   // 0.1% of profit goes to treasury
    referralBonus: 0.05,     // 5% of referee's first trade
  },
}
```

### Level System

| Level | XP Required | Unlocks |
|-------|-------------|---------|
| 1 | 0 | Basic agents, 2 deploy slots |
| 2 | 500 | 3rd deploy slot |
| 3 | 1,500 | Bronze skins |
| 4 | 3,500 | 4th deploy slot |
| 5 | 7,000 | Silver skins |
| 6 | 12,000 | 5th deploy slot |
| 7 | 20,000 | Gold skins |
| 8 | 35,000 | 6th deploy slot (MAX) |
| 9 | 55,000 | Platinum skins |
| 10 | 100,000 | Legendary skins + Custom agent |

### Achievement Badges

```typescript
const ACHIEVEMENTS = [
  { id: 'first_deploy', name: 'First Steps', desc: 'Deploy your first agent', xp: 100 },
  { id: 'council_starter', name: 'Council Opener', desc: 'Complete first deliberation', xp: 150 },
  { id: 'trader', name: 'First Trade', desc: 'Execute first approved trade', xp: 200 },
  { id: 'full_council', name: 'Full House', desc: 'Deploy 6 agents simultaneously', xp: 500 },
  { id: 'millionaire', name: 'Millionaire', desc: 'Accumulate 1M YTEST in trades', xp: 1000 },
  { id: 'streak_7', name: 'Week Warrior', desc: '7-day login streak', xp: 500 },
  { id: 'streak_30', name: 'Monthly Master', desc: '30-day login streak', xp: 2000 },
  { id: 'unanimous', name: 'Harmonious', desc: 'Get 5 unanimous proposals', xp: 750 },
  { id: 'devil_approve', name: 'Devil Approved', desc: 'Get Devil\'s Advocate to support', xp: 300 },
]
```

---

## 🎨 Agent Skins & Customization

### Skin Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│                         SKIN RARITY TIERS                        │
├─────────────┬──────────────┬────────────────┬───────────────────┤
│   COMMON    │    BRONZE    │    SILVER      │      GOLD         │
│   (Free)    │  (Lvl 3+)    │   (Lvl 5+)     │    (Lvl 7+)       │
├─────────────┼──────────────┼────────────────┼───────────────────┤
│ Default look│ Subtle glow  │ Particle trail │ Full aura effect  │
│ Basic colors│ Metallic tint│ Holographic    │ Animated outfit   │
│             │ Bronze badge │ Silver badge   │ Gold badge        │
├─────────────┼──────────────┼────────────────┼───────────────────┤
│   PLATINUM  │  LEGENDARY   │   MYTHIC       │    CUSTOM         │
│  (Lvl 9+)   │  (Lvl 10+)   │  (Special)     │   (Lvl 10)        │
├─────────────┼──────────────┼────────────────┼───────────────────┤
│ Shape morph │ Complete     │ Event-only     │ User-designed     │
│ RGB cycling │ transformation│ Unique designs │ Upload custom     │
│ Plat badge  │ Epic effects │ NFT-backed     │ Full creative     │
└─────────────┴──────────────┴────────────────┴───────────────────┘
```

### Available Skins (Mock Data)

```typescript
const AGENT_SKINS = {
  alphaHunter: [
    { id: 'default', name: 'Default', tier: 'common', unlockLevel: 1 },
    { id: 'golden_suit', name: 'Golden Suit', tier: 'bronze', unlockLevel: 3 },
    { id: 'cyber_hunter', name: 'Cyber Hunter', tier: 'silver', unlockLevel: 5 },
    { id: 'apex_predator', name: 'Apex Predator', tier: 'gold', unlockLevel: 7 },
    { id: 'chrome_assassin', name: 'Chrome Assassin', tier: 'legendary', unlockLevel: 10 },
  ],
  riskSentinel: [
    { id: 'default', name: 'Default', tier: 'common', unlockLevel: 1 },
    { id: 'bronze_armor', name: 'Bronze Armor', tier: 'bronze', unlockLevel: 3 },
    { id: 'silver_guardian', name: 'Silver Guardian', tier: 'silver', unlockLevel: 5 },
    { id: 'gold_fortress', name: 'Gold Fortress', tier: 'gold', unlockLevel: 7 },
    { id: 'mythic_shield', name: 'Mythic Shield', tier: 'legendary', unlockLevel: 10 },
  ],
  // ... similar for other agents
}
```

### Customization Options

| Category | Options | Unlock Method |
|----------|---------|---------------|
| **Agent Skins** | 5+ per agent type | Level progression |
| **Council Table** | 6 table designs | XP purchase (5000 XP each) |
| **City Theme** | Day/Night/Neon/Sunset | Level 4+ unlock |
| **Speech Bubbles** | Classic/Comic/Digital/Pixel | Achievements |
| **Sound Packs** | Default/Retro/Ambient/Silent | Settings (Free) |
| **Agent Titles** | "The Bold", "The Wise", etc. | Achievements |

---

## 🔧 Mock Implementation

### Mock Data Store (LocalStorage)

```typescript
// lib/mock/store.ts
interface MockGameState {
  // Session
  isGuest: boolean
  sessionId: string | null
  
  // Currency
  ytestBalance: number      // Mock YTEST balance (start: 100)
  xpTotal: number           // Lifetime XP earned
  level: number             // Current level (1-10)
  
  // Agents
  deployedAgents: DeployedAgent[]
  ownedAgents: string[]     // Agent IDs owned
  
  // Skins
  unlockedSkins: string[]   // Skin IDs unlocked
  equippedSkins: Record<string, string>  // agentType -> skinId
  
  // Progress
  achievements: string[]    // Achievement IDs earned
  proposalHistory: Proposal[]
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

// Default state for new users / guests
const DEFAULT_MOCK_STATE: MockGameState = {
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
    lastLoginDate: '',
  },
}
```

### Mock Service Functions

```typescript
// lib/mock/services.ts

// Deposit mock funds
function mockDeposit(amount: number): void {
  state.ytestBalance += amount
  saveState()
}

// Deploy agent (costs YTEST)
function mockDeployAgent(agentId: string): { success: boolean; error?: string } {
  if (state.deployedAgents.length >= 6) {
    return { success: false, error: 'Max agents deployed' }
  }
  if (state.ytestBalance < 0.01) {
    return { success: false, error: 'Insufficient YTEST balance' }
  }
  
  state.ytestBalance -= 0.01
  state.deployedAgents.push({ id: agentId, deployedAt: Date.now() })
  state.xpTotal += EARNING_RATES.xp.deployAgent
  state.stats.agentsDeployed++
  saveState()
  
  return { success: true }
}

// Generate mock council deliberation
function mockDeliberate(prompt: string): DeliberationResult {
  const opinions = COUNCIL_AGENTS.map(agent => ({
    agent: agent.id,
    stance: generateStance(agent, prompt),
    reasoning: generateReasoning(agent, prompt),
  }))
  
  const proposal = synthesizeProposal(prompt, opinions)
  
  state.stats.councilSessions++
  state.xpTotal += EARNING_RATES.xp.consultCouncil
  saveState()
  
  return { opinions, proposal }
}

// Execute mock trade
function mockExecuteTrade(proposalId: string): TradeResult {
  const proposal = state.proposalHistory.find(p => p.id === proposalId)
  if (!proposal) return { success: false, error: 'Proposal not found' }
  
  // Simulate 95% success rate
  const success = Math.random() > 0.05
  
  if (success) {
    state.xpTotal += EARNING_RATES.xp.successfulTrade
    state.stats.successfulTrades++
    state.stats.totalVolumeUsd += parseFloat(proposal.inputAmount)
    
    // Update balance based on mock trade result
    const inputValue = parseFloat(proposal.inputAmount)
    const outputValue = parseFloat(proposal.expectedOutput)
    // Mock: slight profit or loss
    const resultValue = outputValue * (0.98 + Math.random() * 0.04)
    state.ytestBalance -= inputValue
    state.ytestBalance += resultValue
  }
  
  state.stats.totalTrades++
  saveState()
  
  return {
    success,
    txHash: success ? `0x${Math.random().toString(16).slice(2, 66)}` : undefined,
    received: success ? proposal.expectedOutput : undefined,
    error: success ? undefined : 'Transaction reverted',
  }
}
```

### Mock Deliberation Algorithm

```typescript
// Determine agent stance based on personality and prompt
function generateStance(agent: CouncilAgent, prompt: string): Stance {
  const promptLower = prompt.toLowerCase()
  
  switch (agent.id) {
    case 'alphaHunter':
      // Loves yield, swaps, LP
      if (promptLower.includes('yield') || promptLower.includes('apy')) return 'support'
      if (promptLower.includes('swap')) return 'support'
      return Math.random() > 0.3 ? 'support' : 'neutral'
      
    case 'riskSentinel':
      // Cautious about everything risky
      if (promptLower.includes('launch') || promptLower.includes('meme')) return 'oppose'
      if (promptLower.includes('high yield')) return 'concern'
      if (promptLower.includes('stable')) return 'support'
      return Math.random() > 0.5 ? 'concern' : 'neutral'
      
    case 'macroOracle':
      // Market-aware, neutral-ish
      return Math.random() > 0.4 ? 'support' : 'neutral'
      
    case 'devilsAdvocate':
      // Always finds problems
      return Math.random() > 0.7 ? 'oppose' : 'concern'
      
    case 'councilClerk':
      // No stance, just synthesizes
      return 'neutral'
      
    default:
      return 'neutral'
  }
}
```

---

## 📦 State Management

### React Context Structure

```typescript
// contexts/GameContext.tsx
interface GameContextValue {
  // State
  state: MockGameState
  
  // Session Actions
  startSession: () => void
  endSession: () => void
  
  // Economy Actions
  deposit: (amount: number) => void
  withdraw: (amount: number) => void
  
  // Agent Actions
  deployAgent: (agentId: string) => Promise<DeployResult>
  removeAgent: (agentId: string) => void
  equipSkin: (agentType: string, skinId: string) => void
  
  // Council Actions
  startDeliberation: (prompt: string) => Promise<DeliberationResult>
  approveProposal: (proposalId: string) => Promise<TradeResult>
  rejectProposal: (proposalId: string) => void
  
  // Progression
  checkAchievements: () => Achievement[]
  getLevelProgress: () => { current: number; next: number; progress: number }
}
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          DATA FLOW                               │
└─────────────────────────────────────────────────────────────────┘

     User Action                   State Update                 UI Update
         │                              │                           │
         ▼                              ▼                           ▼
┌──────────────┐              ┌──────────────────┐         ┌──────────────┐
│ Click Deploy │──────────────▶│ mockDeployAgent()│─────────▶│ Agent appears│
│    Button    │              │ - Deduct YTEST   │         │ in city view │
│              │              │ - Add to deployed│         │              │
│              │              │ - Award XP       │         │ Balance UI   │
│              │              │ - Save to storage│         │ updates      │
└──────────────┘              └──────────────────┘         └──────────────┘
                                      │
                                      ▼
                              ┌──────────────────┐
                              │   localStorage   │
                              │ (Persists state) │
                              └──────────────────┘
```

---

## 🚀 Development Roadmap

### Phase 1: Core UI & Mock Gameplay (Current)
- [x] Cyberpunk theme implementation
- [x] Landing page design
- [x] City View with 3D scene
- [x] Council Room with 3D scene
- [x] Agent deployment panel
- [ ] Mock state management (LocalStorage)
- [ ] Mock deliberation flow
- [ ] Mock balance & XP system

### Phase 2: Full Mock Gameplay
- [ ] Skin system implementation
- [ ] Level progression UI
- [ ] Achievement system
- [ ] Agent marketplace mock
- [ ] Transaction history view
- [ ] Settings page
- [ ] Sound effects

### Phase 3: Backend Integration
- [ ] Yellow Network session integration
- [ ] Uniswap v4 swap execution
- [ ] ERC-8004 agent registry
- [ ] ENS identity resolution
- [ ] x402 micropayments

### Phase 4: Polish & Launch
- [ ] Performance optimization
- [ ] Mobile responsive design
- [ ] Onboarding tutorial
- [ ] Analytics & tracking
- [ ] Production deployment

---

## 📁 File Structure (Proposed)

```
apps/web/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── providers.tsx               # Context providers
│   ├── app/
│   │   └── page.tsx                # Main game app
│   ├── marketplace/
│   │   └── page.tsx                # Agent marketplace
│   └── leaderboard/
│       └── page.tsx                # Global rankings
│
├── components/
│   ├── game/
│   │   ├── CityView3D.tsx          # Main city scene
│   │   ├── CouncilRoom3D.tsx       # Council deliberation
│   │   ├── AgentPanel.tsx          # Deploy panel (extracted)
│   │   └── 3d/
│   │       ├── Agents.tsx          # 3D agent models
│   │       └── Buildings.tsx       # 3D buildings
│   ├── ui/
│   │   ├── CyberButton.tsx         # Styled button
│   │   ├── CyberPanel.tsx          # Styled panel
│   │   ├── SpeechBubble.tsx        # Agent speech
│   │   └── ProposalCard.tsx        # Proposal display
│   └── modals/
│       ├── SettingsModal.tsx       # Game settings
│       ├── AgentDetailModal.tsx    # Agent info
│       └── SkinSelectorModal.tsx   # Skin picker
│
├── lib/
│   ├── mock/
│   │   ├── store.ts                # Mock state management
│   │   ├── services.ts             # Mock service functions
│   │   └── data.ts                 # Mock data (agents, skins)
│   ├── game-constants.ts           # Game config
│   └── game-theme.ts               # Theme tokens
│
├── contexts/
│   └── GameContext.tsx             # Game state context
│
└── hooks/
    ├── useGame.ts                  # Game state hook
    ├── useAgents.ts                # Agent management
    └── useAchievements.ts          # Achievement tracking
```

---

## 🎯 Next Steps

1. **Create Mock Store** (`lib/mock/store.ts`)
   - Implement LocalStorage-based state
   - Add all CRUD operations

2. **Create Game Context** (`contexts/GameContext.tsx`)
   - Wrap app with provider
   - Expose all game actions

3. **Implement Mock Deliberation** (`lib/mock/services.ts`)
   - Agent opinion generation
   - Proposal synthesis
   - Consensus calculation

4. **Add Progression UI**
   - XP bar component
   - Level indicator
   - Achievement notifications

5. **Build Marketplace Page**
   - Agent cards with skins
   - Purchase/unlock flow
   - Owned items gallery

---

## 🌃 Enhanced 3D City View

### Expanded City Environment

The city view will be enhanced with a more immersive and detailed environment:

```
┌─────────────────────────────────────────────────────────────────┐
│                      ENHANCED CITY LAYOUT                        │
└─────────────────────────────────────────────────────────────────┘

    🏢──🏠──🏬──🏠──🏢               NORTH DISTRICT
       │    │    │
    ───┼────┼────┼───  ← MAIN BOULEVARD (Agent Walking Path)
       │    │    │
    🏪──🏛️──🌳──🏪──🏭               CENTRAL DISTRICT
       │ COUNCIL │                   (Council Hall Center)
    ───┼────┼────┼───  ← CROSS STREET (Coin Collection Route)
       │    │    │
    🏠──🏬──🏪──🏬──🏠               SOUTH DISTRICT

Legend:
🏛️ Council Hall (Central, Clickable)
🏢 Office Buildings (Tall, Glowing Windows)
🏠 Residential Houses (Cozy, Warm Lights)
🏬 Shops & Stores (Neon Signs, Colorful)
🏪 Markets (Street Vendors)
🏭 Factory/Industrial (Smoke Effects)
🌳 Park/Green Space (Trees, Benches)
💡 Street Lamps (Night Ambiance)
🪙 Collectible Coins (On Walking Paths)
```

### New Building Types

```typescript
const BUILDING_TYPES = {
  council: {
    color: '#FF00FF',        // Magenta glow
    emissive: true,
    label: 'COUNCIL HALL',
    clickable: true,
  },
  office: {
    color: '#1a1a2e',
    variants: ['skyscraper', 'tower', 'corporate'],
    heightRange: [3, 6],
  },
  residential: {
    color: '#2d2d44',
    variants: ['house', 'apartment', 'townhouse'],
    heightRange: [1.5, 3],
  },
  commercial: {
    color: '#1f1f3a',
    variants: ['shop', 'market', 'mall'],
    neonSigns: true,
  },
  industrial: {
    color: '#252540',
    variants: ['factory', 'warehouse'],
    smokeEffect: true,
  },
  park: {
    type: 'nature',
    elements: ['trees', 'benches', 'fountain'],
  },
}
```

### Street Lamps & Night Ambiance

```typescript
interface StreetLamp {
  position: [number, number, number]
  lightColor: '#FFD700' | '#00F0FF' | '#FF6B00'  // Warm, Cyan, Orange
  intensity: number
  range: number
  flickerEffect: boolean
}

const STREET_LAMP_CONFIG = {
  poleHeight: 2.5,
  lightRadius: 0.3,
  glowIntensity: 0.8,
  shadowsEnabled: true,
  flickerChance: 0.05,  // 5% chance of flickering
  spacing: 4,           // Distance between lamps
}

// Placement along roads
const LAMP_POSITIONS = [
  // Main Boulevard
  [-8, 0, 0], [-4, 0, 0], [4, 0, 0], [8, 0, 0],
  // Cross Streets
  [0, 0, -8], [0, 0, -4], [0, 0, 4], [0, 0, 8],
  // Corner decorative lamps
  [-6, 0, -6], [6, 0, -6], [-6, 0, 6], [6, 0, 6],
]
```

### Street System & Walking Paths

```typescript
interface Street {
  id: string
  start: [number, number, number]
  end: [number, number, number]
  width: number
  type: 'main' | 'secondary' | 'alley'
  sidewalks: boolean
  crosswalks: boolean
}

// Agent walking path nodes
const WALKING_PATH_NODES = [
  { id: 'A', position: [-8, 0, 0], connections: ['B'] },
  { id: 'B', position: [-4, 0, 0], connections: ['A', 'C', 'E'] },
  { id: 'C', position: [0, 0, 0], connections: ['B', 'D', 'G'] },
  { id: 'D', position: [4, 0, 0], connections: ['C', 'H'] },
  { id: 'E', position: [-4, 0, -4], connections: ['B', 'F'] },
  { id: 'F', position: [0, 0, -4], connections: ['E', 'G'] },
  { id: 'G', position: [0, 0, 4], connections: ['C', 'H'] },
  { id: 'H', position: [4, 0, 4], connections: ['D', 'G'] },
]

// Agent pathfinding
function findPath(from: string, to: string): string[] {
  // A* pathfinding algorithm implementation
  // Returns array of node IDs representing the path
}
```

### Coin Collection System

```typescript
interface Coin {
  id: string
  position: [number, number, number]
  value: number              // YTEST value (0.001 - 0.01)
  type: 'bronze' | 'silver' | 'gold'
  respawnTime: number        // Seconds until respawn after collection
  isCollected: boolean
  animationPhase: number     // For rotation/bounce animation
}

const COIN_CONFIG = {
  bronze: { value: 0.001, color: '#CD7F32', emissive: 0.3 },
  silver: { value: 0.005, color: '#C0C0C0', emissive: 0.5 },
  gold:   { value: 0.01,  color: '#FFD700', emissive: 0.8 },
}

// Coin spawn points along walking paths
const COIN_SPAWN_POINTS = [
  { position: [-6, 0.5, 0], type: 'bronze' },
  { position: [-2, 0.5, 0], type: 'silver' },
  { position: [2, 0.5, 0], type: 'bronze' },
  { position: [6, 0.5, 0], type: 'gold' },
  { position: [0, 0.5, -6], type: 'bronze' },
  { position: [0, 0.5, 6], type: 'silver' },
]

// Collection mechanics
function collectCoin(agentId: string, coinId: string): boolean {
  // Check if agent is within collection radius (0.5 units)
  // Add coin value to player's YTEST balance
  // Play collection animation & sound
  // Mark coin as collected and start respawn timer
}
```

### Agent Walking Animation

```typescript
interface WalkingAgent extends DeployedAgent {
  currentPath: string[]      // Node IDs
  currentPathIndex: number
  walkSpeed: number          // Units per second
  isWalking: boolean
  targetPosition: [number, number, number]
}

const WALKING_CONFIG = {
  baseSpeed: 1.5,
  bobAmplitude: 0.1,
  bobFrequency: 8,
  turnSpeed: 2,
  idleTime: { min: 2000, max: 5000 },  // ms between walks
}

// Walking state machine
type AgentState = 'idle' | 'walking' | 'turning' | 'interacting' | 'collecting'
```

---

## 🏛️ Enhanced Council Chamber

### Unique Agent Colors & Appearance

Each council agent will have a distinct color palette and visual appearance:

```typescript
const COUNCIL_AGENT_COLORS = {
  alphaHunter: {
    primary: '#00FF00',      // Bright Green - Aggressive yield hunter
    secondary: '#0D5016',
    glow: '#00FF00',
    aura: 'pulsing',
    shape: 'angular',        // Sharp, aggressive design
  },
  riskSentinel: {
    primary: '#FF6B00',      // Orange - Cautious guardian
    secondary: '#4A2800',
    glow: '#FF8C00',
    aura: 'rotating_shield',
    shape: 'blocky',         // Solid, defensive design
  },
  macroOracle: {
    primary: '#9D00FF',      // Purple - Mystical seer
    secondary: '#2D004D',
    glow: '#BF00FF',
    aura: 'floating_particles',
    shape: 'ethereal',       // Flowing, mystical design
  },
  devilsAdvocate: {
    primary: '#FF0040',      // Red - Challenger
    secondary: '#4D0012',
    glow: '#FF1744',
    aura: 'flame',
    shape: 'spiky',          // Provocative design
  },
  councilClerk: {
    primary: '#00F0FF',      // Cyan - Neutral recorder
    secondary: '#003844',
    glow: '#00E5FF',
    aura: 'holographic',
    shape: 'geometric',      // Clean, organized design
  },
  user: {
    primary: '#FCEE0A',      // Yellow - Player character
    secondary: '#504D00',
    glow: '#FFFF00',
    aura: 'crown',
    shape: 'balanced',       // Player avatar
  },
}
```

### Agent Interaction System

```typescript
interface CouncilAgent3D {
  id: string
  position: [number, number, number]
  rotation: number
  isSelected: boolean
  isHighlighted: boolean
  isSpeaking: boolean
  currentAnimation: 'idle' | 'talking' | 'thinking' | 'agreeing' | 'disagreeing'
  lookAtTarget: [number, number, number] | null
}

// Agent idle animations - agents look at each other, gesture, etc.
const IDLE_BEHAVIORS = [
  'look_around',
  'nod',
  'shake_head',
  'adjust_stance',
  'look_at_neighbor',
  'check_holographic_display',
]

// Random interaction events
const INTERACTION_EVENTS = [
  { type: 'whisper', agents: ['alphaHunter', 'macroOracle'] },
  { type: 'debate', agents: ['riskSentinel', 'devilsAdvocate'] },
  { type: 'consult', agents: ['councilClerk', 'user'] },
]
```

### Selection & Highlighting System

```typescript
interface SelectionState {
  selectedAgentId: string | null
  highlightedAgentId: string | null
}

const SELECTION_CONFIG = {
  // Glow effect when hovering
  hoverGlow: {
    color: '#FFFFFF',
    intensity: 0.5,
    pulseSpeed: 2,
  },
  
  // Border glow when selected
  selectedGlow: {
    color: 'agent_primary',   // Uses agent's primary color
    intensity: 1.2,
    pulseSpeed: 3,
    ringRadius: 0.8,
    ringThickness: 0.05,
  },
  
  // Click feedback
  clickEffect: {
    type: 'ripple',
    duration: 300,
    color: '#FCEE0A',
  },
}

// Selection visual component
function AgentSelectionRing({ agent, isSelected }: { agent: CouncilAgent3D, isSelected: boolean }) {
  // Render glowing ring around selected agent
  // Ring pulses and rotates slowly
  // Color matches agent's primary color
}
```

### Agent Introduction System

When an agent is clicked/selected, it introduces itself:

```typescript
interface AgentIntroduction {
  agentId: string
  greeting: string
  name: string
  title: string
  specialty: string
  personality: string
  catchphrase: string
}

const AGENT_INTRODUCTIONS: Record<string, AgentIntroduction> = {
  alphaHunter: {
    agentId: 'alphaHunter',
    greeting: "INITIATING_HANDSHAKE...",
    name: "ALPHA-7",
    title: "Yield Optimization Unit",
    specialty: "High-yield opportunity detection",
    personality: "I hunt the most profitable opportunities in the market. Nothing escapes my analysis.",
    catchphrase: "Profit is the only metric that matters.",
  },
  riskSentinel: {
    agentId: 'riskSentinel',
    greeting: "SECURITY_PROTOCOL_ACTIVE...",
    name: "SENTINEL-X",
    title: "Risk Assessment Guardian",
    specialty: "Portfolio protection and risk mitigation",
    personality: "I see threats where others see opportunities. Your assets are my priority.",
    catchphrase: "Safety first. Profits second.",
  },
  macroOracle: {
    agentId: 'macroOracle',
    greeting: "SCANNING_MARKET_HORIZON...",
    name: "ORACLE-Ψ",
    title: "Macro Trend Analyst",
    specialty: "Market pattern recognition and forecasting",
    personality: "The market speaks to those who listen. I translate its whispers into wisdom.",
    catchphrase: "The trends don't lie.",
  },
  devilsAdvocate: {
    agentId: 'devilsAdvocate',
    greeting: "COUNTER_ARGUMENT_LOADING...",
    name: "ADVOCATE-Ω",
    title: "Critical Analysis Unit",
    specialty: "Finding flaws in any strategy",
    personality: "Everyone else sees gains. I see what could go wrong. Someone has to.",
    catchphrase: "But have you considered...",
  },
  councilClerk: {
    agentId: 'councilClerk',
    greeting: "RECORDS_ACCESSED...",
    name: "CLERK-01",
    title: "Council Administrator",
    specialty: "Consensus synthesis and documentation",
    personality: "I listen to all voices and find the common ground. The council's wisdom flows through me.",
    catchphrase: "Let me summarize the council's position.",
  },
}

// Introduction UI component
function AgentIntroductionPanel({ agent, onClose, onStartChat }: {
  agent: AgentIntroduction
  onClose: () => void
  onStartChat: () => void
}) {
  // Cyberpunk-styled panel that slides in
  // Shows agent avatar, name, title
  // Animated text reveal for personality
  // "START CONVERSATION" button
}
```

### Agent Conversation System

```typescript
interface ChatMessage {
  id: string
  sender: 'user' | 'agent'
  agentId?: string
  content: string
  timestamp: number
  type: 'text' | 'action' | 'proposal'
}

interface ChatSession {
  agentId: string
  messages: ChatMessage[]
  isActive: boolean
  context: 'casual' | 'strategy' | 'proposal_review'
}

// Agent response generation (mock)
function generateAgentResponse(agentId: string, userMessage: string, context: string): string {
  const personality = COUNCIL_AGENTS[agentId].personality
  
  // Mock responses based on agent personality
  const responses = {
    alphaHunter: [
      "Interesting perspective. Let me run the numbers on that opportunity...",
      "I've identified a 12.4% yield opportunity that aligns with your goals.",
      "The market is showing bullish signals. We should capitalize.",
    ],
    riskSentinel: [
      "I must caution you about the potential downsides here...",
      "Have you allocated an emergency reserve? I recommend 20% in stables.",
      "The volatility metrics suggest we should wait for confirmation.",
    ],
    // ... other agents
  }
  
  return responses[agentId][Math.floor(Math.random() * responses[agentId].length)]
}

// Chat UI Component
function AgentChatPanel({ session, onSendMessage, onClose }: {
  session: ChatSession
  onSendMessage: (message: string) => void
  onClose: () => void
}) {
  // Cyberpunk chat interface
  // Agent avatar on left side
  // Message bubbles with agent colors
  // Input field at bottom
  // Quick action buttons (Ask about market, Request proposal, etc.)
}
```

### Interactive Council Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   INTERACTIVE COUNCIL FLOW                       │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │ Enter Council    │
    │ Chamber          │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ View All Agents  │  ← Agents idle, interact with each other
    │ At Round Table   │    (looking, nodding, gesturing)
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Hover Over Agent │  ← Agent highlights with white glow
    │                  │    Name tag appears above head
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Click Agent      │  ← Selection ring appears (agent color)
    │                  │    Agent turns to face user
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Agent Intro      │  ← Introduction panel slides in
    │ Panel Appears    │    Agent speaks greeting
    └────────┬─────────┘
             │
       ┌─────┴─────┐
       │           │
       ▼           ▼
┌─────────────┐  ┌─────────────┐
│ Start Chat  │  │ Close Intro │
│ with Agent  │  │ (Deselect)  │
└──────┬──────┘  └─────────────┘
       │
       ▼
┌──────────────────┐
│ Conversation     │  ← Full chat interface
│ Interface Opens  │    Ask questions, get advice
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Request Proposal │  ← Agent can initiate council deliberation
│ or Get Advice    │    on user's behalf
└──────────────────┘
```

### Visual Enhancement Details

```typescript
// Enhanced agent 3D model
const AGENT_MODEL_CONFIG = {
  // Different body shapes per agent
  bodies: {
    angular: { segments: 6, taperTop: 0.8, taperBottom: 1.2 },
    blocky: { segments: 4, taperTop: 1.0, taperBottom: 1.0 },
    ethereal: { segments: 16, taperTop: 0.6, taperBottom: 0.4 },
    spiky: { segments: 8, spikes: true, spikeLength: 0.2 },
    geometric: { segments: 12, taperTop: 0.9, taperBottom: 0.9 },
  },
  
  // Floating elements per agent type
  floatingElements: {
    alphaHunter: ['chart_hologram', 'rising_arrow'],
    riskSentinel: ['shield_particles', 'warning_symbols'],
    macroOracle: ['crystal_ball', 'star_particles'],
    devilsAdvocate: ['question_marks', 'flame_particles'],
    councilClerk: ['document_hologram', 'checkmark_particles'],
  },
  
  // Eye styles
  eyes: {
    alphaHunter: 'scanner',     // Sweeping green line
    riskSentinel: 'alert',      // Blinking orange dots
    macroOracle: 'cosmic',      // Swirling purple pattern
    devilsAdvocate: 'sharp',    // Red triangular eyes
    councilClerk: 'gentle',     // Soft cyan circles
  },
}
```

---

## 🎬 Animation & Visual Effects

### Particle Systems

```typescript
const PARTICLE_EFFECTS = {
  // Agent deployment in city
  deployment: {
    count: 100,
    colors: ['#00F0FF', '#FCEE0A'],
    shape: 'spiral_up',
    duration: 1500,
  },
  
  // Coin collection
  coinCollect: {
    count: 20,
    color: 'coin_color',
    shape: 'burst',
    duration: 500,
  },
  
  // Agent selection
  agentSelect: {
    count: 30,
    color: 'agent_color',
    shape: 'ring_expand',
    duration: 600,
  },
  
  // Street lamp glow
  lampGlow: {
    count: 5,
    color: 'lamp_color',
    shape: 'float_up',
    continuous: true,
  },
}
```

### Sound Effects (Planned)

```typescript
const SOUND_EFFECTS = {
  coinCollect: 'coin_ding.wav',
  agentDeploy: 'whoosh_appear.wav',
  agentSelect: 'ui_select.wav',
  agentSpeak: 'voice_blip.wav',
  councilEnter: 'door_open.wav',
  proposalApprove: 'success_chime.wav',
  proposalReject: 'error_buzz.wav',
  footsteps: 'footstep_loop.wav',
}
```

---

*Last Updated: February 2026*
*Version: 2.1.0*
