# Agentropolis Full Audit Findings (for Handoff)

Date: 2026-02-05
Audited against: `AUDIT_CONTEXT.md`
Scope: `apps/web/**`, `packages/shared/**` (no contract source present in `packages/contracts`)

## How this audit was performed
- Read `AUDIT_CONTEXT.md` end-to-end.
- Static review of critical paths: Uniswap execution, Yellow channels, council/orchestration APIs, ENS/BYOA, Phaser scene flow.
- Ran verification commands:
  - `bun run type-check` (pass)
  - `bun run lint` (pass with warnings)
  - `bun run build` (pass with multiple warnings/logged runtime issues)

## Executive summary
The codebase is feature-rich but still has several **execution-path and security-critical gaps** that will impact a real demo:
- Critical: unsafe external endpoint handling (SSRF risk), Yellow settlement flow bug, and false-positive off-chain transfer success path.
- High: strategy execution mismatch (LP/token-launch proposals are not wired to executors), BYOA not actually connected to council calls, and LP executor likely malformed for v4 position minting.
- Medium: retry loops, scene lifecycle bugs, and weak input validation causing flaky behavior.

---

## Findings

### C-01 — SSRF risk via unvalidated `agentEndpoint` + no timeout
- Severity: **Critical**
- Impact: API callers can make your server fetch arbitrary endpoints (including internal/private services), and requests can hang indefinitely.
- Evidence:
  - `apps/web/app/api/agents/council/route.ts:88`
  - `apps/web/lib/agents/council.ts:91`
  - `apps/web/lib/agents/council.ts:101`
- Notes: No URL allowlist/denylist, no protocol filtering, no timeout/abort signal, no response size limit.
- Fix direction:
  - Validate URL (`https` only), block private CIDRs/localhost, enforce hostname allowlist (or signed BYOA registry), add request timeout and byte limits.

### C-02 — Yellow `closeChannel()` closes socket before sending `close_channel`
- Severity: **Critical**
- Impact: Session can be marked settled in UI without actually performing close handshake/settlement request.
- Evidence:
  - `apps/web/lib/yellow/channel.tsx:401`
  - `apps/web/lib/yellow/channel.tsx:408`
  - `apps/web/lib/yellow/channel.tsx:443`
- Notes: `ws` is nulled, then guarded branch `if (state.channelId && ws)` never executes.
- Fix direction:
  - Send `close_channel` first (or use SDK close primitive), await ack/tx hash, then close socket and transition state.

### C-03 — Yellow off-chain transfer reports success even if SDK transfer method is absent
- Severity: **Critical**
- Impact: Balance can decrement locally while no real off-chain transfer was executed.
- Evidence:
  - `apps/web/lib/yellow/channel.tsx:368`
  - `apps/web/lib/yellow/channel.tsx:376`
  - `apps/web/lib/yellow/channel.tsx:383`
- Notes: Optional chaining on `transfer?.(...)` + unconditional success return path.
- Fix direction:
  - Require explicit transfer call success; if method unavailable or response invalid, return failure and do not mutate balance.

### H-01 — Strategy execution path ignores proposal strategy type
- Severity: **High**
- Impact: LP proposals are still routed to swap executor; token-launch proposals are not executed through clanker path.
- Evidence:
  - `apps/web/components/SwapHandler.tsx:24`
  - `apps/web/lib/uniswap/strategy-router.ts` (exists but not used by runtime handlers)
- Fix direction:
  - Replace swap-only listener with strategy router listener and branch for token launch events.

### H-02 — Token launch approval event is emitted but never handled
- Severity: **High**
- Impact: Council shows “Launching token...” but no launch transaction path runs.
- Evidence:
  - `apps/web/components/game/scenes/CouncilScene.ts:785`
  - `apps/web/components/game/GameComponent.tsx:70`
- Notes: `GameComponent` only handles `openCouncil` event.
- Fix direction:
  - Add `tokenLaunchApproved` listener to call clanker launch flow and surface tx result.

### H-03 — External proposal union is force-cast to `TradeProposal`
- Severity: **High**
- Impact: External token-launch proposal can be mis-cast and crash/execute wrong path downstream.
- Evidence:
  - `apps/web/lib/agents/council.ts:130`
  - `apps/web/lib/agents/council.ts:136`
  - `apps/web/lib/agents/council.ts:673`
- Fix direction:
  - Use discriminated union checks (`strategyType`/`action`) and return typed route-specific responses.

### H-04 — Council seats ignore deployed agents passed from city
- Severity: **High**
- Impact: Core “deployed agents in council” UX is not reflected; council always uses fixed internal personas.
- Evidence:
  - `apps/web/components/game/scenes/CityScene.ts:365`
  - `apps/web/components/game/GameComponent.tsx:70`
  - `apps/web/components/game/scenes/CouncilScene.ts:87`
  - `apps/web/components/game/scenes/CouncilScene.ts:142`
- Notes: `init(data.agents)` stores seats, but `placeSeats` never uses `this.seats`.
- Fix direction:
  - Merge deployed agents into seat render logic and request payload context.

### H-05 — BYOA endpoint is saved in ENS but not sent from council UI/API caller
- Severity: **High**
- Impact: BYOA feature is mostly non-functional in gameplay path.
- Evidence:
  - `apps/web/components/AgentSettings.tsx:45` (writes endpoint)
  - `apps/web/components/game/scenes/CouncilScene.ts:523` (request body lacks `agentEndpoint`)
- Fix direction:
  - Load ENS endpoint client-side and pass it to `/api/agents/council` requests.

