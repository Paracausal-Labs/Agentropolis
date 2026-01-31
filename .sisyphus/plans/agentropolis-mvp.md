# Agentropolis MVP - HackMoney 2026

## TL;DR

> **Quick Summary**: Build a gamified DeFi trading platform as an isometric city-builder. Deploy AI agents, review their trade proposals in a Council Room, execute approved trades on Uniswap v4. Uses Yellow Network for instant micro-actions, ERC-8004 for agent discovery, ENS for identity.
> 
> **Deliverables**:
> - Landing page with hero + CTAs
> - Isometric Phaser city with deployable agents
> - Council Room (Phaser scene) for proposal review
> - Wallet connect + ENS name display
> - Yellow session: create + micro-actions + settlement
> - At least 1 successful Uniswap v4 swap with TxID
> - Docs page for judges
> - 2-3 minute demo video
> 
> **Estimated Effort**: XL (8 days, 3 developers)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Scaffolding → Sponsor Validation → City + Backend parallel → Integration → Polish

---

## Context

### Original Request
Build "Agentropolis" for HackMoney 2026 (ETHGlobal). Gamified DeFi platform where users deploy AI agents in a city, agents propose trades, users approve in Council Room, trades execute on-chain. Target sponsor tracks: Yellow ($15k), Uniswap ($10k), ENS ($5k).

### Interview Summary
**Key Discussions**:
- Chain: Base Sepolia primary, mainnet bonus if time
- City: Phaser/PixiJS, isometric style, full city (team of 3 can handle)
- Council Room: Pure Phaser UI, no React overlay
- Backend: Next.js API routes
- Agent proposals: Structured JSON via Groq LLM
- Yellow: Micro-actions only, real trades bypass
- Trading: User's own wallet, any Uniswap pool
- ERC-8004: Read from Ethereum mainnet (30k+ agents)
- Testing: Manual only

**Research Findings**:
- Yellow requires RAW Keccak256 hash signing (NOT EIP-191) - standard signMessage() FAILS
- Yellow SDK has no WebSocket client - must implement manually
- Uniswap v4 uses Universal Router with V4_SWAP command pattern
- ERC-8004 has public indexer at 8004scan
- Phaser needs `ssr: false` in Next.js

### Metis Review
**Identified Gaps** (addressed):
- Scope: "Full city simulation" locked to 1 static tilemap, 5-10 decorative NPCs
- Fallbacks: Mock modes for Yellow, ERC-8004, Groq failures
- Edge cases: Wrong chain, insufficient balance, slippage exceeded
- Day 1 validation: All 3 sponsor integrations verified before features
- NPC pathfinding: Explicitly excluded
- Agent collaboration: Removed - 1 agent, 1 proposal for MVP

---

## Work Objectives

### Core Objective
Deliver a functional demo that showcases all 3 sponsor integrations (Yellow, Uniswap v4, ENS) via a compelling city-builder metaphor, within 8 days.

### Concrete Deliverables
| Deliverable | Location |
|-------------|----------|
| Landing page | `apps/web/app/page.tsx` |
| City game scene | `apps/web/components/game/CityScene.ts` |
| Council Room scene | `apps/web/components/game/CouncilScene.ts` |
| Agent orchestrator API | `apps/web/app/api/agents/` |
| Yellow integration | `apps/web/lib/yellow/` |
| Uniswap executor | `apps/web/lib/uniswap/` |
| Docs page | `apps/web/app/docs/page.tsx` |
| Demo video | Submitted externally |

### Definition of Done
- [ ] User can connect wallet and see ENS name (or truncated address)
- [ ] User can start Yellow session, deploy agent (off-chain fee), settle session
- [ ] User can enter Council Room and see agent proposal
- [ ] User can approve proposal → Uniswap v4 swap executes → TxID displayed
- [ ] Docs page explains all integrations for judges
- [ ] Demo video shows complete flow in 2-3 minutes

### Must Have
- Working wallet connect with chain switching
- At least 3 agents loaded from ERC-8004 registry
- At least 1 successful Yellow session lifecycle
- At least 1 successful Uniswap v4 swap
- ENS name displayed
- Demo video

### Must NOT Have (Guardrails)
- NPC pathfinding (use static positions or simple patrol)
- Procedural city generation (use pre-built tilemap)
- Multi-agent negotiation/coordination (1 agent, 1 proposal)
- Real trade value through Yellow channels
- Multi-hop Uniswap routing (single pool swaps only)
- Mobile support
- LP position management
- Complex reputation writing
- Save/load game state

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (new project)
- **User wants tests**: Manual-only
- **Framework**: N/A

### Manual Verification Approach

Each TODO includes EXECUTABLE verification procedures via Playwright or curl.

**Evidence Requirements (Agent-Executable)**:
- Console output captured and compared against expected patterns
- Screenshots saved to `.sisyphus/evidence/` for visual verification
- Transaction hashes verified via block explorer API
- Exit codes checked (0 = success)

---

## Team Assignments

| Developer | Focus Area | Primary Tasks |
|-----------|------------|---------------|
| **Dev 1 (Phaser)** | City + Council UI | Tilemap, sprites, Council scene, pure Phaser UI |
| **Dev 2 (DeFi)** | Contracts + Integration | Uniswap executor, Yellow integration, wallet connect |
| **Dev 3 (Backend)** | Agents + API | LLM orchestration, API routes, ERC-8004 queries |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 0 (Day 1 - VALIDATION):
├── T0: Scaffold Turborepo + Next.js + Phaser
├── T1: Validate Yellow sandbox auth
├── T2: Validate Uniswap pool exists on Base Sepolia
└── T3: Validate ERC-8004 registry queryable

