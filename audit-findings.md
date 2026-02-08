# Agentropolis Audit Findings (2026-02-08)

## 1) Executive Summary

**Judge-readiness score (1-10): 7.5/10**

**Before fixes**, the repo had two judge-killer issues: (1) swaps executed with **zero slippage protection** (`minAmountOut = 0n`) and (2) a **tracked env file** (`apps/web/.env.local`) that could lead to secrets being committed. **Both are fixed in the current working tree**.

**Remaining risks** are mostly around “demo-grade” server protections (in-memory rate limiting, permissive BYOA endpoint allowlist) and dead-code noise (Phaser + `apps/web-3d/`).

### Verification (Run Locally)
- `bun run type-check`: PASS
- `bun run lint`: PASS (warnings remain)
- `bun run build`: PASS (warnings remain)
- `forge test`: PASS (30 tests; includes new ownership-transfer tests)

---

## 2) Findings Table

| Severity | Category | Location | Summary | Effort |
|---|---|---|---|---|
| CRITICAL | security | `apps/web/lib/uniswap/executor.ts:313` | Swap execution had `minAmountOut = 0` (no slippage protection). Fixed to compute `minAmountOut` from quote/expected + slippage. | small |
| CRITICAL | security | `apps/web/.env.local` (tracked) | Tracked `.env.local` is a submission risk and can lead to secret leakage. Fixed by deleting tracked file + adding `apps/web/.env.example`. | trivial |
| HIGH | security | `apps/web/app/api/agents/council/route.ts:21` | Rate limiting keys were user-controlled (`X-User-Address`), enabling easy bypass. Fixed by validating addresses and keying limits by IP + address. | small |
| HIGH | security | `apps/web/app/api/agents/metadata/route.ts:12` | Metadata POST had no auth/rate/size/schema and stored arbitrary data in memory. Fixed by disabling writes in production + adding limits/allowlist. Still ephemeral. | small |
| HIGH | security | `apps/web/lib/agents/council.ts:255` | BYOA endpoint allowlist allowed `*.vercel.app` etc; plus no DNS rebinding protection. Fixed by resolving DNS and blocking private/reserved IPs and disabling redirects. Still allows attacker-controlled public endpoints by design. | medium |
| MEDIUM | integration | `apps/web/lib/uniswap/executor.ts:492` | ERC20/Permit2 approvals were effectively infinite and receipts had no explicit timeout. Fixed to approve exact amount and use 120s receipt timeouts. | small |
| MEDIUM | correctness | `apps/web/next.config.js` | Invalid Next config key `api.bodyParser` (App Router ignores it). Fixed by removing the key; body limits enforced per-route. | trivial |
| MEDIUM | build | `apps/web/app/layout.tsx` | `next/font/google` fetch broke offline builds. Fixed by removing Google font fetch and adding a local CSS fallback. | trivial |
| MEDIUM | security | `apps/web/middleware.ts` | Missing baseline security headers. Fixed with middleware adding XFO/nosniff/referrer-policy, etc. | small |
| MEDIUM | ux | `apps/web/app/error.tsx`, `apps/web/app/not-found.tsx` | Missing `error.tsx`/`not-found.tsx` for App Router. Fixed. | trivial |
| LOW | performance/ux | `apps/web` (many files) | ~200 `console.*` calls remain; judges may view as sloppy. | small |
| INFO | dead-code | `apps/web-3d/`, `apps/web/components/game/scenes/*.ts`, `apps/web/components/game/PhaserGame.tsx` | Multiple unused/legacy stacks (Phaser + empty `web-3d`) likely safe to remove before submission. | medium |

---

## 3) Detailed Findings

### [CRITICAL] Zero Slippage Protection On-Chain (minAmountOut = 0)
- **Location**: `apps/web/lib/uniswap/executor.ts:313`
- **Category**: security | integration | correctness
- **Description**: Swaps were built with `minAmountOut = 0n`, meaning **no slippage protection**. Any MEV / price movement could drain output, and judges will flag this immediately.
- **Impact**: Core Uniswap swap flow is “unsafe by default” and can be rejected as irresponsible even on testnet.
- **Fix**: Compute `minAmountOut` from a conservative baseline (min of quote output and proposal expected output) and apply `slippageBps`. Implemented in `buildExecutionPlan()` (see `apps/web/lib/uniswap/executor.ts:313`) and enforced in the encoded V4 swap action.
- **Effort**: small

