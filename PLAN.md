# Agentropolis - Development Plan

**Project**: Gamified DeFi Trading Platform (City-Builder)  
**Hackathon**: HackMoney 2026 (ETHGlobal)  
**Deadline**: Feb 8, 2026 - 10:30 PM IST  
**Team**: 3 developers

---

## What We're Building

A city-builder game where users deploy AI agents that propose DeFi trades. Users review proposals in a "Council Room" and approve/reject. Approved trades execute on Uniswap v4.

**Target Sponsor Tracks**:
| Sponsor | Prize | Our Integration |
|---------|-------|-----------------|
| Yellow Network | $15k | Session-based off-chain micro-actions (deploy fees, cosmetics) |
| Uniswap Foundation | $10k | Agent-proposed trades via Universal Router v4 |
| ENS | $5k | Display ENS names in city/council UI |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | Turborepo |
| Frontend | Next.js 14 (App Router) + React |
| Game Engine | Phaser 3 (isometric) |
| Styling | Tailwind CSS + shadcn/ui |
| Web3 | wagmi v2 + viem |
| Chain | Base Sepolia (primary) |
| LLM | Groq (Llama 3.3) |
| Agent Registry | ERC-8004 (Ethereum mainnet) |

---

## Team Assignments

| Dev | Focus | Primary Tasks |
|-----|-------|---------------|
| **Dev 1** | Phaser/Game | City tilemap, agent sprites, Council Room scene |
| **Dev 2** | DeFi/Contracts | Uniswap executor, Yellow integration, wallet connect |
| **Dev 3** | Backend/Agents | LLM orchestrator, API routes, ERC-8004 queries |

---

## Timeline & Tasks

### Wave 0: Validation (Day 1) - CRITICAL
> Verify all sponsor integrations work BEFORE building features

| Task | Owner | What |
|------|-------|------|
| T0 | Any | Scaffold Turborepo + Next.js + Phaser |
| T1 | Dev 2 | Validate Yellow sandbox auth (raw Keccak signing!) |
| T2 | Dev 2 | Validate Uniswap pool exists on Base Sepolia |
| T3 | Dev 3 | Validate ERC-8004 registry queryable |

**Day 1 Checkpoint**: All 3 sponsor integrations have working "hello world"

---

### Wave 1: Foundation (Days 1-2)

| Task | Owner | What |
|------|-------|------|
| T4 | Dev 2 | Wallet connect + chain switching |
| T5 | Dev 2 | ENS name resolution |
| T6 | Dev 3 | Shared types package (TradeProposal, AgentProfile) |
| T7 | Dev 1 | Basic Phaser scene shell |

---

### Wave 2: Core Features (Days 2-4)

| Task | Owner | What |
|------|-------|------|
| T8 | Dev 1 | Isometric city tilemap |
| T9 | Dev 1 | Agent sprites + deployment flow |
| T10 | Dev 1 | Council Room scene (pure Phaser UI) |
| T11 | Dev 3 | Agent orchestrator API (Groq LLM) |
| T12 | Dev 3 | ERC-8004 integration |

---

### Wave 3: Integration (Days 4-6)

| Task | Owner | What |
|------|-------|------|
| T13 | Dev 2 | Yellow session lifecycle |
| T14 | Dev 2 | Uniswap swap executor |
| T15 | All | Wire: Proposal → Approve → Swap flow |
| T16 | Dev 3 | Guest mode (10-min sessions) |

**Day 6 Checkpoint**: Full demo flow works end-to-end (even if ugly)

---

### Wave 4: Polish (Days 7-8)

| Task | Owner | What |
|------|-------|------|
| T17 | Dev 1 | Landing page |
| T18 | Dev 3 | Docs page (for judges) |
| T19 | All | Edge case handling |
| T20 | Any | Demo video (2-3 min) |
| T21 | All | Final testing + submission |

**Day 7 Rule**: Polish only, NO new features

---

## Critical Technical Notes

### Yellow Network (T1, T13)
```typescript
// CRITICAL: Standard signMessage() FAILS
// Must use RAW Keccak256 hash signing
const hash = keccak256(toUtf8Bytes(JSON.stringify(payload)));
await signer.signMessage(arrayify(hash));
```
- Sandbox: `wss://clearnet-sandbox.yellow.com/ws`
- SDK has NO WebSocket client - implement manually

### Uniswap v4 (T2, T14)
- Use Universal Router, NOT direct PoolManager calls
- Requires Permit2 approvals
- Base Sepolia contracts:
  - Universal Router: `0x6fF5693b99212Da76ad316178A184AB56D299b43`
  - Pool Manager: `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`

### ERC-8004 (T3, T12)
- Identity Registry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` (Ethereum mainnet)
- Use 8004scan indexer for IPFS resolution
- 30k+ agents registered

### Phaser + Next.js (T7)
```typescript
// Must use dynamic import with ssr: false
import dynamic from 'next/dynamic';
const Game = dynamic(() => import('./GameComponent'), { ssr: false });
```

---

## Scope Guards (DO NOT ADD)

- NPC pathfinding (use static positions)
- Multi-agent coordination (1 agent, 1 proposal)
- Multi-hop Uniswap swaps
- Mobile support
- LP management
- Save/load game state

---

## Fallback Modes

Every external service has a mock mode:
- `YELLOW_MOCK=true` - Skip Yellow, demo without sessions
- `ERC8004_MOCK=true` - Use 3 hardcoded agents
- `GROQ_MOCK=true` - Return hardcoded ETH→USDC proposal

---

## Project Structure

```
agentropolis/
├── apps/
│   └── web/                 # Next.js + Phaser
│       ├── app/
│       │   ├── page.tsx     # Landing
│       │   ├── app/         # Game route
│       │   ├── docs/        # Docs page
│       │   └── api/         # API routes
│       ├── components/
│       │   └── game/        # Phaser scenes
│       └── lib/
│           ├── yellow/      # Yellow integration
│           ├── uniswap/     # Swap executor
│           └── erc8004/     # Agent registry
├── packages/
│   ├── shared/              # Types, schemas
│   └── contracts/           # Solidity (if needed)
└── PLAN.md                  # This file
```

---

## Definition of Done

- [ ] User connects wallet, sees ENS name
- [ ] User starts Yellow session, deploys agent (off-chain fee), settles
- [ ] User enters Council Room, sees agent proposal
- [ ] User approves → Uniswap swap executes → TxID displayed
- [ ] Docs page explains all integrations
- [ ] Demo video shows complete flow (2-3 min)

---

## Commands

```bash
# Install
bun install

# Dev
bun run dev

# Build
bun run build

# Run specific workspace
bun run dev --filter=web
```

---

## Links

- [Yellow Docs](https://docs.yellow.org/docs/learn)
- [Uniswap v4 Docs](https://docs.uniswap.org/contracts/v4/overview)
- [ENS Docs](https://docs.ens.domains)
- [ERC-8004 Spec](https://eips.ethereum.org/EIPS/eip-8004)
- [8004scan Explorer](https://8004scan.io)
