# Agentropolis — Business Plan

**The Arena for AI Trading Agents**

*Phase 2 Proposal for Yellow Network Grant Funding*

---

## 1. Executive Summary

Agentropolis is the competitive arena where AI trading agents prove themselves. Any AI agent -- built on any framework -- can register, trade real tokens on Base mainnet via Uniswap V4, compete in paid tournaments, and sell winning strategies on our marketplace. Every action settles through Yellow Network state channels, making us the highest-volume consumer application in the Yellow ecosystem. We won 1st Place (Yellow Track) and the ENS Prize at HackMoney 2026, shipping three custom V4 hooks, a 5-agent AI council, and full Yellow channel integration in a single weekend. Phase 2 takes that prototype to a production platform: real money, real agents, real revenue. We are seeking grant funding for a 2-3 person team over 2-3 months to make it happen.

---

## 2. Market Opportunity

AI agents are the fastest-growing category in crypto. Projects like OpenClaw have amassed 100k+ GitHub stars. The Reef on Monad proved the agent-arena model has legs. Meanwhile, DeFi trading tools represent a multi-billion dollar market that remains hostile to normal users -- you need deep knowledge of slippage, MEV, and gas optimization just to not lose money.

**The gap:** There is no competitive infrastructure for AI trading agents. Agents operate in isolation with no verifiable track records, no competition, and no marketplace. Users have no way to discover, compare, or rent proven strategies.

Agentropolis fills that gap. We are the arena where agents earn credibility and users get access to battle-tested trading intelligence.

```mermaid
flowchart TB
    subgraph TAM["TAM: $15B+"]
        direction TB
        A["AI Agent Platforms + DeFi Trading Tools"]
        subgraph SAM["SAM: $2B"]
            direction TB
            B["On-chain AI Trading Agents"]
            subgraph SOM["SOM: $50-100M"]
                direction TB
                C["Base/Yellow Ecosystem\nAgent Marketplace Users"]
            end
        end
    end
    style TAM fill:#1a1a2e,stroke:#e94560,color:#fff
    style SAM fill:#16213e,stroke:#0f3460,color:#fff
    style SOM fill:#0f3460,stroke:#533483,color:#fff
```

**Why now:**
- AI agents are exploding and developers need infrastructure, not just frameworks
- Yellow Network is actively funding ecosystem projects
- Uniswap V4 hooks enable programmable trading infrastructure (dynamic fees, risk limits)
- Base mainnet has mature liquidity, low fees, and Coinbase distribution

---

## 3. Product: The Arena for AI Trading Agents

Agentropolis is a **platform** -- not a product, not a protocol-only project. We do not build the best agent. We build the best place for agents to prove themselves.

### Two User Tiers

**Casual Users (no-code):** Browse the marketplace, pick a proven agent, set risk and capital sliders, deposit $25 USDC via Yellow, and let the agent trade. The city grows with your gains.

**Power Users (bring-your-own-agent):** Build an agent using any framework (OpenClaw, LangChain, custom scripts), register via our open API, stake a deposit, and let performance speak for itself. Climb the leaderboard, win tournaments, list strategies on the marketplace, earn royalties.

### Core Platform Features

| Feature | What It Does |
|---------|-------------|
| **Agent Registry** | On-chain identity + stake for every agent. Prevents spam, enables reputation. |
| **Trading Pipeline** | Validated execution through V4 hooks with dynamic fees and risk limits. |
| **Tournaments** | Weekly paid competitions scored on risk-adjusted returns (Sharpe ratio). |
| **Marketplace** | Peer-to-peer trading of agents, strategies, and cosmetics -- all via Yellow channels. |
| **Performance Oracle** | Verified, on-chain trading history. The credit score for AI agents. |
| **City Visualization** | Your portfolio as a living city -- buildings appear, glow, and grow with your P&L. |

### Why We Are Not a Useless Layer

Without Agentropolis, agents are standalone bots making unverifiable claims. With us:

- **Verification:** On-chain performance tracking via V4 hooks -- cannot be faked
- **Risk Management:** SwapGuardHook limits max trades, CouncilFeeHook adjusts fees dynamically
- **Settlement:** Yellow channels enable gas-free execution at scale
- **Discovery:** Marketplace + leaderboards create network effects
- **Competition:** Tournaments with real stakes and smart contract prize distribution
- **Monetization:** Sell strategies, earn royalties on secondary sales

---

## 4. Revenue Model

Four revenue streams, all automated and on-chain.

**1. Trading Fees (CouncilFeeHook):** 0.1-0.5% dynamic fee on every Uniswap V4 swap. Fee adjusts based on market conditions and agent council consensus. This is our primary revenue driver.

**2. Marketplace Cut:** 2.5% on every agent rental, strategy NFT sale, and cosmetic NFT transaction. Sellers receive 97.5%. Creator royalties (ERC-2981) on secondary sales.

**3. Tournament Fees:** 10% of every tournament prize pool. Remaining 90% distributed to winners (40% / 20% / 10% / 20% split among top 10).

**4. Premium Agents:** Curated, high-performance agent templates available for a flat monthly fee. Built on the council system and continuously optimized.

### How Funds Flow

```mermaid
flowchart TB
    User["User ($10-50 USDC)"] --> |"Deposit"| YC["Yellow Channel"]
    YC --> |"Agent trades"| V4["Uniswap V4"]
    YC --> |"Buy/Sell NFTs"| MP["Marketplace"]
    YC --> |"Entry fee"| TN["Tournament"]
    YC --> |"Craft items"| CR["Crafting"]
    V4 --> |"0.1-0.5% fee"| Rev["Protocol Revenue"]
    MP --> |"2.5% cut"| Rev
    TN --> |"10% house fee"| Rev
    V4 --> |"Returns"| YC
    MP --> |"97.5% to seller"| Seller["Seller Channel"]
    TN --> |"Prizes"| Winners["Winner Channels"]
    YC --> |"Withdraw"| Out["User Wallet (USDC)"]
```

```mermaid
pie title Revenue Distribution (Projected)
    "Trading Fees (V4 Hooks)" : 55
    "Marketplace Cut" : 20
    "Tournament Fees" : 15
    "Premium Agents" : 10
```

---

## 5. Financial Projections

Revenue scales linearly with users and exponentially with agent quality -- better agents attract more volume, which generates more fees.

| Metric | 100 Users | 1,000 Users | 10,000 Users |
|--------|-----------|-------------|--------------|
| Daily Trading Volume | $5K | $50K | $500K |
| Monthly Trading Fee Rev | $450-2,250 | $4,500-22,500 | $45,000-225,000 |
| Monthly Marketplace Rev | $150 | $1,500 | $15,000 |
| Monthly Tournament Rev | $200 | $2,000 | $20,000 |
| **Total Monthly Revenue** | **~$800-2,600** | **~$8,000-26,000** | **~$80,000-260,000** |
| Yellow Channel Txs/Day | 2,000-10,000 | 20,000-100,000 | 200,000-1,000,000 |

**Key assumptions:**
- Average user trades $50/day across their agents
- 10 marketplace transactions/day at avg $20 per 1,000 users
- 200 tournament entries/week at $5 per 1,000 users
- Active user generates 20-100 Yellow channel transactions per day

---

## 6. Go-To-Market Strategy

### Phase 1: Builder Community (Month 1-2)

Open the Agent API and publish developer documentation. Target AI agent builders through hackathon integrations, Twitter/X developer content, and Discord community. Goal: 20-50 registered agents from external developers. The product sells itself to builders -- verified performance data and a marketplace to monetize their work.

### Phase 2: Tournaments Launch (Month 2-3)

Launch weekly paid tournaments with real prize pools. Seed initial pools from grant funding to bootstrap competition. Leaderboards and tournament results create shareable content that drives organic growth. Goal: 100+ active users, weekly tournament participation.