Wave 1 (Days 1-2 - FOUNDATION):
├── T4: Wallet connect + chain switching
├── T5: ENS name resolution
├── T6: Shared types package
└── T7: Basic Phaser scene shell

Wave 2 (Days 2-4 - CORE):
├── T8: Isometric city tilemap
├── T9: Agent sprites + deployment
├── T10: Council Room scene
├── T11: Agent orchestrator API
└── T12: ERC-8004 integration

Wave 3 (Days 4-6 - INTEGRATION):
├── T13: Yellow session lifecycle
├── T14: Uniswap swap executor
├── T15: Proposal → Approve → Swap flow
└── T16: Guest mode

Wave 4 (Days 7-8 - POLISH):
├── T17: Landing page
├── T18: Docs page
├── T19: Edge case handling
├── T20: Demo video
└── T21: Final testing + submission
```

### Dependency Matrix

| Task | Depends On | Blocks | Assignee |
|------|------------|--------|----------|
| T0 | None | T4-T7 | Any |
| T1 | None | T13 | Dev 2 |
| T2 | None | T14 | Dev 2 |
| T3 | None | T12 | Dev 3 |
| T4 | T0 | T5, T13, T14 | Dev 2 |
| T5 | T4 | T17 | Dev 2 |
| T6 | T0 | T11, T12 | Dev 3 |
| T7 | T0 | T8, T10 | Dev 1 |
| T8 | T7 | T9 | Dev 1 |
| T9 | T8 | T10 | Dev 1 |
| T10 | T9 | T15 | Dev 1 |
| T11 | T6 | T15 | Dev 3 |
| T12 | T3, T6 | T9 | Dev 3 |
| T13 | T1, T4 | T15 | Dev 2 |
| T14 | T2, T4 | T15 | Dev 2 |
| T15 | T10, T11, T13, T14 | T19, T20 | All |
| T16 | T11 | T19 | Dev 3 |
| T17 | T5 | T20 | Dev 1 |
| T18 | T15 | T20 | Dev 3 |
| T19 | T15, T16 | T20 | All |
| T20 | T17, T18, T19 | T21 | Any |
| T21 | T20 | None | All |

### Critical Path
T0 → T4 → T14 → T15 → T19 → T20 → T21

---

## TODOs

---

### - [ ] T0. Scaffold Turborepo + Next.js + Phaser

**What to do**:
- Initialize Turborepo with `apps/web`, `packages/contracts`, `packages/shared`
- Set up Next.js 14 (App Router) in `apps/web`
- Configure Tailwind CSS + shadcn/ui
- Add Phaser as a dependency with dynamic import pattern
- Configure ESLint, TypeScript, Prettier
- Create initial git commit

**Must NOT do**:
- Add any game logic yet
- Implement any features
- Deploy anywhere

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Standard scaffolding with known patterns
- **Skills**: `[]`
  - No special skills needed - standard tooling

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 0 (with T1, T2, T3)
- **Blocks**: T4, T5, T6, T7
- **Blocked By**: None

**References**:
- Official docs: https://turbo.build/repo/docs/getting-started/create-new
- Next.js App Router: https://nextjs.org/docs/app
- shadcn/ui: https://ui.shadcn.com/docs/installation/next

**Acceptance Criteria**:

```bash
# AC-1: Monorepo structure exists
ls apps/web packages/shared packages/contracts
# Assert: All directories exist

# AC-2: Next.js dev server starts
cd apps/web && bun run dev &
sleep 5 && curl -s http://localhost:3000 | grep -q "html"
# Assert: Exit code 0

# AC-3: Phaser loads without SSR error
# Create test file and verify dynamic import works
bun -e "import('phaser').then(() => console.log('OK'))"
# Assert: Output is "OK"

# AC-4: Tailwind configured
grep -q "tailwindcss" apps/web/package.json
# Assert: Exit code 0
```

**Commit**: YES
- Message: `chore: scaffold turborepo with next.js and phaser`
- Files: All scaffolded files
- Pre-commit: `bun run build`

---

### - [ ] T1. Validate Yellow Sandbox Authentication

**What to do**:
- Create test script to connect to Yellow sandbox WebSocket
- Implement raw Keccak256 hash signing (NOT EIP-191)
- Successfully authenticate with ClearNode
- Document any issues or differences from docs
- Create fallback mock mode if sandbox is unreachable

**Must NOT do**:
- Build full Yellow integration
- Create UI components
- Handle complex session logic

**Recommended Agent Profile**:
- **Category**: `deep`
  - Reason: Requires careful debugging of authentication protocol
- **Skills**: `[]`
  - Web3 knowledge built-in

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 0 (with T0, T2, T3)
- **Blocks**: T13
- **Blocked By**: None

**References**:
- Yellow SDK: `@erc7824/nitrolite`
- Yellow docs: https://docs.yellow.org/docs/build/quick-start/
- Sandbox endpoint: `wss://clearnet-sandbox.yellow.com/ws`

