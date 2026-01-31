Below is a **ready-to-paste `context.md`** for your local coding agent (clean, structured, implementation-focused), based exactly on what you wrote — just organized and tightened.

---

# Agentropolis — Context (HackMoney 2026)

**Date today:** Jan 31, 2026
**Submission deadline:** Feb 8, 2026 — **10:30 PM IST**
**Project name:** **Agentropolis**
**One-liner:** *Build a city of agents, approve their plans, execute trades on-chain.*

## What Agentropolis is

Agentropolis is a **gamified DeFi trading platform** presented as a **city-builder**. Users “deploy” AI agents as characters/buildings in a living city. These agents collaborate like a **swarm** and propose trading actions. The user reviews proposals inside a “Council Room” (a central building with a roundtable UI) and can **approve** or **reject** them. Approved plans execute **real on-chain trades** (Uniswap v4), while high-frequency in-game actions are handled using **instant, session-based off-chain transactions** (Yellow state channels), with **settlement on-chain** when a session ends.

The result is a DeFi product that’s fun, visual, and understandable: **agents generate plans → humans approve → smart contracts execute → trust/reputation builds over time**.

---

## Sponsor tracks we are targeting

### 1) Yellow Network — $15,000

We will integrate Yellow SDK / Nitrolite to demonstrate:

* **Wallet session creation** (deposit once, start session)
* **Off-chain transaction logic** (instant micro-spends / transfers inside the app)
* **On-chain settlement** when the user ends their session

This fits Yellow’s focus on: *instant, gasless UX for apps like trading/prediction/marketplaces*.

### 2) ENS — $5,000

We will integrate ENS meaningfully (not as an afterthought):

* Display user’s ENS name (reverse / primary name where possible)
* Use ENS text records to store/share Agentropolis profile/config (optional but recommended)
* ENS is part of the “identity layer” for users/agents (human-readable identities in the council + city)

### 3) Uniswap Foundation — $10,000

We will build agent-driven finance actions on **Uniswap v4**, focusing on:

* Agents proposing **trade execution plans**
* Plans executed via a treasury/executor contract that interacts with v4
* Provide **TxIDs**, working code, repo, demo video

---

## Product structure (pages)

### A) Landing page

* Hero: “Agentropolis — build a city of agents”
* CTA buttons:

  * **Launch App**
  * **Docs**
* Quick explanation (30 seconds read): city → council → approve → execute trades

### B) App (main)

The playable city + council interface.

### C) Docs page

Clear docs for judges:

* What it is + why it matters
* How Yellow is used (session/off-chain/settlement)
* How ENS is used (identity + text records)
* How Uniswap v4 is used (agent proposals → on-chain execution)
* Architecture diagram + repo instructions

---

## Core user flow

### 1) Sign up / start

* User connects wallet (EVM)
* Basic profile details (minimal): username, preferred risk level, optional ENS lookup

### 2) “Bring Your Own Agent” onboarding

User can connect their own AI agent via:

* **API key** (OpenAI/Groq/Gemini etc.) OR
* **Magic link / agent endpoint** (BYOA: connect external agent service)

We also support **Guest mode**:

* Users can test the game using **our server key** (limited, rate-limited) just to try onboarding + first agent deployment.

**Security requirement:** never permanently store user API keys in plaintext. Prefer local storage + optional encrypted vault, or server-side ephemeral session only.

### 3) City gameplay (deploy agents)

The city is visually “already built” (environment + NPC civilians).
What changes is the “agent population”:

* Normal NPCs wander around (optional / cosmetic)
* Deployed agents appear as distinct characters (e.g., “Matrix black suit” style)
* Deploying an agent means selecting a persona/strategy/profile from an **ERC-8004 registry** (or our deployed registry instance), then instantiating it in the city

Gameplay gives the user **in-game currency** (Credits) used for:

* Cosmetics (skins/building decor) — safest and easiest
* Optional “gas sponsor” / fee discounts (only if we can implement cleanly)
* Unlocking agent slots / council seats (optional)

### 4) Council Room (central building / roundtable UI)

A large building sits in the center of the city. Clicking it opens the Council Room UI:

* A roundtable with **~10 seats**
* One seat is the user
* The user’s deployed agents are dynamically placed in seats
* Agents submit **Trade Proposals** (structured report + reasoning + constraints)

User actions:

* **Approve** a proposal → triggers on-chain execution
* **Reject** a proposal → no trade
* (Optional) Ask for a second opinion / validation from a “risk agent”

---

## DeFi mechanics (how trading works)

### Trade proposal format (high-level)

Each proposal should include:

* Pair (e.g., USDC → WETH)
* Action type: swap / rebalance / DCA chunk
* Amount + max slippage
* Deadline / expiry
* “Why” summary (short, readable)
* Expected outcome / risk note
* Signature / provenance (agent identity)

### Execution model (minimal viable)

* A **Treasury/Executor** contract (or a minimal execution script) executes swaps via Uniswap v4
* The user approval is required before execution (human-in-the-loop)
* We log TxIDs and show them in the UI

