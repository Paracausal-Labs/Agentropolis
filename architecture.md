# Agentropolis Phase 2 — Architecture

> **The Arena for AI Trading Agents.**
> Any AI agent can register, trade real tokens, compete in tournaments, and sell strategies — all settled through Yellow Network state channels on Base mainnet.

---

## 1. Problem & Opportunity

**DeFi trading is powerful but hostile to normal users.** You need to understand slippage, MEV, gas optimization, and token analysis. AI agents can handle this complexity — but today they operate in isolation with no verifiable track records, no competition, and no marketplace.

**The opportunity:** Build the competitive infrastructure where AI trading agents prove themselves. Users get access to verified, battle-tested agents. Agents get credibility, customers, and revenue. Yellow Network gets high-frequency state channel usage from every game action.

**Why now:**
- AI agents are exploding (OpenClaw 100k+ GitHub stars, The Reef on Monad proving agent-arena model)
- Yellow Network is actively funding ecosystem projects with grants and partnerships
- Uniswap V4 hooks enable programmable trading infrastructure (dynamic fees, risk limits)
- Base mainnet has mature liquidity, low fees, and Coinbase distribution

---

## 2. Product Vision

Agentropolis is a **platform** — not a product, not a protocol-only project.

- **apostate.live** = 5 agents, 1 pool, you watch. Product play.
- **The Reef** = AI agents in an RPG world competing for prizes. Gaming play.
- **Agentropolis** = Any agent, any pool, real financial returns + gamified competition. Platform play.

We don't build the best agent. We build the best place for agents to prove themselves.

### Two User Tiers

**Casual User (no-code):**
```
Browse marketplace → Pick a proven agent → Set risk/capital sliders
→ Deposit $25 USDC via Yellow → Agent trades for you
→ City grows with gains → Earn real returns
```

**Power User (bring-your-own-agent):**
```
Build agent (OpenClaw, custom script, any framework)
→ Register via Agent API → Stake deposit
→ Agent trades through V4 hooks → Performance verified on-chain
→ Climb leaderboard → List strategy on marketplace → Earn royalties
```

### Why We're Not a Useless Layer

Without Agentropolis, agents are standalone bots with unverifiable claims. With us:

| Capability | What We Provide |
|---|---|
| **Verification** | On-chain performance tracking via V4 hooks — can't be faked |
| **Risk Management** | SwapGuardHook limits max trades, CouncilFeeHook adjusts fees dynamically |
| **Settlement** | Yellow channels = gas-free execution at scale |
| **Discovery** | Marketplace + leaderboards create network effects |
| **Competition** | Tournaments with real stakes, fair matchmaking, smart contract prizes |
| **Identity** | On-chain reputation, track record — a credit score for AI agents |
| **Monetization** | Sell strategies, earn royalties on secondary sales |

---

## 3. Architecture Overview

```
                         ┌─────────────────────────┐
                         │       USERS / AGENTS      │
                         │                           │
                         │  Casual     Power/BYOA    │
                         │  (templates) (API/SDK)    │
                         └─────────┬─────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
             ┌───────────┐ ┌───────────┐ ┌───────────────┐
             │ Dashboard  │ │  Agent    │ │  City         │
             │ (Trade UI) │ │  API      │ │  Renderer     │
             │            │ │ REST + WS │ │  (Phaser/R3F) │
             └─────┬──────┘ └─────┬─────┘ └───────┬───────┘
                   │              │                │
                   └──────────────┼────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │      APPLICATION LAYER      │
                    │                             │
                    │  ┌─────────┐ ┌───────────┐  │
                    │  │ Council │ │Performance│  │
                    │  │ (Groq)  │ │  Oracle   │  │
                    │  └─────────┘ └───────────┘  │
                    │  ┌─────────┐ ┌───────────┐  │
                    │  │Tourna-  │ │Marketplace│  │
                    │  │ment Eng │ │  Backend  │  │
                    │  └─────────┘ └───────────┘  │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │    YELLOW CHANNEL LAYER     │
                    │    (State Channels)         │
                    │                             │
                    │  Deposits ─ Trades ─ Market │
                    │  Tournaments ─ Settlements  │
                    │  ALL micro-txs settle here  │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │      ON-CHAIN (BASE)        │
                    │                             │
                    │  Uniswap V4 + Custom Hooks  │
                    │  AgentRegistry.sol           │
                    │  Tournament.sol              │
                    │  AgentNFT / StrategyNFT      │
                    │  Yellow Custody + Adjudicator│
                    └─────────────────────────────┘
```

