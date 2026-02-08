# Agentropolis — Demo Voiceover Script (~3:56)

> **Instructions**: This is a voiceover script for a pre-recorded demo video. Read each section during the matching timestamp. Pace is conversational — about 140-150 words per minute. Pauses are noted where the screen needs to breathe.

---

## [0:00 – 0:16] Landing Page + Docs (16s)

> "Agentropolis — a gamified DeFi command center where AI agents deliberate your trades and enforce decisions on-chain through Uniswap v4 hooks. Deploy agents into a cyberpunk city, they debate in a council room, reach consensus, and the trade executes on Base Sepolia. Let's walk through it."

---

## [0:16 – 0:28] The City (12s)

> "This is the city — a fully 3D isometric environment built with React Three Fiber. Every building, street lamp, and agent is rendered in real-time. This is your home screen — manage agents, collect rewards, launch strategies."

---

## [0:29 – 0:40] Connecting Wallet (12s)

> "We're connecting to Base Sepolia. Once the wallet's connected, the city comes alive — our deployment panel unlocks, and we can start interacting with on-chain contracts."

---

## [0:41 – 0:54] Yellow Network Session (13s)

> "What we're approving is a Yellow Network state channel deposit. Once this session starts, every micro-action — deploying agents, voting, collecting coins — happens off-chain through Yellow's ClearSync. No gas per action. Only settlement hits the chain."

---

## [0:55 – 1:25] Creating & Deploying an Agent (30s)

> "We're creating a new agent — name, strategy, risk tolerance — and when we register, it mints a real ERC-721 NFT on the ERC-8004 Identity Registry. On-chain identity with metadata embedded."

> "Once registered, we deploy it into the city. That cyan sparkle — that's the agent spawning. Each agent has unique shapes and neon colors based on its role — cosmetics tied to identity. The vision is a full SimScape: agents autonomously roaming, executing micro-strategies, collecting yield — all gas-free through Yellow Network. A living, breathing DeFi city."

---

## [1:25 – 1:37] Agent Running & Collecting Coins (12s)

> "Watch the agent walk the streets autonomously — following a path graph between city nodes. When it passes a coin, it collects it. Bronze, silver, gold — each worth different $YTEST amounts. The gameplay loop in action."

---

## [1:38 – 1:47] Agent Marketplace (9s)

> "This is our Agent Marketplace — every agent here is pulled live from the ERC-8004 on-chain registry. You can see their strategy, risk tolerance, reputation score, and registry source. These aren't mock entries — they're real NFTs."

---

## [1:47 – 1:55] BaseScan — NFT Minted (8s)

> "And here it is on BaseScan — the agent we just created, minted as a token on contract 0x8004. Full metadata on-chain: name, strategy, risk profile. Verifiable by anyone."

---

## [2:01 – 2:32] Limit Order Hook + Building (31s)

> "Now let's talk about limit orders. See these towers in the city? Each one represents a limit order. When you place an order, a tower appears — gray while pending, blue when the market's close to your target, and gold when it fills. You can click to claim."

> "This is designed as a Uniswap v4 hook. On testnet we're running a mocked version — the lifecycle is simulated locally. But the hook architecture and contract code are production-ready and tested. The visual metaphor is the key — your orders literally become structures in your city."

---

## [2:34 – 2:44] Entering Council Room (10s)

> "Now we step into the Council Room — this is where the real magic happens. Five AI agents sit around this table, each with a distinct role: Alpha Hunter, Risk Sentinel, Macro Oracle, Devil's Advocate, and Council Clerk."

---

## [2:45 – 2:56] Individual Agent Chat — Risk Sentinel (11s)

> "You can click any agent to chat one-on-one before running the full council. Here we're clicking the Risk Sentinel — see the profile, establish the uplink, and ask it anything directly. Individual A2A deliberation."

---

## [2:57 – 3:12] Full Council Deliberation (15s)

> "Now we type 'Swap 10 USDC to WETH' and convene the full council. Each agent deliberates one by one through Groq's Llama 3.3 70B. Alpha Hunter spots the opportunity, Risk Sentinel flags concerns, Devil's Advocate pushes back. Real-time multi-agent consensus."

---

## [3:13 – 3:22] Consensus Popup + Approve (9s)

> "Council reaches consensus. Vote tally — support, oppose, abstain — risk level, expected output. On the left, the Hook Parameters panel just slid in — dynamic fee, max swap size, sentiment — all pushed on-chain to our v4 hooks right now."

---

## [3:23 – 3:38] Executing the Swap (15s)

> "We authorize execution. The swap routes through our Universal Router, passing through three custom v4 hooks. CouncilFeeHook adjusts fees based on vote consensus. SwapGuardHook enforces the Risk Sentinel's max trade size. SentimentOracleHook records market sentiment on-chain. Three hooks, all deployed, 30 passing Forge tests."

---

## [3:39 – 3:41] Swap Success (2s)

> "Swap confirmed."

---

## [3:42 – 3:55] BaseScan Verification + Close (13s)

> "There it is on BaseScan — the swap transaction, routed through our hooks on Base Sepolia. Every parameter the council set, verifiable on-chain. That's Agentropolis — AI agents deliberate, v4 hooks enforce, Yellow Network scales. This was Team Paracausal. Thank you."

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
| Limit orders (live)  | Mock-only (localStorage), explain as designed hook |
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
- [ ] Council deliberation tested (returns approval, not veto)
- [ ] Swap execution tested (tx confirms on BaseScan)
- [ ] ERC-8004 marketplace loads real agents
- [ ] Clear localStorage before recording (fresh state)
- [ ] Test prompt "Swap 10 USDC to WETH" produces majority approval
- [ ] Limit order towers visible in city (place one beforehand)
