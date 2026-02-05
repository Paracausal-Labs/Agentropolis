# Agentropolis Audit Verification Report
Date: 2026-02-05
Scope: Verify fixes from `AUDIT_FINDINGS_2026-02-05.md` + quick pass for remaining gaps.

## Summary
- Verified: 12 items
- Partial: 4 items
- Not completed: 2 items

## Verification Matrix
| ID | Status | Evidence |
| --- | --- | --- |
| C-01 | Verified | SSRF protections added in `apps/web/lib/agents/council.ts` (allowlist, private IP block, HTTPS requirement, timeout, response size checks). |
| C-02 | Verified | `close_channel` RPC sent before WebSocket close in `apps/web/lib/yellow/channel.tsx`. |
| C-03 | Verified | `executeOffChainTransfer` now fails if `transfer` is missing or returns no `txId` in `apps/web/lib/yellow/channel.tsx`. |
| H-01 | Verified | `SwapHandler` now uses `useStrategyExecutor` in `apps/web/components/SwapHandler.tsx`. |
| H-02 | Partial | `tokenLaunchApproved` event is handled in `apps/web/components/game/GameComponent.tsx`, but the server route only succeeds when `NEXT_PUBLIC_CLANKER_MOCK=true`. Real launch path still returns 400. See `apps/web/app/api/agents/launch-token/route.ts#L131`. |
| H-03 | Verified | `isTradeProposal` guard + safe fallback added in `apps/web/lib/agents/council.ts`. |
| H-04 | Verified | Council seats now render deployed agent names in `apps/web/components/game/scenes/CouncilScene.ts`. |
| H-05 | Not completed | BYOA endpoint not wired end-to-end: `CouncilScene` pulls `agentEndpoint` from localStorage, but `AgentSettings` only writes to ENS. No bridging between ENS config and council requests. See `apps/web/components/game/scenes/CouncilScene.ts#L539` and `apps/web/components/AgentSettings.tsx#L45`. |
| H-06 | Not completed | Guest header wiring is broken: `CouncilScene` reads `guestSessionId` from localStorage, but `GuestMode` writes `agentropolis_guest_session`. No `X-Guest-Session` header in council calls. See `apps/web/components/game/scenes/CouncilScene.ts#L534` and `apps/web/components/GuestMode.tsx#L6`. |
| H-07 | Partial | LP executor still uses `amount0Desired` as liquidity and uses the same amount for USDC and WETH. See `apps/web/lib/uniswap/lp-executor.ts#L146` and `apps/web/lib/uniswap/lp-executor.ts#L192`. |
| M-01 | Verified | Retry cap + backoff added in `apps/web/components/game/scenes/CouncilScene.ts`. |
| M-02 | Verified | `deployedAgents` cleared before reloading in `apps/web/components/game/scenes/CityScene.ts`. |
| M-03 | Verified | Proposal card now re-shown in `displayProposal()` in `apps/web/components/game/scenes/CouncilScene.ts`. |
| M-04 | Partial | `amountIn` and deadline validated, but `expectedAmountOut` can still be zero and is not checked. See `apps/web/lib/uniswap/executor.ts#L225`. |
| M-05 | Verified | Chain UX note added in `apps/web/components/ConnectButton.tsx`. |
| M-06 | Partial | `limit` parsing fixed on happy path, but error fallback still uses raw `parseInt` without `NaN` guard. See `apps/web/app/api/agents/list/route.ts#L90`. |
| L-01 | Verified | Duplicate `UserIdentity` removed from `apps/web/components/AppPageContent.tsx`. |
| L-02 | Verified | Phaser imports changed to namespace in city/council/game components. |

## Remaining Gaps And Action Items
1. Fix guest rate-limit headers end-to-end.
   - `CouncilScene` must read the same key as `GuestMode` (`agentropolis_guest_session`) or store a separate guest session id. Current key mismatch prevents `X-Guest-Session` header from being sent. See `apps/web/components/game/scenes/CouncilScene.ts#L534` and `apps/web/components/GuestMode.tsx#L6`.

2. BYOA endpoint not actually used by gameplay path.
   - `CouncilScene` expects `agentEndpoint` in localStorage, but `AgentSettings` saves endpoint only to ENS. No code copies ENS text record into localStorage or passes it into council requests. See `apps/web/components/game/scenes/CouncilScene.ts#L539` and `apps/web/components/AgentSettings.tsx#L45`.

3. Token launch still mock-only via API.
   - `GameComponent` calls `/api/agents/launch-token`, but that route hard-fails unless `NEXT_PUBLIC_CLANKER_MOCK=true`. See `apps/web/app/api/agents/launch-token/route.ts#L131`.

4. LP executor still non-production.
   - Liquidity math remains TODO and the USDC/WETH amounts are both derived from `proposal.amountIn`. See `apps/web/lib/uniswap/lp-executor.ts#L146` and `apps/web/lib/uniswap/lp-executor.ts#L192`.

5. `/api/agents/list` error fallback can return `NaN` limit.
   - In the catch branch, `parseInt` is not guarded; `Math.min(NaN, 50)` yields `NaN`, and `slice(0, NaN)` returns empty. See `apps/web/app/api/agents/list/route.ts#L90`.

6. `expectedAmountOut` not validated.
   - `executeSwap` checks `amountIn` and deadline but never rejects a zero/invalid `expectedAmountOut`. See `apps/web/lib/uniswap/executor.ts#L229`.

7. Council backend ignores `deployedAgents`.
   - The council API accepts `deployedAgents`, but `runCouncilDeliberation` does not use it to influence prompts or seat logic. This remains a feature gap vs the intended BYOA/city narrative. See `apps/web/lib/agents/council.ts` and `apps/web/app/api/agents/council/route.ts`.

8. Uncommitted change present in repo.
   - `apps/web/lib/yellow/client.ts` has local edits (clearnode config fetch + async client creation) that are not committed. Decide to commit or revert.

## Build And Lint Status
- `bun run type-check`: PASS
- `bun run build`: PASS with warnings
  - MetaMask SDK warning: missing `@react-native-async-storage/async-storage` from `@metamask/sdk` dependency tree.
  - `@next/next/no-img-element` warning in `apps/web/components/UserIdentity.tsx#L67`.
- `bun run lint`: PASS with same `no-img-element` warning.

## Notes
- The SSRF guard now uses a strict allowlist, which may block legitimate BYOA endpoints unless they’re hosted on the allowed domains.
- Guest sessions currently store a JSON object, not a stable session id. If you decide to use it as the `X-Guest-Session` key, rate limiting will still work but with a long key string.
