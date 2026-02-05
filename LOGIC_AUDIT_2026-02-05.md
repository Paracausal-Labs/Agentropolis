# Agentropolis Logic Audit (Working-As-Intended)
Date: 2026-02-05
Scope: Behavioral/logic correctness against intended product flow. Focus on Uniswap execution, strategy routing, and council proposal data.

## Summary
The core flow works for the demo, but several logic mismatches can cause swaps/LP actions to execute in ways that don’t align with the intended UX (“user approves then signs”, DCA semantics, numeric amounts, etc.). The largest gaps are in the Uniswap execution path and proposal data fidelity.

## Verified Fixes From Commit 04ef488
- Guest rate-limit header wiring now uses the same storage key as GuestMode and sends a stable session identifier.
  - `apps/web/components/game/scenes/CouncilScene.ts#L534`
- `/api/agents/list` fallback path now guards `NaN` limit.
  - `apps/web/app/api/agents/list/route.ts#L90`
- `expectedAmountOut` is validated (must be > 0).
  - `apps/web/lib/uniswap/executor.ts#L238`
- `apps/web/lib/yellow/client.ts` changes are committed (dynamic clearnode config fetch).

## Findings (Logic / Working-As-Intended)
### Uniswap Execution
1. **Swap executes “successfully” without a connected wallet.**
   - Impact: UI shows a tx hash even when the user did not sign. This violates the intended “user approves + signs” flow.
   - Evidence: `apps/web/lib/uniswap/executor.ts#L193-L212` returns a random tx hash when `walletClient` is missing (and when mock is disabled).
   - Recommendation: If `NEXT_PUBLIC_UNISWAP_MOCK` is false and `walletClient` is missing, return an error instead of a mock tx.

2. **DCA is not implemented and is executed as a single swap.**
   - Impact: Users who request “DCA” will get a one-shot swap, not scheduled buys.
   - Evidence: `apps/web/lib/uniswap/strategy-router.ts#L16-L45` only branches for LP; everything else routes to swap.
   - Recommendation: Either implement DCA scheduling or block DCA proposals with a user-visible message.

3. **Proposal `action` field doesn’t match strategy for non-swap types.**
   - Impact: DCA and LP proposals are labeled `rebalance` instead of `dca` or `lp_*`. This can mislead downstream consumers.
   - Evidence: `apps/web/lib/agents/council.ts#L827` sets `action` to `rebalance` for all non-swap strategies.
   - Recommendation: Set `action` consistently with `strategyType` (or remove `action` if unused).

4. **Expected output is ambiguous and can be non-numeric, which now hard-fails swaps.**
   - Impact: LLM proposals often include text like “~15% APY” or “165 USDC”; this fails `parseUnits` and is rejected by new validation.
   - Evidence:
     - Prompt allows “expected output or APY”: `apps/web/lib/agents/council.ts#L512-L517`.
     - Mock synthesis uses `~15% APY`: `apps/web/lib/agents/council.ts#L740-L746`.
     - Validation now requires numeric: `apps/web/lib/uniswap/executor.ts#L229-L240`.
   - Recommendation: Enforce numeric-only outputs in prompts for swap paths, or sanitize/strip units before parsing.

5. **Amounts are parsed strictly and fail on strings with symbols or annotations.**
   - Impact: If LLM outputs “0.05 ETH” or “165 USDC”, swaps fail with `Invalid amountIn`/`expectedAmountOut`.
   - Evidence: `apps/web/lib/uniswap/executor.ts#L225-L240` uses `parseUnits` and falls back to `BigInt`, which fails on non-numeric strings.
   - Recommendation: Sanitize to numeric tokens before parse, or validate earlier and request re-generation.

6. **Chain mismatch risk: txs can be sent on the wrong chain.**
   - Impact: If the wallet is not on Base Sepolia, txs may fail or go to the wrong network (addresses are Base Sepolia constants).
   - Evidence: `apps/web/lib/uniswap/executor.ts#L216-L220` uses `walletClient.chain` for tx writes without enforcing Base Sepolia.
   - Recommendation: Guard on `chain.id === 84532` before executing, or auto-switch.

7. **No on-chain quoting; `expectedAmountOut` is AI-derived.**
   - Impact: Slippage/min-out can be wildly off. This can cause reverts or poor pricing.
   - Evidence: `computeMinAmountOut` uses `proposal.expectedAmountOut` directly; no Quoter/simulation path exists.
   - Recommendation: Use a Quoter or simulate in `publicClient` to derive expected output.

### LP Execution
8. **Liquidity math is placeholder and uses the same amount for USDC and WETH.**
   - Impact: Liquidity amounts are unrealistic and likely revert or create unintended positions.
   - Evidence:
     - Same amount used for both tokens: `apps/web/lib/uniswap/lp-executor.ts#L192-L193`.
     - Liquidity is set equal to `amount0Desired` with TODO: `apps/web/lib/uniswap/lp-executor.ts#L146`.
   - Recommendation: Compute proper liquidity using pool price and ticks (SqrtPriceMath), or restrict LP to mock mode.

9. **LP mock success even without wallet.**
   - Impact: Same as swap: UI can show success without a user signature if `walletClient` is missing.
   - Evidence: `apps/web/lib/uniswap/lp-executor.ts#L168-L180` returns a mock tx when `walletClient` is missing.

### Council / Intent Alignment
10. **Council context uses a fixed balance instead of real user data.**
   - Impact: Recommendations may be unrealistic. It undercuts the intended “personalized strategy” experience.
   - Evidence: `apps/web/components/game/scenes/CouncilScene.ts#L553-L555` uses `balance: '0.1 ETH'`.
   - Recommendation: Use wallet/session data (or at least ytest.USD) from `window.agentropolis` or session state.

11. **`deployedAgents` are not used server-side.**
   - Impact: The “council of deployed agents” narrative is only visual; it does not affect deliberation.
   - Evidence: `apps/web/app/api/agents/council/route.ts` passes `deployedAgents`, but `runCouncilDeliberation` ignores it.
   - Recommendation: Incorporate deployed agents into prompt selection or routing.

## Notes
- Token launch remains mock-only on the server route. This is acceptable for hackathon scope but still a logic gap for “working as intended”.
- BYOA endpoint is stored in ENS but not wired into gameplay (still a known gap).

## Suggested Priority
1. Enforce wallet + chain checks before executing swap/LP.
2. Normalize proposal numeric fields (`amountIn`, `expectedAmountOut`).
3. Decide how to handle DCA (implement or block).
4. Decide whether LP is demo-only; if real, implement liquidity math.
