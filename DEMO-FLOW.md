# Agentropolis Demo Flow (4 minutes)

## Structure: Problem > Solution > Live Demo > Architecture > Impact

---

## [0:00 - 0:20] HOOK - The Problem (20s)

> "DeFi trading today is blind. You approve swaps with no risk analysis, no sentiment check, no guardrails. What if AI agents could deliberate your trades before execution — and enforce their decisions on-chain through Uniswap v4 hooks?"

---

## [0:20 - 0:50] SHOW THE CITY (30s)

- Open the app, show the cyberpunk 3D city
- Quick wallet connect on Base Sepolia
- "This is Agentropolis — a gamified DeFi command center"
- Deploy 2 agents from the ERC-8004 registry (show the marketplace pulling real on-chain agents)
- "Each agent is an NFT on the ERC-8004 Identity Registry"

---

## [0:50 - 1:30] YELLOW SESSION (40s) — $15k moment

- Click deposit — show ytest.USD arriving via Yellow faucet
- Click "Start Session" — show the WebSocket connecting to clearnode
- Deploy an agent — "That cost 0.01 ytest.USD — but no gas. It's an off-chain state channel update through Yellow Network"
- "Every micro-action in the city — deploying agents, voting — runs gas-free through Yellow's ClearSync protocol. Only settlement hits the chain."

---

## [1:30 - 2:30] COUNCIL DELIBERATION + SWAP (60s) — Main event

- Enter Council Room — type **"Swap 10 USDC to WETH"**
- Show 5 agents deliberating in real-time (Groq LLM):
  - Alpha Hunter supports
  - Risk Sentinel raises concerns
  - Devil's Advocate challenges
- Show the consensus card: vote tally, risk level, expected output
- **KEY MOMENT**: Show the Hook Params panel (left side)
  - "These parameters are being pushed ON-CHAIN to our v4 hooks RIGHT NOW"
  - Dynamic Fee: varies based on consensus (contested = higher fee)
  - Max Swap Size: risk guardrail from Risk Sentinel
  - Sentiment score: on-chain market sentiment
- Click APPROVE — show the swap executing through Universal Router
- Show BaseScan tx: "10 USDC to 0.049 WETH, routed through our CouncilFeeHook, SwapGuardHook, and SentimentOracleHook"

---

## [2:30 - 3:10] ENS INTEGRATION (40s) — $5k moment

- Open Agent Settings — "If I have an ENS name, I can store my custom AI agent's endpoint as an ENS text record"
- Show the `com.agentropolis.endpoint` text record concept
- "Next time the council deliberates, it auto-discovers my custom agent from ENS and includes it in the discussion"
- "Your ENS name IS your DeFi identity — risk preferences, preferred tokens, custom agents — all stored on-chain in text records"

---

## [3:10 - 3:50] ARCHITECTURE + HOOKS DEEP DIVE (40s)

- Show the architecture diagram
- "Three custom Uniswap v4 hooks, all deployed on Base Sepolia":
  - **CouncilFeeHook**: Dynamic fees based on council consensus (unanimous = 0.05%, vetoed = 1%)
  - **SwapGuardHook**: Max swap size enforcement from Risk Sentinel
  - **SentimentOracleHook**: On-chain sentiment verification
- "30 Forge tests passing. Every hook is battle-tested."
- Flash the contract addresses on screen

---

## [3:50 - 4:00] CLOSE (10s)

> "Agentropolis: AI agents deliberate, Uniswap v4 hooks enforce, Yellow Network scales, ENS identifies. DeFi with guardrails."

---

## Contract Addresses (Base Sepolia)

| Contract              | Address                                      |
|-----------------------|----------------------------------------------|
| Universal Router      | `0x492E6456D9528771018DeB9E87ef7750EF184104` |
| CouncilFeeHook        | `0xddda04328455FfbeeBb4a4Fb6ef2292c586E4080` |
| SwapGuardHook         | `0xA7a8c5D56E6B7318a3Fa61b71A9905e59f474080` |
| SentimentOracleHook   | `0xE18ef4b29F0DCFf955F6852d468bC18f121a4040` |
| ERC-8004 Registry     | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| Pool Manager          | `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408` |

---

## DO NOT Demo

| Feature              | Why                                        |
|----------------------|--------------------------------------------|
| DCA strategy         | Executes as single swap, not scheduled     |
| Limit orders         | Mock-only (localStorage), no real hook     |
| LP positions         | Disabled on testnet                        |
| Type "DCA" in prompt | Will work but logs a warning               |

## Suggested Prompts for Council

- "Swap 10 USDC to WETH" (cleanest flow)
- "Swap 0.005 WETH to USDC" (works too)
- Avoid: "DCA", "provide liquidity", "launch token" (less polished flows)

## Pre-Demo Checklist

- [ ] Wallet connected to Base Sepolia
- [ ] Have USDC + small WETH balance in wallet
- [ ] `.env.local` has `GROQ_API_KEY` set (not mock mode)
- [ ] `.env.local` has `NEXT_PUBLIC_UNISWAP_MOCK=false`
- [ ] Yellow session tested (deposit + start works)
- [ ] Council deliberation tested (returns WETH not USDC for output)
- [ ] Swap execution tested (tx confirms on BaseScan)
- [ ] ERC-8004 marketplace loads real agents
- [ ] Clear localStorage before recording (fresh state)