**Pattern** (from Metis):
```typescript
// CRITICAL: Custom signer required - standard wallet.signMessage() FAILS
import { keccak256, toUtf8Bytes, arrayify } from 'ethers';

const messageSigner = async (payload: object) => {
  const jsonStr = JSON.stringify(payload);
  const hash = keccak256(toUtf8Bytes(jsonStr)); // RAW hash, no prefix
  return await signer.signMessage(arrayify(hash)); // Sign the hash bytes
};
```

**Acceptance Criteria**:

```bash
# AC-1: WebSocket connects
bun run apps/web/scripts/test-yellow.ts
# Assert: Output contains "Connected to Yellow sandbox"

# AC-2: Authentication succeeds
# Assert: Output contains "Authentication successful" or clear error message

# AC-3: Fallback mode works
YELLOW_MOCK=true bun run apps/web/scripts/test-yellow.ts
# Assert: Output contains "Running in mock mode"
```

**Commit**: YES
- Message: `feat(yellow): validate sandbox auth with raw keccak signing`
- Files: `apps/web/scripts/test-yellow.ts`, `apps/web/lib/yellow/`
- Pre-commit: Script runs without errors

---

### - [ ] T2. Validate Uniswap Pool Exists on Base Sepolia

**What to do**:
- Query PoolManager for ETH/USDC pool on Base Sepolia
- If no pool exists, create one with minimal liquidity
- Document pool address and PoolKey parameters
- Test a minimal swap using Universal Router
- Create hardcoded constants file with contract addresses

**Must NOT do**:
- Build full swap UI
- Handle multiple token pairs
- Implement slippage protection

**Recommended Agent Profile**:
- **Category**: `deep`
  - Reason: Requires understanding v4 pool mechanics
- **Skills**: `[]`
  - Web3/DeFi knowledge built-in

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 0 (with T0, T1, T3)
- **Blocks**: T14
- **Blocked By**: None

**References**:
- Uniswap v4 docs: https://docs.uniswap.org/contracts/v4/guides/swap-routing
- Base Sepolia contracts:
  ```typescript
  UNIVERSAL_ROUTER: '0x6fF5693b99212Da76ad316178A184AB56D299b43'
  POOL_MANAGER: '0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408'
  PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3'
  WETH: '0x4200000000000000000000000000000000000006'
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  ```

**Acceptance Criteria**:

```bash
# AC-1: Pool exists or is created
bun run apps/web/scripts/test-uniswap.ts
# Assert: Output contains "Pool found:" or "Pool created:"

# AC-2: Test swap succeeds
# Assert: Output contains "Swap successful, TxID:"

# AC-3: Constants file created
cat apps/web/lib/uniswap/constants.ts | grep -q "POOL_KEY"
# Assert: Exit code 0
```

**Commit**: YES
- Message: `feat(uniswap): validate base sepolia pool and test swap`
- Files: `apps/web/scripts/test-uniswap.ts`, `apps/web/lib/uniswap/constants.ts`
- Pre-commit: Script runs without errors

---

### - [ ] T3. Validate ERC-8004 Registry Queryable

**What to do**:
- Query Ethereum mainnet ERC-8004 Identity Registry
- Fetch at least 3 agent profiles with metadata
- Handle IPFS URI resolution (via gateway or 8004scan)
- Create fallback with 3 hardcoded mock agents
- Document any rate limits or issues

**Must NOT do**:
- Build agent selection UI
- Implement reputation queries
- Write to the registry

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Standard RPC queries
- **Skills**: `[]`
  - Web3 knowledge built-in

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 0 (with T0, T1, T2)
- **Blocks**: T12
- **Blocked By**: None

**References**:
- ERC-8004 Identity Registry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` (Ethereum mainnet)
- 8004scan indexer: https://8004scan.io
- EIP spec: https://eips.ethereum.org/EIPS/eip-8004

**Acceptance Criteria**:

```bash
# AC-1: Query returns agents
bun run apps/web/scripts/test-erc8004.ts
# Assert: Output contains "Found X agents" where X >= 3

# AC-2: Metadata resolves
# Assert: Output shows agent name, description, image URL

# AC-3: Fallback works
ERC8004_MOCK=true bun run apps/web/scripts/test-erc8004.ts
# Assert: Output contains "Using mock agents"
```

**Commit**: YES
- Message: `feat(erc8004): validate registry queries with fallback mocks`
- Files: `apps/web/scripts/test-erc8004.ts`, `apps/web/lib/erc8004/`
- Pre-commit: Script runs without errors

---

### - [ ] T4. Wallet Connect + Chain Switching

**What to do**:
- Configure wagmi v2 with Base Sepolia as default chain
- Set up RainbowKit or custom connect button
- Implement auto-prompt for chain switching if wrong network
- Store wallet state in React context
- Create reusable `<WalletProvider>` component

**Must NOT do**:
- Support multiple wallets beyond MetaMask + WalletConnect
- Implement account abstraction
- Add social login

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Standard wagmi patterns
- **Skills**: `[]`
  - React/wagmi knowledge built-in

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with T5, T6, T7)
- **Blocks**: T5, T13, T14
- **Blocked By**: T0

**References**:
- wagmi v2 docs: https://wagmi.sh/react/getting-started
- viem chains: https://viem.sh/docs/chains/introduction

**Acceptance Criteria**:

```
# AC-1: Connect button visible
playwright: navigate to http://localhost:3000
           → assert "Connect Wallet" button visible
           → screenshot: .sisyphus/evidence/t4-connect-button.png

