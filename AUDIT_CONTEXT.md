# Agentropolis - Comprehensive Audit Context

**Generated:** Feb 5, 2026
**Purpose:** Full context document for security/code audit
**Hackathon:** HackMoney 2026 (Deadline: Feb 8, 2026)

---

## 1. PROJECT OVERVIEW

### What is Agentropolis?
A **gamified DeFi trading platform** presented as a city-builder where users:
1. Deploy AI agents as characters in an isometric city
2. Agents collaborate in a "Council Room" to propose trading strategies
3. User reviews and approves/rejects proposals
4. Approved trades execute **real on-chain swaps** via Uniswap v4
5. In-game micro-transactions use **Yellow Network state channels** (off-chain)

### Sponsor Tracks Targeted
| Sponsor | Prize | Integration |
|---------|-------|-------------|
| Yellow Network | $15,000 | State channels for gasless micro-transactions |
| Uniswap Foundation | $10,000 | Uniswap v4 swaps via Universal Router |
| ENS | $5,000 | Identity resolution and text records |

### Current Configuration
```
Chain: Base Sepolia (chainId: 84532)
NEXT_PUBLIC_YELLOW_MOCK=false  (REAL state channels)
NEXT_PUBLIC_UNISWAP_MOCK=false (REAL on-chain swaps)
```

---

## 2. ARCHITECTURE OVERVIEW

### Tech Stack
- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS
- **Game Engine:** Phaser 3 (isometric city + council room)
- **Web3:** wagmi, viem, @metamask/sdk
- **State Channels:** @erc7824/nitrolite (Yellow Network SDK)
- **AI:** groq-sdk (llama-3.3-70b-versatile)
- **Monorepo:** Turborepo + Bun

### Directory Structure
```
/Users/kryptos/Desktop/Projects/Agentropolis/
├── apps/
│   └── web/                      # Main Next.js application
│       ├── app/                  # Next.js App Router pages
│       │   ├── api/agents/       # AI agent API routes
│       │   ├── app/              # Main game page
│       │   └── docs/             # Documentation page
│       ├── components/
│       │   ├── game/             # Phaser integration
│       │   │   └── scenes/       # CityScene.ts, CouncilScene.ts
│       │   ├── SessionProvider.tsx
│       │   ├── SwapHandler.tsx
│       │   └── WalletProvider.tsx
│       └── lib/
│           ├── uniswap/          # Uniswap v4 integration
│           ├── yellow/           # Yellow Network integration
│           ├── agents/           # AI council logic
│           ├── ens/              # ENS integration
│           ├── erc8004/          # Agent registry
│           └── wagmi.ts          # Wallet configuration
├── packages/
│   └── shared/                   # Shared TypeScript types
└── CONTEXT.md                    # Original hackathon requirements
```

---

## 3. CRITICAL INTEGRATIONS

### 3.1 UNISWAP V4 INTEGRATION

**Files:**
- `apps/web/lib/uniswap/executor.ts` - Core swap execution
- `apps/web/lib/uniswap/constants.ts` - Contract addresses
- `apps/web/lib/uniswap/pools.ts` - Pool utilities
- `apps/web/components/SwapHandler.tsx` - React integration

**Contract Addresses (Base Sepolia):**
```typescript
UNIVERSAL_ROUTER: '0x492E6456D9528771018DeB9E87ef7750EF184104'
POOL_MANAGER: '0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408'
PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3'
POSITION_MANAGER: '0xABD2e846ea3927eA90e5e4Caa2A0fFd0CcbF60f8'
WETH: '0x4200000000000000000000000000000000000006'
USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
```

**Pool Configuration:**
```typescript
POOL_KEY = {
  currency0: USDC,  // 0x036CbD53842c5426634e7929541eC2318f3dCF7e
  currency1: WETH,  // 0x4200000000000000000000000000000000000006
  fee: 3000,
  tickSpacing: 60,
  hooks: '0x0000000000000000000000000000000000000000'
}
```

**Execution Flow:**
1. `TradeProposal` received from AI council
2. Token allowance checked, approval requested if needed
3. `encodeV4SwapInput()` encodes: SWAP_EXACT_IN_SINGLE + SETTLE_ALL + TAKE_ALL
4. Universal Router `execute()` called with V4_SWAP command (0x10)

**AUDIT POINTS:**
- [ ] Slippage calculation in `computeMinAmountOut()` - handles both fraction and bps
- [ ] No pool validation before swap (removed due to transient storage issues)
- [ ] Approval sets exact amount, not unlimited
- [ ] Deadline handling (converts ms to seconds if needed)

### 3.2 YELLOW NETWORK INTEGRATION

**Files:**
- `apps/web/lib/yellow/client.ts` - NitroliteClient setup
- `apps/web/lib/yellow/channel.tsx` - Channel manager + React context
- `apps/web/lib/yellow/constants.ts` - Contract addresses
- `apps/web/components/SessionProvider.tsx` - Session UI