### [CRITICAL] Tracked `.env.local` File (Secret Leakage / Submission Risk)
- **Location**: `apps/web/.env.local` (tracked file; now removed)
- **Category**: security
- **Description**: A tracked env file is a classic “judge red flag.” Even if it only contains toggles, it normalizes committing env files and increases the chance of private keys/API keys being committed.
- **Impact**: Immediate credibility hit; potential secret compromise; potential disqualification depending on rules.
- **Fix**: Delete tracked `apps/web/.env.local` and replace with `apps/web/.env.example` containing placeholders. Done in current tree.
- **Effort**: trivial

### [HIGH] Rate Limit Bypass Via Spoofable `X-User-Address`
- **Location**: `apps/web/app/api/agents/council/route.ts:21`, `apps/web/app/api/agents/propose/route.ts:57`, `apps/web/app/api/agents/launch-token/route.ts:67`
- **Category**: security
- **Description**: Rate limiting was keyed by `X-User-Address` which was not validated and entirely client-controlled (rotate header values to bypass).
- **Impact**: Abuse vector (cost/LLM spam), undermines “auth vs guest” separation, and is easy for judges to spot.
- **Fix**: Validate `X-User-Address` as a real EVM address and key rate limits by IP + address. Implemented via `apps/web/lib/security/request.ts` and `apps/web/lib/security/rateLimit.ts`, used by the routes (see `apps/web/app/api/agents/council/route.ts:52`).
- **Effort**: small

### [HIGH] `/api/agents/metadata` Was Unauthenticated Arbitrary Storage (and Ephemeral)
- **Location**: `apps/web/app/api/agents/metadata/route.ts:12`
- **Category**: security | correctness
- **Description**: `POST` accepted arbitrary JSON, no size cap, no schema validation, no auth; data stored in `globalThis` Map (lost on restart).
- **Impact**: Trivial abuse (memory growth), inconsistent behavior (metadata disappears), judges can label this “fake storage”.
- **Fix**: Disable metadata writes in production unless `AGENT_METADATA_ALLOW_POST=true`, add 8KB body limit + allowlist + rate limit. Still ephemeral by design; best long-term fix is storing metadata off-chain (IPFS/Arweave) or embedding a `data:` URI.
- **Effort**: small

### [HIGH] BYOA SSRF Allowlist Too Permissive (and Needed DNS Checks)
- **Location**: `apps/web/lib/agents/council.ts:118`, `apps/web/lib/agents/council.ts:255`
- **Category**: security
- **Description**: Allowlisting `*.vercel.app` (and similar) permits attacker-controlled endpoints. Additionally, hostname allowlists without resolution checks are vulnerable to DNS rebinding.
- **Impact**: Potential SSRF and data exfiltration; “security posture” hit with judges.
- **Fix**: Add DNS resolution checks and block private/reserved ranges, reject credentialed URLs, and disable redirects on fetch. Implemented in `apps/web/lib/agents/council.ts:181` and used in `callExternalAgent()` (`apps/web/lib/agents/council.ts:270`).
- **Effort**: medium

### [MEDIUM] Permit2/Router Approvals and Receipt Waiting Were Too Loose
- **Location**: `apps/web/lib/uniswap/executor.ts:492`
- **Category**: security | integration
- **Description**: ERC20 approval was unlimited and receipt waits were implicit defaults.
- **Impact**: Approval blast radius if a spender is compromised; UX hangs longer than expected.
- **Fix**: Approve exact `amountIn` to Permit2 (with optional zero-reset), Permit2 approve exact amount with 24h expiration, and add explicit `waitForTransactionReceipt(..., timeout: 120_000)`. See `apps/web/lib/uniswap/executor.ts:492`.
- **Effort**: small

### [MEDIUM] Invalid Next.js Config Key (`api.bodyParser`)
- **Location**: `apps/web/next.config.js`
- **Category**: correctness | build
- **Description**: `api.bodyParser` is not a valid option for the App Router; Next warns and ignores it.
- **Impact**: False sense of protection; judges will notice config warnings.
- **Fix**: Remove the invalid key; enforce limits in route handlers (e.g., `readJsonWithLimit` in `apps/web/app/api/agents/council/route.ts:76`).
- **Effort**: trivial

### [MEDIUM] Offline Build Failure via `next/font/google`
- **Location**: `apps/web/app/layout.tsx:1`
- **Category**: build
- **Description**: `next/font/google` fetches fonts at build time; offline/locked-down judge environments can fail builds.
- **Impact**: “Repo doesn’t build” is a hard fail.
- **Fix**: Remove Google font fetch and add an offline-safe fallback in `apps/web/app/globals.css:18`.
- **Effort**: trivial