# AC-2: MetaMask popup on click
playwright: click "Connect Wallet"
           → assert MetaMask popup appears (or WalletConnect QR)

# AC-3: Address displayed after connect
playwright: approve MetaMask connection
           → assert address displayed (0x... or ENS name)

# AC-4: Wrong chain prompts switch
playwright: switch MetaMask to Ethereum mainnet
           → assert "Switch to Base Sepolia" modal appears
```

**Commit**: YES
- Message: `feat(wallet): add wallet connect with chain switching`
- Files: `apps/web/components/WalletProvider.tsx`, `apps/web/app/layout.tsx`
- Pre-commit: `bun run build`

---

### - [ ] T5. ENS Name Resolution

**What to do**:
- Use wagmi's `useEnsName` hook for connected wallet
- Display ENS name if available, truncated address otherwise
- Show ENS avatar if available
- Test with known ENS addresses (e.g., vitalik.eth)

**Must NOT do**:
- Write ENS text records
- Support ENS subdomains
- Build ENS profile page

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Simple wagmi hook usage
- **Skills**: `[]`
  - Standard wagmi patterns

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with T4, T6, T7)
- **Blocks**: T17
- **Blocked By**: T4

**References**:
- wagmi useEnsName: https://wagmi.sh/react/api/hooks/useEnsName
- wagmi useEnsAvatar: https://wagmi.sh/react/api/hooks/useEnsAvatar

**Acceptance Criteria**:

```
# AC-1: ENS name displays for ENS holder
# Test with known ENS (requires mainnet query or mock)
playwright: mock wallet as 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
           → assert "vitalik.eth" displayed (or similar test ENS)

# AC-2: Truncated address for non-ENS
playwright: connect wallet without ENS
           → assert address shows as "0x1234...abcd" format

# AC-3: Avatar displays if available
playwright: assert avatar image or default placeholder visible
```

**Commit**: YES (groups with T4)
- Message: `feat(ens): display ens name and avatar`
- Files: `apps/web/components/UserIdentity.tsx`
- Pre-commit: `bun run build`

---

### - [ ] T6. Shared Types Package

**What to do**:
- Create `packages/shared/src/types/` with all shared interfaces
- Define `TradeProposal` interface (from interview)
- Define `AgentProfile` interface (ERC-8004 compatible)
- Define `YellowSession` interface
- Export all types from package
- Configure package build

**Must NOT do**:
- Add validation logic (just types)
- Include runtime dependencies
- Add React components

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Simple type definitions
- **Skills**: `[]`
  - TypeScript knowledge built-in

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with T4, T5, T7)
- **Blocks**: T11, T12
- **Blocked By**: T0

**References**:
- Types from interview:
```typescript
interface TradeProposal {
  id: string;
  agentId: string;
  agentName: string;
  pair: {
    tokenIn: { symbol: string; address: string; };
    tokenOut: { symbol: string; address: string; };
  };
  action: 'swap' | 'rebalance' | 'dca';
  amountIn: string;
  expectedAmountOut: string;
  maxSlippage: number; // basis points
  deadline: number; // unix timestamp
  reasoning: string;
  confidence: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
}

interface AgentProfile {
  agentId: number;
  name: string;
  description: string;
  image: string;
  strategy: 'momentum' | 'dca' | 'arbitrage' | 'yield';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  services: { name: string; endpoint: string; version: string; }[];
}
```

**Acceptance Criteria**:

```bash
# AC-1: Package builds
cd packages/shared && bun run build
# Assert: Exit code 0

# AC-2: Types importable
bun -e "import { TradeProposal, AgentProfile } from '@agentropolis/shared'; console.log('OK')"
# Assert: Output is "OK"

# AC-3: All interfaces defined
grep -q "TradeProposal" packages/shared/src/types/index.ts
grep -q "AgentProfile" packages/shared/src/types/index.ts
grep -q "YellowSession" packages/shared/src/types/index.ts
# Assert: All exit code 0
```

**Commit**: YES
- Message: `feat(shared): add core type definitions`
- Files: `packages/shared/src/`
- Pre-commit: `bun run build`

---

### - [ ] T7. Basic Phaser Scene Shell

**What to do**:
- Create Phaser game config with Next.js dynamic import
- Set up main game scene structure
- Configure for isometric display (projection settings)
- Add placeholder for city tilemap
- Ensure no SSR errors

**Must NOT do**:
- Add any actual game content
- Load real assets
- Implement game logic

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: Phaser/game development
- **Skills**: `['frontend-ui-ux']`
  - May need styling guidance for layout

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with T4, T5, T6)
- **Blocks**: T8, T10
- **Blocked By**: T0

**References**:
- Phaser 3 Getting Started: https://phaser.io/tutorials/getting-started-phaser3
- Next.js dynamic import: https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading

**Pattern**:
```typescript
// apps/web/components/game/PhaserGame.tsx
import dynamic from 'next/dynamic';

const Game = dynamic(
  () => import('./GameComponent'),
  { ssr: false }
);
```

**Acceptance Criteria**:

```
# AC-1: Game renders without SSR error
playwright: navigate to http://localhost:3000/app
           → assert no console errors containing "window is not defined"
           → assert canvas element visible

# AC-2: Phaser scene running
playwright: evaluate "window.game?.scene?.isActive('MainScene')"
           → assert result is true