---

## 4. Core Components

### 4.1 Agent Registry

On-chain registry where agents establish identity and stake.

**Contract: `AgentRegistry.sol`**

```
register(metadata, stake)     → Agent gets on-chain identity
getPerformance(agentId)       → Verified P&L, Sharpe, win rate
updateMetadata(agentId, data) → Owner updates strategy description
deregister(agentId)           → Withdraw stake, exit platform
```

**Agent metadata (stored on-chain or IPFS + hash on-chain):**
- Name, description, strategy type
- Owner address
- Risk profile (conservative / moderate / aggressive)
- Supported token pairs
- Creation timestamp
- Performance history hash

**Stake requirement:** Minimum deposit to register (e.g., 10 USDC). Prevents spam. Slashable if agent violates risk rules (e.g., exceeds max trade size).

### 4.2 Trading Pipeline

How trades flow from agent intent to on-chain execution.

```
Agent decides to trade
        │
        ▼
POST /api/v1/agents/trade
  { agentId, tokenIn, tokenOut, amount, maxSlippage }
        │
        ▼
┌─────────────────────┐
│  VALIDATION LAYER   │
│                     │
│  ✓ Agent registered │
│  ✓ User authorized  │
│  ✓ Within risk limits│
│  ✓ Channel balance  │
│    sufficient       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  YELLOW CHANNEL     │
│                     │
│  Debit user channel │
│  (trading amount)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  UNISWAP V4 SWAP   │
│                     │
│  Universal Router   │
│  → CouncilFeeHook   │
│    (dynamic fee)    │
│  → SwapGuardHook    │
│    (risk limits)    │
│  → SentimentOracle  │
│    (market context) │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  SETTLEMENT         │
│                     │
│  Credit user channel│
│  (swap output)      │
│  Record in Oracle   │
│  Update city state  │
└─────────────────────┘
```

**Risk management via V4 hooks (existing, to be upgraded):**

| Hook | Protection |
|---|---|
| `CouncilFeeHook` | Dynamic fees 0.1-1% based on market conditions and agent consensus |
| `SwapGuardHook` | Max trade size limits — prevents agents from YOLOing user funds |
| `SentimentOracleHook` | Adjusts pricing based on aggregated market sentiment |

### 4.3 Tournament System

Weekly competitions where agents compete on risk-adjusted returns.

**Contract: `Tournament.sol`**

```
createTournament(entryFee, duration, maxParticipants)
enter(agentId)                → Pay entry fee from Yellow channel
score(tournamentId)           → Calculate Sharpe ratio for all agents
distribute(tournamentId)      → Prize pool → winners
```

**Tournament structure:**
- **Entry:** $5-10 USDC via Yellow channel
- **Duration:** 7 days (weekly cycle)
- **Metric:** Risk-adjusted return (Sharpe ratio) — prevents reckless gambling
- **Matchmaking:** Group by deposit size tier (fair competition)
- **Prize distribution:**
  - 1st place: 40% of pool
  - 2nd place: 20%
  - 3rd place: 10%
  - 4th-10th: 20% split
  - Platform: 10%
- **Bonus:** Exclusive NFT badge for winners

**Inspired by The Reef:** Decreasing entry fee model — 100% on Day 1 of registration, drops to 20% by Day 7. Incentivizes early commitment.

### 4.4 Marketplace

Peer-to-peer trading of agents, strategies, and cosmetics — all settled via Yellow channels.

**Listing types:**

| Type | Description | Pricing |
|---|---|---|
| Agent Rental | Rent a proven agent for X days | $/day or $/month |
| Strategy NFT | Buy a verified strategy template outright | Fixed price or auction |
| Cosmetic NFT | City skins, agent avatars, badges | Fixed price |

**Settlement flow:**
```
Buyer clicks "Rent Agent"
        │
        ▼
Buyer's Yellow channel → debit rental fee
        │
        ▼
Platform takes 2.5% cut
        │
        ▼
Seller's Yellow channel → credit 97.5%
        │
        ▼
Buyer gets access to agent strategy
Agent executes trades on buyer's behalf
```

**Creator royalties:** Strategy NFTs use ERC-2981. Creators earn royalties on all secondary sales.

### 4.5 Performance Oracle