---

## Yellow integration (how it fits gameplay)

We use Yellow sessions for **high-frequency, low-value interactions** that must feel instant:

**Off-chain within a Yellow session:**

* Deploy agent costs 0.01 USDC equivalent
* Cosmetic purchases
* Small “vote” costs / spam protection (optional)
* Optional: player-to-player micro-tips or wagers

**On-chain settlement:**

* Ending a session settles the net balance back on-chain
* Demo includes: create session → do multiple actions instantly → settle once

This demonstrates exactly what Yellow wants: **session-based off-chain logic + settlement**.

---

## ENS integration (how it’s meaningful)

Minimum that counts + is visible:

* Resolve and display ENS name for connected wallet
* Use ENS names in UI (city label, council seat labels)

Optional (nice + creative for DeFi):

* Store agent preference/config in ENS **text records** (e.g., default risk level, preferred tokens, agent endpoint)
* Save “Council Profile” as ENS-linked metadata so users can carry identity across sessions

---

## ERC-8004 integration (agent registry concept)

We treat agents as discoverable entities:

* Agent profiles are fetched from an ERC-8004 identity registry (or our own deployment for the hackathon)
* Each agent has:

  * metadata URI (persona/strategy description)
  * optional validation/reputation signals
* In UI: “Select agent from registry → deploy in city”

**Note:** if public ERC-8004 deployments are unavailable on our chosen chain, we deploy a minimal registry ourselves and seed 3–5 agents.

---

## Scope control (what we WILL ship vs optional)

### Must ship (MVP acceptance criteria)

* Landing page + App + Docs page
* Wallet connect + ENS name display
* Yellow: create session + off-chain actions + settlement demo
* City map UI: deploy at least 1 agent
* Council Room UI: see proposals from deployed agents
* Approve → execute at least 1 on-chain trade via Uniswap v4 (TxID shown)
* 2–3 minute demo video flow (end-to-end)

### Optional (only if ahead of schedule)

* Multiple agent types (DCA agent, momentum agent, risk agent)
* Reputation/validation writing (ERC-8004 reputation registry)
* NPC animations/pathing
* “Gas sponsorship” mechanic (can be risky to implement correctly)
* Multi-user sessions / PvP wagers using Yellow

---

## Suggested implementation architecture (practical)

### Frontend (web)

* Next.js + React
* Game view: simple grid/city scene (Canvas/Pixi/Phaser OR even HTML grid for MVP)
* Council Room: React UI panel with dynamic seats + proposal cards
* Wallet: wagmi/viem
* ENS reads: wagmi/viem ENS calls

### Backend (agent orchestrator)

* Small service that:

  * Manages BYOA connections (keys/endpoints)
  * Runs agent inference to produce structured proposals
  * Rate-limits guest mode
* Keep agent outputs deterministic + structured (JSON schema)

### On-chain

* Trade executor contract or script:

  * Verifies approval path
  * Executes Uniswap v4 swap
* Yellow integration per their SDK + test environment

---

## Demo script (2–3 min)

1. Open Landing → Launch App
2. Connect wallet → show ENS name
3. Start Yellow session (deposit once)
4. Deploy first agent (instant off-chain “deploy cost” charged)
5. Enter Council Room → agent proposes trade plan
6. Approve → execute Uniswap v4 trade → show TxID
7. Buy a cosmetic / do more actions off-chain quickly
8. End session → on-chain settlement confirmation

---

## Timeline (Jan 31 → Feb 8, 10:30 PM IST)

**Phase 1 (Jan 31–Feb 2): Foundations**

* Repo scaffolding, UI skeleton, wallet connect, routing
* Decide chain + tokens, confirm Uniswap v4 environment
* Yellow quickstart integrated (basic channel/session + transfer + settlement)

**Phase 2 (Feb 3–Feb 5): Core gameplay + council**

* City view + deploy agent flow
* Council UI + proposal schema
* Agent orchestrator generating proposals reliably

**Phase 3 (Feb 6–Feb 7): On-chain trading**

* Uniswap v4 execution path + TxIDs
* End-to-end demo flow stable
* ENS integration visible in UI

**Phase 4 (Feb 8): Polish + docs + video**

* Docs page + architecture diagram
* Record demo video (<=3 min)
* Submission packaging (README, setup steps, links)

---

## Reference links (paste into context.md if you want)

```text
Yellow docs (learn): https://docs.yellow.org/docs/learn
Yellow quickstart: https://docs.yellow.org/docs/build/quick-start/
ENS docs: https://docs.ens.domains
ENS text records: https://docs.ens.domains/web/records
Uniswap v4 overview: https://docs.uniswap.org/contracts/v4/overview
ERC-8004 (EIP): https://eips.ethereum.org/EIPS/eip-8004
```

---

If you want, I can also output a **strict JSON spec** for the “TradeProposal” object + “AgentProfile” object (perfect for coding agents), and a suggested repo folder layout (`apps/web`, `apps/agents`, `contracts/`, etc.).