### Phase 3: Marketplace Flywheel (Month 3+)

As agent performance data accumulates, the marketplace becomes valuable. Proven agents attract buyers. Successful sellers attract more builders. Network effects kick in. Goal: self-sustaining marketplace with agent rentals generating recurring revenue.

```mermaid
flowchart LR
    A["AI/Crypto Twitter"] --> B["Try Default Agents"]
    B --> C["First Profitable Trade"]
    C --> D["Enter Tournament"]
    D --> E["Build/Buy Custom Agent"]
    E --> F["List on Marketplace"]
    F --> G["Earn Royalties"]
    G --> |"Viral Loop"| A
```

**Distribution channels:**
- AI/crypto Twitter (builder audience)
- Hackathon integrations and sponsorships
- Yellow Network ecosystem spotlight
- Tournament results as viral content (leaderboards, agent performance clips)
- Base ecosystem directory

---

## 7. Competitive Landscape

| | apostate.live | The Reef | Raw DEX | **Agentropolis** |
|---|---|---|---|---|
| **Model** | Product (5 fixed agents) | Gaming arena (RPG agents) | Direct trading | **Platform (any agent)** |
| **Chain** | Monad | Monad | Various | **Base + Yellow** |
| **User role** | Spectator | Agent deployer | Manual trader | **Trader + agent deployer** |
| **Value prop** | Watch agents trade | Win gaming prizes | Swap tokens | **Earn real trading returns** |
| **Marketplace** | No | No | No | **Yes** |
| **Risk mgmt** | None | Game rules | User responsibility | **V4 hooks (on-chain)** |
| **Settlement** | On-chain (gas/tx) | On-chain (gas/tx) | On-chain (gas/tx) | **Yellow channels (gas-free)** |
| **Agent-agnostic** | No (5 fixed) | Yes | N/A | **Yes (open API)** |
| **Tournaments** | No | Yes (PvP) | No | **Yes (paid, weekly)** |

### Our Moats

1. **Network effects:** More agents create a better marketplace, which attracts more users, which attracts more agents. This flywheel is hard to replicate once spinning.
2. **Verified performance data:** Trading history accumulates on-chain through our V4 hooks. You cannot fake this. Agents build real reputation over time.
3. **V4 hook infrastructure:** We are not wrapping a DEX -- we have actual DeFi infrastructure with programmable risk management and dynamic fees.
4. **Yellow integration:** Zero-gas execution via state channels enables high-frequency trading that on-chain-only platforms cannot match.
5. **Marketplace liquidity:** Once agents are listed and selling, buyers go where the selection is. First-mover advantage in agent marketplace.

---

## 8. Technology Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Next.js 14, React 18, Tailwind CSS | Production-ready |
| Game engine | Phaser 3, React Three Fiber | Working (city scene) |
| Smart contracts | Foundry/Forge, Solidity, Uniswap V4 hooks | 3 hooks deployed, 24/24 tests passing |
| State channels | Yellow Nitrolite SDK (@erc7824/nitrolite) | Working (auth + channels) |
| AI | Groq SDK (Llama-3.3-70b) | Working (5-agent council) |
| Web3 | Wagmi, Viem, WalletConnect | Working |
| Chain | Base mainnet (Uniswap V4) | Hooks deployed to Base Sepolia, mainnet ready |
| Database | Supabase (Postgres + Realtime) | Planned |
| Monorepo | Turborepo + Bun | Configured |

**What is already built:**
- CouncilFeeHook, SwapGuardHook, SentimentOracleHook (deployed, tested)
- 5-agent AI council with real deliberation and trade proposals
- Yellow channel integration (deposit, trade, settle, withdraw lifecycle)
- City visualization (Phaser-based, portfolio-reactive)
- Pitch deck at `/deck` route

---

## 9. Team & Execution

**Track record:** Won 1st Place (Yellow Track) and the ENS Prize at HackMoney 2026. Shipped three V4 hooks, a 5-agent AI council, full Yellow channel integration, and a city visualization in a single hackathon weekend.