# AC-3: Screenshot shows empty scene
playwright: screenshot: .sisyphus/evidence/t7-phaser-shell.png
```

**Commit**: YES
- Message: `feat(game): add phaser scene shell with next.js integration`
- Files: `apps/web/components/game/`, `apps/web/app/app/page.tsx`
- Pre-commit: `bun run build`

---

### - [ ] T8. Isometric City Tilemap

**What to do**:
- Source or create isometric tileset (free assets or simple shapes)
- Create city tilemap using Tiled or programmatically
- Load tilemap into Phaser scene
- Add basic camera controls (pan, zoom)
- Place council building as central clickable sprite

**Must NOT do**:
- Add NPC movement logic
- Implement day/night cycle
- Create procedural generation

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: Game art and tilemap work
- **Skills**: `['frontend-ui-ux']`
  - Asset/visual guidance

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential after T7
- **Blocks**: T9
- **Blocked By**: T7

**References**:
- Free isometric assets: https://itch.io/game-assets/free/tag-isometric
- Phaser tilemap: https://phaser.io/tutorials/making-your-first-phaser-3-game/part5
- Tiled Map Editor: https://www.mapeditor.org/

**Acceptance Criteria**:

```
# AC-1: Tilemap visible
playwright: navigate to http://localhost:3000/app
           → assert canvas shows city tiles (not empty)
           → screenshot: .sisyphus/evidence/t8-tilemap.png

# AC-2: Camera pan works
playwright: drag on canvas
           → assert camera position changes

# AC-3: Council building visible and clickable
playwright: find council building sprite
           → click on it
           → assert click event fires (check console or state)
```

**Commit**: YES
- Message: `feat(game): add isometric city tilemap with council building`
- Files: `apps/web/components/game/CityScene.ts`, `apps/web/public/assets/`
- Pre-commit: Visual review

---

### - [ ] T9. Agent Sprites + Deployment

**What to do**:
- Create agent sprite class (distinct from NPCs)
- Add "Matrix black suit" style agents (or similar distinct visual)
- Implement deploy agent flow: select from list → place in city
- Connect to ERC-8004 agent data from T12
- Update city scene when agent deployed

**Must NOT do**:
- Add agent pathfinding
- Implement agent-to-agent interaction
- Build complex animation systems

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: Sprite work and animation
- **Skills**: `['frontend-ui-ux']`
  - Visual design guidance

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential after T8
- **Blocks**: T10
- **Blocked By**: T8, T12

**References**:
- Phaser sprites: https://phaser.io/tutorials/making-your-first-phaser-3-game/part2

**Acceptance Criteria**:

```
# AC-1: Agent selector opens
playwright: click "Deploy Agent" button
           → assert agent selection modal/panel opens
           → assert at least 3 agents listed

# AC-2: Agent appears in city
playwright: select an agent → click deploy
           → assert agent sprite visible in city
           → screenshot: .sisyphus/evidence/t9-agent-deployed.png

# AC-3: Agent visually distinct
# Manual verification: Agent looks different from buildings/decorations
```

**Commit**: YES
- Message: `feat(game): add agent sprites with deployment flow`
- Files: `apps/web/components/game/Agent.ts`, `apps/web/components/AgentSelector.tsx`
- Pre-commit: Visual review

---

### - [ ] T10. Council Room Scene

**What to do**:
- Create Council Room as separate Phaser scene
- Add roundtable visual with ~10 seats
- Place user in one seat, deployed agents in others
- Display active trade proposal as Phaser UI elements
- Add Approve/Reject buttons (pure Phaser, no React)
- Transition from city when council building clicked

**Must NOT do**:
- React overlay or portals
- Multiple simultaneous proposals
- Agent dialogue system

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: Complex Phaser scene with UI
- **Skills**: `['frontend-ui-ux']`
  - UI/UX patterns for proposal cards

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential after T9
- **Blocks**: T15
- **Blocked By**: T9

**References**:
- Phaser scene management: https://phaser.io/tutorials/making-your-first-phaser-3-game/part6
- Phaser UI plugin: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/

**Acceptance Criteria**:

```
# AC-1: Council Room opens from city
playwright: click council building in city
           → assert scene transitions
           → assert roundtable visible
           → screenshot: .sisyphus/evidence/t10-council-room.png

# AC-2: Agents displayed in seats
playwright: assert deployed agents visible at table seats

# AC-3: Proposal card visible
playwright: assert proposal shows pair, amount, reasoning

# AC-4: Approve/Reject buttons work
playwright: click Approve button
           → assert button state changes or event fires
```

**Commit**: YES
- Message: `feat(game): add council room scene with proposal UI`
- Files: `apps/web/components/game/CouncilScene.ts`
- Pre-commit: Visual review

---

### - [ ] T11. Agent Orchestrator API

**What to do**:
- Create `/api/agents/propose` endpoint
- Accept agent profile and market context
- Generate proposal using Groq LLM with structured output
- Return valid `TradeProposal` JSON
- Add rate limiting for guest mode
- Create fallback hardcoded proposal if LLM fails

**Must NOT do**:
- Multi-turn conversation
- Persistent agent memory
- Complex market analysis

**Recommended Agent Profile**:
- **Category**: `unspecified-high`
  - Reason: LLM integration with structured output
- **Skills**: `[]`
  - LLM knowledge built-in

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with T8-T12)
- **Blocks**: T15
- **Blocked By**: T6

**References**:
- Groq SDK: https://console.groq.com/docs/quickstart
- Next.js API routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

**Acceptance Criteria**:

```bash
# AC-1: Endpoint responds
curl -X POST http://localhost:3000/api/agents/propose \
  -H "Content-Type: application/json" \
  -d '{"agentId": "1", "context": {"balance": "1 ETH"}}' \
  | jq '.pair.tokenIn.symbol'