### H-06 — Guest-mode API rate limits are effectively bypassed in UI path
- Severity: **High**
- Impact: Guest traffic is not throttled as intended; API limits only apply when header is present.
- Evidence:
  - `apps/web/app/api/agents/council/route.ts:36`
  - `apps/web/components/game/scenes/CouncilScene.ts:521` (no `X-Guest-Session` header)
- Fix direction:
  - Attach guest session header from `localStorage` in all guest API calls.

### H-07 — LP executor parameterization likely invalid for production v4 mint
- Severity: **High**
- Impact: LP tx likely reverts or creates unintended positions.
- Evidence:
  - `apps/web/lib/uniswap/lp-executor.ts:190` (same `amountIn` used for USDC and WETH)
  - `apps/web/lib/uniswap/lp-executor.ts:146` (`liquidity` set equal to `amount0Desired`)
- Notes: LP liquidity should be derived from price/ticks and token amounts, not raw amount0.
- Fix direction:
  - Compute token0/token1 desired amounts from proposal schema explicitly and derive liquidity using v4-compatible math/helpers.

### M-01 — Council deliberation has unbounded auto-retry loop on failure
- Severity: **Medium**
- Impact: Persistent API/network issues can hammer backend indefinitely from client.
- Evidence:
  - `apps/web/components/game/scenes/CouncilScene.ts:561`
  - `apps/web/components/game/scenes/CouncilScene.ts:563`
- Fix direction:
  - Add capped retries + backoff + explicit user retry CTA.

### M-02 — City scene can duplicate deployed agents across scene restarts
- Severity: **Medium**
- Impact: Agent counts/state drift after repeated City↔Council transitions.
- Evidence:
  - `apps/web/components/game/scenes/CityScene.ts:67`
  - `apps/web/components/game/scenes/CityScene.ts:120`
  - `apps/web/components/game/scenes/CityScene.ts:136`
- Notes: `deployedAgents` is not reset before reloading storage.
- Fix direction:
  - Clear scene-local arrays/state in `create()` or `shutdown` handler before loading persisted agents.

### M-03 — Proposal card hidden after rejection and not re-shown
- Severity: **Medium**
- Impact: Subsequent deliberation results may not appear after first rejection.
- Evidence:
  - `apps/web/components/game/scenes/CouncilScene.ts:805`
  - `apps/web/components/game/scenes/CouncilScene.ts:619`
- Notes: `setVisible(false)` in reset path; display path does not restore visibility.
- Fix direction:
  - Ensure `displayProposal()` sets card visible.

### M-04 — Swap execution does not reject invalid/zero parsed amounts
- Severity: **Medium**
- Impact: Invalid proposal data can proceed to on-chain call and fail late.
- Evidence:
  - `apps/web/lib/uniswap/executor.ts:83`
  - `apps/web/lib/uniswap/executor.ts:225`
  - `apps/web/lib/uniswap/executor.ts:267`
- Fix direction:
  - Validate `amountIn > 0`, `expectedAmountOut > 0`, and `deadline > now` before approval/write.

### M-05 — Chain UX conflict: app nudges Base Sepolia while ENS save requires Ethereum Sepolia
- Severity: **Medium**
- Impact: Users get contradictory chain prompts.
- Evidence:
  - `apps/web/components/ConnectButton.tsx:14`
  - `apps/web/components/ConnectButton.tsx:39`
  - `apps/web/components/UserIdentity.tsx:32`
- Fix direction:
  - Separate “trading chain” and “ENS chain” flows or make ENS writes explicit with chain switch helper.

### M-06 — `/api/agents/list` input handling and build-time behavior need hardening
- Severity: **Medium**
- Impact: `limit` can become `NaN`; build logs show dynamic server usage warnings for this route.
- Evidence:
  - `apps/web/app/api/agents/list/route.ts:75`
  - `apps/web/app/api/agents/list/route.ts:87`
- Fix direction:
  - Sanitize/guard `limit` parsing and mark route dynamic explicitly if intended.

### L-01 — Header duplication: `UserIdentity` rendered twice when connected
- Severity: **Low**
- Impact: UI redundancy and avoidable render cost.
- Evidence:
  - `apps/web/components/AppPageContent.tsx:23`
  - `apps/web/components/ConnectButton.tsx:42`
- Fix direction:
  - Keep `UserIdentity` in one place.

### L-02 — Build warnings to clean before demo
- Severity: **Low**
- Impact: No immediate breakage, but noisy CI/demo builds and potential runtime edge cases.
- Evidence (from `bun run build` output):
  - Phaser default import warnings from:
    - `apps/web/components/game/scenes/CityScene.ts:1`
    - `apps/web/components/game/scenes/CouncilScene.ts:1`
    - `apps/web/components/game/GameComponent.tsx:4`
  - MetaMask SDK optional dependency warning via wagmi connectors.
- Fix direction:
  - Align Phaser import style with package exports and trim connector/dependency surface.

---

## Additional architecture gaps vs intended product
- `deployedAgents` field is currently dead in council backend flow (`apps/web/lib/agents/council.ts:87` only declaration).
- x402 client path exists but is not wired into active council request path from the Phaser UI.
- Token launch API route currently depends on `NEXT_PUBLIC_CLANKER_MOCK` in server logic (`apps/web/app/api/agents/launch-token/route.ts:131`), which is not ideal for server-only behavior.

---

## Priority fix order (recommended)
1. C-01, C-02, C-03 (security + false-success correctness).
2. H-01, H-02, H-07 (execution path integrity for strategy/token-launch).
3. H-04, H-05, H-06 (core product wiring: council realism, BYOA, guest control).
4. M-01, M-02, M-03, M-04, M-05, M-06 (stability and UX correctness).
5. L-01, L-02 (polish).