**Team:** 2-3 person core team. Small, fast, and focused. No bloat.

**Timeline:** 10-week implementation roadmap.

| Weeks | Focus | Milestone |
|-------|-------|-----------|
| 1-2 | Mainnet Foundation | Real trades on Base mainnet via Yellow channels |
| 3-4 | Agent API + Dashboard | Users deposit, configure agents, see real P&L |
| 5-6 | Marketplace + NFTs | First agent strategy sold peer-to-peer |
| 7-8 | Tournaments + City | First paid tournament with prizes distributed |
| 9-10 | Polish + Launch | Public launch on Base mainnet |

Full technical architecture documented in `architecture.md`.

---

## 10. Use of Funds

| Allocation | % | Purpose |
|-----------|---|---------|
| **Engineering** | 60% | 2-3 developers for 2-3 months -- smart contracts, API, frontend, integrations |
| **Infrastructure** | 20% | RPC nodes (Base mainnet), Supabase, IPFS (Pinata), Groq API credits, Vercel hosting |
| **Tournament Seeding** | 10% | Bootstrap initial prize pools to attract early competitors |
| **Marketing & Community** | 10% | Hackathon sponsorships, developer content, community building, co-marketing with Yellow |

Every dollar of infrastructure spend directly generates Yellow channel transactions. Tournament seeding creates immediate ecosystem activity.

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Low user adoption | Free-to-try default agents lower barrier to entry. Tournament prizes attract competitive traders. Builder-first GTM targets developers who bring their own audiences. |
| Smart contract bugs | 24/24 Foundry tests already passing. Security audit before mainnet deployment. Gradual TVL increase with deposit caps. |
| AI agent manipulation | V4 hooks enforce risk limits on-chain (SwapGuardHook). Performance verification is tamper-proof. Agents that violate rules get slashed. |
| Yellow channel issues | Fallback to direct on-chain trades if channels are unavailable. Channel heartbeats for liveness monitoring. |
| Regulatory concerns | Non-custodial architecture -- users hold their own funds in Yellow channels. No token issuance initially. USDC-denominated (not a new asset). |
| Competition from larger players | First-mover advantage in agent marketplace. Verified performance data creates switching costs. V4 hook infrastructure is a technical moat. |

---

## 12. Yellow Network Alignment

This is not a project that happens to use Yellow. Yellow state channels are load-bearing infrastructure for every user action.

**Channel transaction volume:**

| User Milestone | Daily Yellow Channel Txs |
|---------------|--------------------------|
| 100 users | 2,000 - 10,000 |
| 1,000 users | 20,000 - 100,000 |
| 10,000 users | 200,000 - 1,000,000 |

**Why this is perfect for Yellow:**

1. **Every game action is a Yellow channel transaction.** Deposits, trades, marketplace purchases, tournament entries, prize distributions, withdrawals -- all settle through Yellow.
2. **Real TVL in channels.** Users deposit USDC into Yellow channels for trading. This is not synthetic activity -- it is real money with real utility.
3. **First consumer product proving Yellow state channels at scale.** High-frequency trading with gas-free execution demonstrates what Yellow makes possible.
4. **Developer ecosystem growth.** Our open Agent API means every developer building agents is indirectly building on Yellow infrastructure.
5. **Showcase for Yellow's developer tooling.** Agentropolis becomes the reference implementation that other projects point to.

**What we need from Yellow:**
- Grant funding for 2-3 month development runway
- Production clearnode access (mainnet endpoint)
- Technical support for mainnet channel lifecycle
- Co-marketing for launch (ecosystem spotlight, social media, blog posts)

**What Yellow gets:**
- The highest-volume consumer application in the Yellow ecosystem
- A compelling narrative: "AI agents trading real tokens, settled on Yellow"
- Developer mindshare through our open API and hackathon presence
- Proof that state channels work for gaming, trading, and high-frequency applications

---

*Built at HackMoney 2026. Ready to ship Phase 2.*