# Assert: Output is a valid token symbol

# AC-2: Response matches TradeProposal schema
curl -X POST http://localhost:3000/api/agents/propose \
  -H "Content-Type: application/json" \
  -d '{"agentId": "1", "context": {"balance": "1 ETH"}}' \
  | jq 'has("id") and has("pair") and has("reasoning")'
# Assert: Output is "true"

# AC-3: Fallback works
GROQ_MOCK=true curl -X POST http://localhost:3000/api/agents/propose \
  -H "Content-Type: application/json" \
  -d '{"agentId": "1"}' \
  | jq '.reasoning'
# Assert: Output contains fallback text
```

**Commit**: YES
- Message: `feat(api): add agent proposal orchestrator with groq integration`
- Files: `apps/web/app/api/agents/propose/route.ts`, `apps/web/lib/agents/`
- Pre-commit: Endpoint tests pass

---

### - [ ] T12. ERC-8004 Integration

**What to do**:
- Create service to query Ethereum mainnet registry
- Cache agent profiles in memory (avoid rate limits)
- Transform registry data to `AgentProfile` type
- Create `/api/agents/list` endpoint
- Use 8004scan indexer if direct RPC is slow
- Fallback to mock agents if query fails

**Must NOT do**:
- Write to registry
- Query reputation registry
- Build complex search/filter

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Standard RPC queries + caching
- **Skills**: `[]`
  - Web3 knowledge built-in

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with T8-T11)
- **Blocks**: T9
- **Blocked By**: T3, T6

**References**:
- From T3 validation work
- viem readContract: https://viem.sh/docs/contract/readContract

**Acceptance Criteria**:

```bash
# AC-1: List endpoint returns agents
curl http://localhost:3000/api/agents/list | jq 'length'
# Assert: Output >= 3

# AC-2: Agent has required fields
curl http://localhost:3000/api/agents/list | jq '.[0] | has("name") and has("image")'
# Assert: Output is "true"

# AC-3: Caching works
# Two rapid requests don't hit RPC twice (check logs)
```

**Commit**: YES
- Message: `feat(erc8004): add agent list api with caching`
- Files: `apps/web/app/api/agents/list/route.ts`, `apps/web/lib/erc8004/`
- Pre-commit: API tests pass

---

### - [ ] T13. Yellow Session Lifecycle

**What to do**:
- Create Yellow session service using patterns from T1
- Implement: create session → deposit → off-chain action → settle
- Add session state management (React context)
- Display session status in UI
- Use off-chain action for "deploy agent fee" (0.01 testnet tokens)
- Handle session expiry and reconnection

**Must NOT do**:
- Complex multi-participant sessions
- Dispute resolution
- Real value transfers

**Recommended Agent Profile**:
- **Category**: `deep`
  - Reason: Complex WebSocket + state management
- **Skills**: `[]`
  - Web3 knowledge built-in

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential after T1, T4
- **Blocks**: T15
- **Blocked By**: T1, T4

**References**:
- T1 validation work
- Yellow docs: https://docs.yellow.org/docs/protocol/off-chain/app-sessions

**Acceptance Criteria**:

```
# AC-1: Session creates
playwright: click "Start Session"
           → approve wallet transaction
           → assert "Session Active" badge visible

# AC-2: Off-chain action works
playwright: deploy an agent
           → assert balance decreases by 0.01
           → assert NO on-chain transaction for this action

# AC-3: Settlement works
playwright: click "End Session"
           → approve wallet transaction
           → assert TxID displayed
           → verify TxID exists on block explorer
```

**Commit**: YES
- Message: `feat(yellow): implement session lifecycle with off-chain actions`
- Files: `apps/web/lib/yellow/`, `apps/web/components/SessionProvider.tsx`
- Pre-commit: Session flow works

---

### - [ ] T14. Uniswap Swap Executor

**What to do**:
- Create swap executor using Universal Router patterns from T2
- Accept `TradeProposal` and execute swap
- Handle Permit2 approval flow
- Display transaction status and TxID
- Link TxID to block explorer
- Handle common errors (slippage, insufficient balance)

**Must NOT do**:
- Multi-hop routing
- LP management
- Custom hooks

**Recommended Agent Profile**:
- **Category**: `deep`
  - Reason: Complex v4 swap encoding
- **Skills**: `[]`
  - DeFi/Uniswap knowledge built-in

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential after T2, T4
- **Blocks**: T15
- **Blocked By**: T2, T4

**References**:
- T2 validation work
- Universal Router docs: https://docs.uniswap.org/contracts/universal-router/technical-reference

**Acceptance Criteria**:

```
# AC-1: Swap executes from proposal
playwright: approve a trade proposal in Council Room
           → assert wallet popup for swap transaction
           → approve transaction
           → assert "Swap Executing..." state

# AC-2: TxID displayed
playwright: after transaction confirms
           → assert TxID visible
           → click TxID link
           → assert new tab opens to Basescan

# AC-3: Balance updates
playwright: assert token balance changed after swap

# AC-4: Error handling
playwright: trigger insufficient balance error
           → assert user-friendly error message displayed