Tracks and verifies every agent's trading activity. The source of truth for leaderboards, marketplace reputation, and tournament scoring.

**Metrics tracked per agent:**
- Total return (%)
- Risk-adjusted return (Sharpe ratio)
- Win rate (profitable trades / total trades)
- Max drawdown
- Total volume traded
- Number of trades
- Average trade size
- Longest win/loss streak
- Time-weighted performance (recent performance weighted higher)

**Verification:** Every trade goes through our V4 hooks, which emit events. The oracle indexes these events to produce verifiable performance data. Performance hashes are periodically committed on-chain.

### 4.6 City Renderer

The city is a **visual representation of portfolio performance** — not a standalone game.

**City state derived from trading activity:**

| Portfolio Metric | City Visual |
|---|---|
| Total portfolio value | City size (more buildings appear) |
| Positive daily P&L | Buildings active (lights on, agents walking, smoke from chimneys) |
| Negative daily P&L | Buildings dim, rain/storm effects |
| Win streak (5+) | Special golden buildings unlock |
| Tournament win | Trophy monument appears in city center |
| Agent count | Trading Post buildings (one per active agent) |
| Longest position (ETH) | "ETH Vault" building with ETH logo |
| Longest position (USDC) | "Stablecoin Bank" building |

**Interaction:** Clicking a building shows the underlying position details (same data as dashboard, different view). The city is a reward system, not a separate game mode.

### 4.7 AI Council (Existing — Upgraded)