### [MEDIUM] Missing Security Headers Middleware
- **Location**: `apps/web/middleware.ts`
- **Category**: security
- **Description**: No baseline hardening headers (XFO, nosniff, referrer policy, etc.).
- **Impact**: Judges may flag as “web app security basics missing.”
- **Fix**: Added middleware that sets headers and adds HSTS in production/https (see `apps/web/middleware.ts:1`).
- **Effort**: small

### [MEDIUM] Missing `error.tsx` / `not-found.tsx`
- **Location**: `apps/web/app/error.tsx`, `apps/web/app/not-found.tsx`
- **Category**: ux | correctness
- **Description**: App Router lacked standard error and not-found routes.
- **Impact**: Unhandled runtime errors can blank the app, which is lethal during demos.
- **Fix**: Added basic `error.tsx` and `not-found.tsx`.
- **Effort**: trivial

### [LOW] Excessive `console.*` Noise
- **Location**: `apps/web/**` (approx 200+ hits)
- **Category**: ux | polish
- **Description**: Many `console.log/warn/error` across UI and libs.
- **Impact**: Judges perceive “prototype quality” and it obscures real errors during demo.
- **Fix**: Gate logs behind `NODE_ENV !== 'production'` or a `DEBUG` flag; remove spammy logs in hot paths.
- **Effort**: small

### [INFO] Dead / Legacy Code Present
- **Location**: `apps/web-3d/next-env.d.ts`, `apps/web/components/game/PhaserGame.tsx`, `apps/web/components/game/scenes/CityScene.ts`, `apps/web/components/game/scenes/CouncilScene.ts`, `apps/web/components/game/scenes/MainScene.ts`
- **Category**: dead-code
- **Description**: The repo contains an unused Next app (`web-3d`) and a full Phaser implementation alongside React Three Fiber.
- **Impact**: Judges will ask why it exists; increases review surface and risk.
- **Fix**: Remove before submission or clearly document why it remains and confirm it is unused.
- **Effort**: medium

---

## 4) Integration Verification (Sponsor Tracks)

### Uniswap V4: **REAL**
- Hooks exist and are deployed (addresses in `audit.md`), hook-updater sends real txs (`apps/web/lib/uniswap/hook-updater.ts:112`), and swaps execute via Universal Router (`apps/web/lib/uniswap/executor.ts:547`).
- Critical slippage protection is now present.

### Yellow Network: **PARTIAL (likely real, needs one crisp proof path)**
- Nitrolite SDK is wired in; however, there are multiple `as unknown as` casts and fallback behaviors that can mask failures.
- For judges: add a deterministic “happy path” script/log sequence proving channel open, off-chain transfer, and settlement.

### ENS: **PARTIAL**
- ENS read/write flows exist, but they are on **Sepolia** and require chain switching; judges may not have testnet ENS names.
- The council route does pull ENS text records to influence behavior (risk/tokens/endpoint) (see `apps/web/app/api/agents/council/route.ts:136`).

---

## 5) Dead Code Report (Remove Before Submission)

Candidates that look safe to delete or quarantine:
- `apps/web-3d/` (empty)
- `apps/web/components/game/PhaserGame.tsx` + `apps/web/components/game/scenes/*` (legacy engine)
- Deprecated Yellow client exports (e.g. `connectToClearnode()` in `apps/web/lib/yellow/client.ts`)

If you keep any of this, add a one-line note in `README.md` explaining it is legacy/not used.

---

## 6) Quick Wins (< 30 minutes)

1. Remove/flag most `console.log` in UI hot paths (keep only error logs).
2. Add a single “Integration Proof” doc section in `README.md` with:
   - hook update tx hashes
   - swap tx hashes
   - Yellow channel open + settlement references
   - ENS record keys used
3. Replace wildcard BYOA allowlist with an env-driven allowlist (comma-separated hostnames) for the judging build.

---

## 7) Do Not Touch (High Risk of Breaking Demo)

- Uniswap V4 command encoding and swap action ordering in `apps/web/lib/uniswap/executor.ts`
- Hook contract addresses and RPC wiring in `apps/web/lib/uniswap/constants.ts`
- Yellow session lifecycle code paths (unless you have a full end-to-end test script ready)