```

**Commit**: YES
- Message: `feat(uniswap): implement swap executor with universal router`
- Files: `apps/web/lib/uniswap/executor.ts`
- Pre-commit: Test swap works

---

### - [ ] T15. Proposal → Approve → Swap Flow

**What to do**:
- Wire together: agent proposal → council display → approve → swap
- Ensure state flows correctly through all components
- Add loading states for each step
- Handle errors at each step gracefully
- Test complete end-to-end flow

**Must NOT do**:
- Add new features
- Change existing logic
- Optimize performance

**Recommended Agent Profile**:
- **Category**: `unspecified-high`
  - Reason: Integration of multiple systems
- **Skills**: `[]`
  - Full-stack integration

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential after T10, T11, T13, T14
- **Blocks**: T19, T20
- **Blocked By**: T10, T11, T13, T14

**References**:
- All previous task implementations

**Acceptance Criteria**:

```
# FULL E2E FLOW:
playwright:
  1. Navigate to /app
  2. Connect wallet
  3. Start Yellow session
  4. Deploy an agent (off-chain fee charged)
  5. Enter Council Room
  6. Assert proposal from agent visible
  7. Click Approve
  8. Approve wallet transaction
  9. Assert TxID displayed
  10. End Yellow session
  11. Assert settlement TxID displayed
  → All steps pass
  → Screenshot: .sisyphus/evidence/t15-e2e-flow.png
```

**Commit**: YES
- Message: `feat: wire complete proposal-approve-swap flow`
- Files: Various integration points
- Pre-commit: E2E flow works

---

### - [ ] T16. Guest Mode

**What to do**:
- Create guest session with 10-minute expiry
- Use server-side Groq key (rate limited)
- Show timer in UI
- Warn at 2 minutes remaining
- Force logout at expiry with friendly message
- Prompt to connect wallet for full access

**Must NOT do**:
- Store guest data persistently
- Allow trading without wallet
- Extend session time

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Simple timer and session logic
- **Skills**: `[]`
  - React state management

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential after T11
- **Blocks**: T19
- **Blocked By**: T11

**References**:
- Interview: 10-minute demo sessions

**Acceptance Criteria**:

```
# AC-1: Guest mode starts without wallet
playwright: navigate to /app without connecting wallet
           → assert "Guest Mode" indicator visible
           → assert timer counting down

# AC-2: Agent proposals work in guest mode
playwright: request a proposal
           → assert proposal generated (using server key)

# AC-3: Warning at 2 minutes
playwright: wait until timer shows 2:00
           → assert warning toast appears

# AC-4: Logout at expiry
playwright: wait until timer reaches 0:00
           → assert "Session Expired" modal
           → assert redirected to landing page
```

**Commit**: YES
- Message: `feat: add guest mode with 10-minute session limit`
- Files: `apps/web/components/GuestMode.tsx`, `apps/web/app/api/agents/propose/route.ts`
- Pre-commit: Guest flow works

---

### - [ ] T17. Landing Page

**What to do**:
- Create hero section with "Agentropolis" title
- Add tagline and value proposition
- Add "Launch App" and "Docs" CTA buttons
- Include brief explanation (30 second read)
- Style with shadcn/ui + Tailwind
- Make visually appealing for demo video

**Must NOT do**:
- Add complex animations
- Build newsletter signup
- Create pricing tiers

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: Landing page design
- **Skills**: `['frontend-ui-ux']`
  - Visual design expertise

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential after T5
- **Blocks**: T20
- **Blocked By**: T5

**References**:
- shadcn/ui components: https://ui.shadcn.com/docs/components

**Acceptance Criteria**:

```
# AC-1: Hero renders
playwright: navigate to http://localhost:3000
           → assert "Agentropolis" visible
           → screenshot: .sisyphus/evidence/t17-landing.png

# AC-2: CTAs work
playwright: click "Launch App"
           → assert navigated to /app

playwright: click "Docs"
           → assert navigated to /docs

# AC-3: Visually appealing
# Manual verification: Screenshot looks professional for demo
```

**Commit**: YES
- Message: `feat: add landing page with hero and CTAs`
- Files: `apps/web/app/page.tsx`
- Pre-commit: Visual review

---

### - [ ] T18. Docs Page

**What to do**:
- Create documentation page for judges
- Explain what Agentropolis is and why it matters
- Document Yellow integration (session/off-chain/settlement)
- Document ENS integration (identity display)
- Document Uniswap v4 integration (agent proposals → execution)
- Include architecture diagram
- Link to repo and demo video

**Must NOT do**:
- Full API documentation
- Tutorial walkthroughs
- Complex diagrams

**Recommended Agent Profile**:
- **Category**: `writing`
  - Reason: Documentation focus
- **Skills**: `[]`
  - Technical writing

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential after T15
- **Blocks**: T20
- **Blocked By**: T15

**References**:
- Sponsor requirements from context.md

**Acceptance Criteria**:

```
# AC-1: Docs page exists
playwright: navigate to http://localhost:3000/docs
           → assert page loads without error
           → screenshot: .sisyphus/evidence/t18-docs.png

# AC-2: Sponsor sections present
playwright: assert text contains "Yellow"
           → assert text contains "Uniswap"
           → assert text contains "ENS"

# AC-3: Architecture diagram visible
playwright: assert image element visible