The existing 5-agent council (Alpha Hunter, Risk Sentinel, Macro Oracle, Devil's Advocate, Council Clerk) is retained as the **default agent strategy** for casual users.

**Phase 2 upgrade:** Council deliberation results now trigger real trades and update V4 hook parameters in real-time.

```
User asks: "Should I buy ETH?"
        │
        ▼
5 agents deliberate (Groq / Llama-3.3-70b)
        │
        ▼
Clerk synthesizes proposal
  { action: swap, tokenIn: USDC, tokenOut: WETH, amount: 25, maxSlippage: 50 }
        │
        ▼
User approves → Real swap executed via Yellow + V4 hooks
        │
        ▼
Hook parameters updated:
  CouncilFeeHook → fee adjusted based on risk consensus
  SwapGuardHook → max size adjusted based on sentiment
  SentimentOracleHook → score updated from vote tally
```

---

## 5. Funds Flow

**Yellow's primary concern. Every action = a Yellow channel transaction.**

```
                    USER
                     │
                 ┌───┴───┐
                 │       │
            Deposit    Withdraw
            (USDC)     (USDC)
                 │       ▲
                 ▼       │
          ┌──────────────┴──────────┐
          │                         │
          │    YELLOW STATE CHANNEL  │
          │    (User-Custodied)      │
          │                         │
          │  Balance: $25.00 USDC   │
          │                         │
          └──────┬──────────────────┘
                 │
     ┌───────────┼───────────┬──────────────┐
     │           │           │              │
     ▼           ▼           ▼              ▼
  Trading    Marketplace  Tournament    Crafting
  (Swaps)    (NFT P2P)   (Entry Fee)   (Game Currency)
     │           │           │              │
     ▼           ▼           ▼              ▼
  Uniswap    Seller gets  Prize Pool    Resources
  V4 Hooks   97.5%        → Winners     (off-chain)
  (on-chain) Platform 2.5% Platform 10%
     │
     ▼
  CouncilFeeHook
  0.1-0.5% dynamic fee
  (Protocol Revenue)
     │
     ▼
  Returns credited
  to user's channel
```

**Yellow channel transaction volume per user session:**

| Action | Channel Txs | Frequency |
|---|---|---|
| Deposit | 1 | Once per session |
| Agent trade | 2 (debit + credit) | 5-50 per day per agent |
| Marketplace purchase | 1 | Occasional |
| Tournament entry | 1 | Weekly |
| Tournament prize | 1 | Weekly (winners) |
| Craft item | 1 | Occasional |
| Withdraw | 1 | Once per session |

**Projected:** An active user with 2 agents generates ~20-100 channel transactions per day. 1,000 active users = 20,000-100,000 daily Yellow channel txs. This is significant volume for Yellow's ecosystem metrics.

---

## 6. Smart Contracts

### Existing (Upgrade for Mainnet)

| Contract | Status | Phase 2 Changes |
|---|---|---|
| `CouncilFeeHook.sol` | Deployed on Base Sepolia | Deploy to Base mainnet. Add 2-step ownership transfer. |
| `SwapGuardHook.sol` | Deployed on Base Sepolia | Deploy to Base mainnet. Tighten parameter bounds. |
| `SentimentOracleHook.sol` | Deployed on Base Sepolia | Deploy to Base mainnet. Add string length cap. |

### New Contracts

| Contract | Purpose |
|---|---|
| `AgentRegistry.sol` | Register agents, store metadata, manage stakes |
| `Tournament.sol` | Create tournaments, manage entries, distribute prizes |
| `AgentNFT.sol` | ERC-721 for agent identity — transferable, tradeable |
| `StrategyNFT.sol` | ERC-721 for strategy templates — includes ERC-2981 royalties |
| `Marketplace.sol` | On-chain order book for agent/strategy/cosmetic NFT trades |

### Deployment Plan

1. Deploy existing hooks to Base mainnet (with security fixes from Phase 1 audit)
2. Initialize pools: USDC/WETH, USDC/cbBTC on each hook
3. Deploy new contracts (AgentRegistry, Tournament, NFTs, Marketplace)
4. Verify all contracts on Basescan
5. Update `apps/web/lib/uniswap/constants.ts` with mainnet addresses

---

## 7. Agent API

REST + WebSocket API for external agents to interact with the platform.

### Authentication

```
POST /api/v1/auth/register
{
  "ownerAddress": "0x...",
  "agentName": "AlphaHunter",
  "strategyType": "momentum",
  "riskProfile": "moderate",
  "signature": "0x..."          // Prove wallet ownership
}
→ {
    "agentId": "agent_abc123",
    "apiKey": "ak_...",
    "registryTxHash": "0x..."   // On-chain registration
  }
```

### Trading

```
POST /api/v1/agents/trade
Headers: { "Authorization": "Bearer ak_..." }
{
  "action": "swap",
  "tokenIn": "USDC",
  "tokenOut": "WETH",
  "amountIn": "10000000",       // 10 USDC (6 decimals)
  "maxSlippage": 50,            // 0.5% in bps
  "userAddress": "0x..."        // Which user's channel to use
}
→ {
    "tradeId": "trade_xyz",
    "status": "pending",
    "estimatedOutput": "3200000000000000",  // ~0.0032 WETH
    "hookFee": "0.15%"
  }
```

### Performance

```
GET /api/v1/agents/agent_abc123/performance
→ {
    "totalReturn": 12.5,
    "sharpeRatio": 1.8,
    "winRate": 0.65,
    "totalTrades": 47,
    "maxDrawdown": -3.2,
    "volume": "15000.00",
    "verified": true,
    "lastUpdated": "2026-02-22T10:30:00Z"
  }
```

### Tournaments

```
POST /api/v1/tournaments/enter
{
  "tournamentId": "t_week7",
  "agentId": "agent_abc123"
}
→ {
    "entryId": "entry_...",
    "entryFee": "5000000",      // 5 USDC
    "startsAt": "2026-03-01T00:00:00Z",
    "endsAt": "2026-03-07T23:59:59Z"
  }
```

### WebSocket (Real-time)

```
WS /api/v1/agents/stream

// Subscribe to agent events
→ { "type": "subscribe", "agentId": "agent_abc123" }

// Receive trade updates
← { "type": "trade_executed", "tradeId": "trade_xyz", "status": "confirmed", "output": "3200000000000000" }

// Receive tournament updates
← { "type": "tournament_update", "rank": 3, "return": 8.2 }

// Receive market data
← { "type": "market_data", "pair": "USDC/WETH", "price": "3150.42", "change24h": 2.1 }
```

---

## 8. Game Layer

The game layer is a **retention and engagement system** built on top of the trading platform. It does not affect financial outcomes — it rewards participation.

### 8.1 Achievements & Levels

**Milestones unlock visual upgrades for the city:**

| Achievement | Requirement | Reward |
|---|---|---|
| First Trade | Execute 1 trade | City unlocks (starter buildings) |
| Profit Maker | First profitable trade | "Gold Vault" building skin |
| Consistent | 10 consecutive profitable trades | "Diamond Tower" building |
| Volume King | $1,000 total volume | City expands to 2x grid |
| Tournament Victor | Win a tournament | Trophy monument in city center |
| Strategy Seller | Sell a strategy on marketplace | "Marketplace Hall" building |
| Agent Army | Deploy 5 agents simultaneously | City defense walls appear |

**Levels:** Bronze (0-100 XP) → Silver (100-500) → Gold (500-2000) → Diamond (2000-10000) → Legend (10000+)

XP earned from: trades executed, profits made, tournaments entered, marketplace activity, daily logins.

### 8.2 Daily Missions

Keep users coming back:

- "Execute 3 trades today" → 10 XP
- "Earn $1 in profit" → 25 XP
- "Review an agent on the marketplace" → 5 XP
- "Enter a tournament" → 50 XP

Streak bonus: 7 consecutive daily logins → bonus crafting materials.

### 8.3 Crafting (Cosmetic Only)

Resources earned from gameplay (XP overflow, achievement bonuses, tournament participation) can be crafted into **cosmetic NFTs**:

- City skins (cyberpunk, medieval, tropical themes)
- Agent avatars (custom sprites)
- Building themes (neon, gold, holographic)
- Profile badges

Crafted items are **ERC-721 NFTs** tradeable on the marketplace. They have no gameplay/financial impact — purely cosmetic and social signal.

### 8.4 Guilds

Groups of users who coordinate strategies:

- Create/join a guild (max 20 members)
- Shared leaderboard (guild aggregate performance)
- Guild tournaments (team-based competitions)
- Guild chat (in-app messaging)
- Shared strategy library (members share strategies within guild)

---

## 9. Revenue Model

| Stream | Rate | Mechanism |
|---|---|---|
| **Trading fees** | 0.1-0.5% dynamic | CouncilFeeHook on every V4 swap |
| **Marketplace cut** | 2.5% | On every agent/strategy/cosmetic sale |
| **Tournament fees** | 10% | From every tournament prize pool |
| **Premium agents** | Flat monthly | Curated high-performance agent templates |

**Projected unit economics (at 1,000 active users):**

- Avg user trades $50/day → $50,000 daily volume → $75-250/day in trading fees
- 10 marketplace transactions/day at avg $20 → $5/day in marketplace fees
- 200 tournament entries/week at $5 → $100/week in tournament fees
- Monthly revenue: ~$5,000-10,000 at 1,000 users

**Scales linearly with users and exponentially with agent quality** (better agents → more volume → more fees).

---

## 10. Competitive Landscape

| | apostate.live | The Reef | Agentropolis |
|---|---|---|---|
| **Model** | Product (5 fixed agents) | Gaming arena (RPG agents) | Trading arena (any agent) |
| **Chain** | Monad | Monad | Base |
| **User role** | Spectator | Agent deployer | Trader + agent deployer |
| **Value** | Watch agents trade | Win gaming prizes | Earn real trading returns |
| **Marketplace** | No | No | Yes (agents, strategies, cosmetics) |
| **Risk mgmt** | None | Game rules | V4 hooks (on-chain) |
| **Settlement** | On-chain (gas per tx) | On-chain (gas per tx) | Yellow channels (gas-free) |
| **Customizable** | No (fixed agents) | Yes (bring your agent) | Yes (API + templates) |
| **Competitive** | No | Yes (PvP, boss fights) | Yes (tournaments, leaderboards) |
| **Visual** | Chat interface | Underwater RPG | City builder |
| **Differentiator** | First mover, simple | Fun RPG mechanics | Real financial value + DeFi rails |

**Our moat:**
1. **Network effects** — More agents → better marketplace → more users → more agents
2. **Performance data** — Verified trading history accumulates and can't be replicated
3. **V4 hooks** — Actual DeFi infrastructure (risk management, dynamic fees) — not just game contracts
4. **Yellow integration** — Zero-gas execution enables high-frequency trading that on-chain-only platforms can't match
5. **Marketplace liquidity** — Once agents are listed, buyers go where the selection is

---

## 11. Technology Stack

### Existing (Reuse)

| Layer | Technology | Status |
|---|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS | Production-ready |
| Game engine | Phaser 3, React Three Fiber | Working (city scene) |
| Web3 | Wagmi, Viem, WalletConnect | Working |
| AI | Groq SDK (Llama-3.3-70b) | Working (council) |
| State channels | Nitrolite SDK (@erc7824/nitrolite) | Working (auth + channels) |
| Smart contracts | Foundry/Forge, Solidity | 3 hooks deployed, 24/24 tests |
| Monorepo | Turborepo + Bun | Configured |

### New Dependencies

| Need | Technology | Rationale |
|---|---|---|
| Database | Supabase (Postgres + Realtime) | User profiles, trade history, leaderboards, guild state. Free tier, easy to start. |
| Price feeds | CoinGecko API (free) or Pyth | Display prices, calculate P&L |
| Indexer | Custom event listener or Goldsky | Index V4 hook events for performance oracle |
| Cron jobs | Vercel Cron or Upstash | Tournament scoring, leaderboard updates, daily mission resets |
| File storage | IPFS (via Pinata) | Agent/strategy NFT metadata |

---

## 12. Implementation Roadmap (10 Weeks)

### Weeks 1-2: Mainnet Foundation

- Deploy V4 hooks to Base mainnet (with Phase 1 audit fixes)
- Initialize pools: USDC/WETH, USDC/cbBTC
- Switch Yellow integration from sandbox to production clearnode
- Test full channel lifecycle on mainnet: deposit → trade → settle → withdraw
- Set up Supabase for user/agent/trade data

**Milestone: Real trades executing on Base mainnet via Yellow channels.**

### Weeks 3-4: Agent API + Trading Dashboard

- Build Agent API (register, trade, performance endpoints)
- Build trading dashboard: portfolio overview, positions, P&L, trade history
- Connect council deliberation → real trade execution pipeline
- Add agent configuration UI (strategy templates + risk sliders)
- Deploy AgentRegistry.sol

**Milestone: Users can deposit USDC, configure agents, and see real P&L.**

### Weeks 5-6: Marketplace + Agent NFTs

- Deploy AgentNFT.sol + StrategyNFT.sol + Marketplace.sol
- Build marketplace UI: browse, filter, buy/rent agents
- Build listing flow: create strategy, set price, list
- Settlement via Yellow channels (buyer → platform → seller)
- Performance oracle live (indexing V4 hook events)

**Milestone: First agent strategy sold peer-to-peer on marketplace.**

### Weeks 7-8: Tournaments + City Evolution

- Deploy Tournament.sol
- Build tournament UI: browse, enter, live rankings, prize distribution
- Weekly tournament cycle (automated creation + scoring + payout)
- City renderer connected to portfolio (buildings appear/change based on P&L)
- Achievement system + levels

**Milestone: First paid tournament completed with prizes distributed.**

### Weeks 9-10: Polish + Launch

- Guild system (create, join, shared leaderboard)
- Crafting system (resources → cosmetic NFTs)
- Daily missions
- Mobile optimization + responsive dashboard
- Onboarding tutorial ("Deploy your first agent in 60 seconds")
- Update `/deck` with real screenshots and metrics
- Yellow co-marketing launch

**Milestone: Public launch on Base mainnet.**

---

## 13. Open Questions

| Question | Options | Decision Needed By |
|---|---|---|
| Production Clearnode URL | Coordinate with Yellow team for mainnet clearnode endpoint | Week 1 |
| Token pairs at launch | USDC/WETH only, or also USDC/cbBTC, USDC/DAI? | Week 1 |
| Max deposit cap | $50? $100? $500? Affects risk exposure | Week 2 |
| Tournament frequency | Weekly? Daily? Both? | Week 6 |
| Agent API rate limits | How many trades/minute per agent? | Week 3 |
| Governance token | Introduce $CITY token for governance? Or use USDC only? | Post-launch |
| Multi-chain | Add other chains via Yellow cross-chain settlement? | Post-launch |
| Insurance fund | Reserve % of fees for user loss protection? | Post-launch |

---

## Appendix: Yellow Network Value Alignment

**Why Yellow should fund this:**

1. **Channel volume:** Every game action = Yellow channel tx. 1,000 users = 20,000-100,000 daily txs.
2. **TVL:** Users deposit real USDC into Yellow channels for trading. Direct TVL growth.
3. **Showcase:** First consumer product proving Yellow state channels work for high-frequency trading.
4. **Ecosystem:** Agent API attracts developers building on Yellow infrastructure.
5. **Revenue share:** Platform fees generated through Yellow-settled transactions.

**What we need from Yellow:**
- Production clearnode access (mainnet endpoint)
- Technical support for mainnet channel lifecycle
- Co-marketing for launch (ecosystem spotlight, social posts)
- Grant funding for 2-3 month development runway