**Contract Addresses (Base Sepolia):**
```typescript
CUSTODY: '0x019B65A265EB3363822f2752141b3dF16131b262'
YTEST_USD: '0xDB9F293e3898c9E5536A3be1b0C56c89d2b32DEb' // 6 decimals
```

**Clearnode Endpoint:**
```
wss://clearnet-sandbox.yellow.com/ws
```

**SDK:** `@erc7824/nitrolite@0.5.3`

**Flow:**
1. `getClearnodeConfig()` - Fetches broker address via WebSocket RPC
2. `deposit(tokenAddress, amount)` - On-chain deposit to custody
3. `createChannel()` - WebSocket RPC to clearnode
4. `executeOffChainTransfer()` - Instant signed transfers (no gas)
5. `closeChannel()` - Settlement back to custody

**AUDIT POINTS:**
- [ ] WebSocket timeout handling (10s for config, 30s for channel creation)
- [ ] Fallback if clearnode config fetch fails
- [ ] Token allowance check before deposit
- [ ] Off-chain transfer validation (amount > 0, sufficient balance)
- [ ] Mock mode bypasses all real operations when enabled

### 3.3 AI AGENT SYSTEM

**Files:**
- `apps/web/lib/agents/council.ts` - Multi-agent deliberation
- `apps/web/lib/agents/orchestrator.ts` - Single-agent proposals
- `apps/web/app/api/agents/council/route.ts` - API endpoint
- `packages/shared/src/types.ts` - Proposal types

**Agent Personas:**
| Role | ID | Behavior |
|------|-----|----------|
| Alpha Hunter | alpha | Yield-focused, optimistic |
| Risk Sentinel | risk | Conservative, has VETO power |
| Macro Oracle | macro | Neutral trend analyst |
| Devil's Advocate | devil | Contrarian skeptic |
| Council Clerk | clerk | Synthesizes final proposal |

**AI Provider:** Groq SDK (`llama-3.3-70b-versatile`)

**AUDIT POINTS:**
- [ ] Rate limiting: 5 requests/minute for guest mode
- [ ] JSON response validation from LLM
- [ ] BYOA (external agent) endpoint support via `agentEndpoint`
- [ ] Veto detection in Risk Sentinel reasoning
- [ ] Mock mode returns deterministic proposals when GROQ_API_KEY missing

### 3.4 WALLET & CHAIN CONFIGURATION

**File:** `apps/web/lib/wagmi.ts`

```typescript
chains: [baseSepolia, sepolia, mainnet]
connectors: [injected()]
transports: { [chainId]: http() }
```

**AUDIT POINTS:**
- [ ] Only `injected()` connector - no WalletConnect, Coinbase, etc.
- [ ] Default HTTP transport (no custom RPC endpoints specified)
- [ ] Base Sepolia is primary target chain

---

## 4. DATA TYPES & SCHEMAS

### TradeProposal
```typescript
interface TradeProposal {
  id: string
  agentId: string
  agentName: string
  pair: {
    tokenIn: { symbol: string; address: string }
    tokenOut: { symbol: string; address: string }
  }
  action: 'swap' | 'rebalance' | 'dca'
  strategyType?: 'swap' | 'dca' | 'lp_full_range' | 'lp_concentrated' | 'token_launch'
  amountIn: string
  expectedAmountOut: string
  maxSlippage: number        // Can be 0-1 (fraction) or >1 (basis points)
  deadline: number           // Unix timestamp (ms or seconds)
  reasoning: string
  confidence: number         // 0-100
  riskLevel: 'low' | 'medium' | 'high'
  tickLower?: number         // LP positions
  tickUpper?: number
  deliberation?: DeliberationResult
}
```

### YellowSession
```typescript
interface YellowSession {
  sessionId: string
  userAddress: string
  balance: string
  isActive: boolean
  createdAt: number
  expiresAt: number
}
```

---

## 5. RECENT FIXES & KNOWN ISSUES

### Fixed Issues (This Session)

1. **Uniswap getSlot0 Failure**
   - **Problem:** `getSlot0(poolId)` returned zeros due to Uniswap v4 transient storage
   - **Fix:** Removed pool validation in `executor.ts`, execute swap directly
   - **Verification:** Pool confirmed working via TX `0x858bc2d14c82b87e7f222928da3643eced464da14344e568bc5fde069f576c2f`

2. **Yellow SDK API Mismatch**
   - **Problem:** SDK v0.5.3 has different signatures than docs
   - **Fix:** Updated to use `deposit(tokenAddress, amount)` and `withdrawal(tokenAddress, amount)`
   - **Channel creation now uses WebSocket RPC directly**