# AC-4: Repo link works
playwright: find GitHub link
           → assert href points to valid repo
```

**Commit**: YES
- Message: `docs: add documentation page for judges`
- Files: `apps/web/app/docs/page.tsx`
- Pre-commit: Content review

---

### - [ ] T19. Edge Case Handling

**What to do**:
- Handle wallet rejection gracefully
- Handle wrong chain with auto-switch prompt
- Handle Yellow ClearNode down (mock mode)
- Handle Groq timeout (fallback proposal)
- Handle insufficient balance (disable approve, show tooltip)
- Handle slippage exceeded (error message)
- Handle ERC-8004 RPC failure (fallback agents)

**Must NOT do**:
- Add new features
- Change happy path logic
- Add retry logic (keep simple)

**Recommended Agent Profile**:
- **Category**: `unspecified-high`
  - Reason: Edge case coverage
- **Skills**: `[]`
  - Error handling patterns

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential after T15, T16
- **Blocks**: T20
- **Blocked By**: T15, T16

**References**:
- Metis gap analysis edge cases

**Acceptance Criteria**:

```
# AC-1: Wallet rejection handled
playwright: start wallet connect → reject in MetaMask
           → assert "Connection cancelled" message
           → assert can retry

# AC-2: Wrong chain handled
playwright: connect on Ethereum mainnet
           → assert "Switch to Base Sepolia" prompt

# AC-3: Yellow offline handled
playwright: simulate ClearNode unreachable
           → assert "Yellow unavailable" message
           → assert can still use Uniswap features

# AC-4: Insufficient balance handled
playwright: try to approve swap with 0 balance
           → assert Approve button disabled
           → assert tooltip shows "Insufficient balance"
```

**Commit**: YES
- Message: `fix: handle edge cases and error states`
- Files: Various error handling additions
- Pre-commit: Edge case tests pass

---

### - [ ] T20. Demo Video

**What to do**:
- Record 2-3 minute demo video showing complete flow:
  1. Landing page overview
  2. Launch app, connect wallet (show ENS name)
  3. Start Yellow session
  4. Deploy agent from ERC-8004 registry
  5. Enter Council Room, see proposal
  6. Approve → execute Uniswap swap → show TxID
  7. End Yellow session → show settlement TxID
- Add narration or captions explaining each step
- Show TxIDs on block explorer as proof
- Export in submission-ready format

**Must NOT do**:
- Over-edit or add fancy transitions
- Make video longer than 3 minutes
- Skip any sponsor integration

**Recommended Agent Profile**:
- **Category**: `writing`
  - Reason: Script and narration
- **Skills**: `[]`
  - Demo presentation

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Sequential after T17, T18, T19
- **Blocks**: T21
- **Blocked By**: T17, T18, T19

**Acceptance Criteria**:

```bash
# AC-1: Video exists and is under 3 minutes
file demo-video.mp4
ffprobe -v error -show_entries format=duration demo-video.mp4
# Assert: Duration < 180 seconds

# AC-2: All sponsor integrations shown
# Manual verification: Video shows Yellow, Uniswap, ENS

# AC-3: TxIDs visible in video
# Manual verification: Can read transaction hashes
```

**Commit**: NO (video is external asset)

---

### - [ ] T21. Final Testing + Submission

**What to do**:
- Run complete E2E flow on fresh machine/browser
- Verify all acceptance criteria from previous tasks
- Prepare submission package:
  - README with setup instructions
  - Environment variable requirements
  - Demo video link
  - Deployed app URL (if applicable)
- Submit to hackathon platform
- Verify submission received

**Must NOT do**:
- Add last-minute features
- Change working code
- Delay submission

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Final verification
- **Skills**: `[]`
  - Standard checklist

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Final
- **Blocks**: None
- **Blocked By**: T20

**Acceptance Criteria**:

```bash
# AC-1: Fresh install works
git clone [repo] && cd agentropolis
bun install && bun run build
# Assert: No errors

# AC-2: All sponsor integrations functional
# Verify Yellow, Uniswap, ENS work in production build

# AC-3: Submission confirmed
# Assert: Hackathon platform shows submission received
```

**Commit**: YES
- Message: `chore: prepare for submission`
- Files: `README.md`, any final fixes
- Pre-commit: Full build succeeds

---

## Commit Strategy

| Phase | Tasks | Commit Message |
|-------|-------|----------------|
| Scaffold | T0 | `chore: scaffold turborepo with next.js and phaser` |
| Validation | T1-T3 | Individual commits per validation |
| Foundation | T4-T7 | Group related: wallet+ENS, types, phaser shell |
| Core | T8-T12 | Individual commits per feature |
| Integration | T13-T16 | Individual commits per integration |
| Polish | T17-T19 | Individual commits per task |
| Final | T21 | `chore: prepare for submission` |

---

## Success Criteria

### Verification Commands
```bash
# Build succeeds
bun run build

# App runs
bun run dev

# All sponsor features work
playwright run e2e/full-flow.spec.ts
```

### Final Checklist
- [ ] User can connect wallet and see ENS name
- [ ] Yellow session: create + action + settle works
- [ ] Agent from ERC-8004 registry deployable
- [ ] Council Room shows proposal with approve/reject
- [ ] Uniswap swap executes with TxID displayed
- [ ] Landing page looks professional
- [ ] Docs page explains all integrations
- [ ] Demo video is 2-3 minutes and shows all features
- [ ] Submission package is complete