3. **NitroliteClient Config**
   - **Problem:** SDK only accepts `custody` and `adjudicator` in addresses (not `guestAddress`, `tokenAddress`)
   - **Fix:** Removed unsupported properties, fetch broker address dynamically

### Known Issues / Limitations

1. **React Hydration Errors** - Non-blocking UI errors in AgentSettingsButton (SVG mismatch)
2. **MetaMask Popup** - Must be manually confirmed (can't automate in tests)
3. **Only USDC/WETH Pool** - Single pool hardcoded in constants
4. **No Error Recovery UI** - Failed transactions don't have retry mechanism
5. **Guest Mode Rate Limiting** - Only in-memory, resets on server restart

---

## 6. SECURITY-SENSITIVE AREAS

### High Priority
| Area | File | Concern |
|------|------|---------|
| Token Approvals | `executor.ts:245-256` | Approves exact amount, waits for receipt |
| Swap Execution | `executor.ts:267-274` | Direct contract write, no simulation |
| Yellow Deposits | `channel.tsx:256-277` | On-chain token transfer |
| External Agents | `council.ts:91-128` | Arbitrary endpoint calls |

### Medium Priority
| Area | File | Concern |
|------|------|---------|
| WebSocket Security | `client.ts:27-79` | No auth on clearnode connection |
| localStorage | `CityScene.ts` | Agent data persisted client-side |
| ENS Text Records | `lib/ens/textRecords.ts` | User-controlled agent endpoints |

### Low Priority
| Area | File | Concern |
|------|------|---------|
| Mock Mode | Multiple | Easy to accidentally enable |
| Rate Limiting | `route.ts` | In-memory only |

---

## 7. ENVIRONMENT VARIABLES

**Required:**
```bash
# AI (optional - falls back to mock)
GROQ_API_KEY=gsk_...

# Feature Flags
NEXT_PUBLIC_YELLOW_MOCK=false
NEXT_PUBLIC_UNISWAP_MOCK=false
```

**Optional:**
```bash
GROQ_MOCK=true  # Force mock AI responses
```

---

## 8. KEY FILES FOR AUDIT

### Must Review
1. `apps/web/lib/uniswap/executor.ts` - All on-chain swap logic
2. `apps/web/lib/yellow/channel.tsx` - State channel lifecycle
3. `apps/web/lib/yellow/client.ts` - SDK initialization
4. `apps/web/lib/agents/council.ts` - AI orchestration
5. `apps/web/components/SwapHandler.tsx` - Event-driven execution

### Should Review
6. `apps/web/lib/uniswap/constants.ts` - Contract addresses
7. `apps/web/lib/yellow/constants.ts` - Yellow addresses
8. `apps/web/lib/wagmi.ts` - Chain configuration
9. `packages/shared/src/types.ts` - Data schemas
10. `apps/web/app/api/agents/council/route.ts` - API security

### Context Files
11. `CONTEXT.md` - Original hackathon requirements
12. `.env.local` - Current configuration

---

## 9. TESTING COMMANDS

```bash
# Start dev server
cd apps/web && PORT=3002 bun run dev

# Build (type check)
cd apps/web && bun run build

# Manual E2E Test Flow
1. Open http://localhost:3002/app
2. Connect MetaMask (Base Sepolia)
3. Click "Deposit" → Approve ytest.USD deposit
4. Deploy agent → Charges 0.01 ytest.USD off-chain
5. Click Council building → Select prompt
6. Wait for deliberation → Click APPROVE
7. Confirm MetaMask transaction
8. View TxID on BaseScan
```

---

## 10. QUESTIONS FOR AUDITOR

1. Is the slippage handling in `computeMinAmountOut()` correct for both fraction and bps inputs?
2. Should there be a maximum approval amount instead of exact amount?
3. Is the WebSocket connection to clearnode secure without authentication?
4. Are there reentrancy concerns with the approval → swap flow?
5. Should the external agent endpoint (`agentEndpoint`) have URL validation?
6. Is storing agent endpoint in ENS text records a security risk?
7. Should off-chain transfers require additional confirmation?
8. Is the 30-second timeout for channel creation sufficient?

---

## 11. APPENDIX: VERIFIED CONTRACT INTERACTIONS

### Successful Uniswap Swap
- **TX:** `0x858bc2d14c82b87e7f222928da3643eced464da14344e568bc5fde069f576c2f`
- **Pool ID:** `0xcafe1ec4f71a632f8fc57506c478d0b25b399a9aa003c9bc02c444639578ae46`
- **Method:** PoolSwapTest (verified pool exists and has liquidity)

### Yellow Custody Contract
- **Address:** `0x019B65A265EB3363822f2752141b3dF16131b262`
- **Token:** ytest.USD (`0xDB9F293e3898c9E5536A3be1b0C56c89d2b32DEb`)
- **Clearnode:** `wss://clearnet-sandbox.yellow.com/ws`

---

*End of Audit Context Document*
