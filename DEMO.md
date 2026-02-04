# Agentropolis Demo Script

**Duration**: 2-3 minutes  
**Target**: HackMoney 2026 judges

---

## Pre-Demo Setup

1. Open http://localhost:3000 in Chrome
2. Have MetaMask ready with Base Sepolia network
3. Ensure wallet has test USDC and ETH
4. Set `GROQ_MOCK=true` in `.env.local` for reliable demo (or use real API)

---

## Demo Flow

### 1. Landing Page (15 sec)

> "This is Agentropolis - a gamified DeFi trading platform where AI agents collaborate to propose trading strategies."

- Show hero section
- Click **Launch App**

### 2. Connect Wallet (15 sec)

> "First, I'll connect my wallet. Notice we display the ENS name if available."

- Click Connect Wallet
- Show ENS name in header (if set)

### 3. Start Yellow Session (20 sec)

> "We're using Yellow Network for instant, gasless micro-transactions. I'll start a session by depositing once."

- Click Start Session
- Show session balance

### 4. Deploy Agent (20 sec)

> "Now I'll deploy an AI agent from our ERC-8004 registry. Each agent has a unique strategy."

- Click on an empty lot in the city
- Select an agent (e.g., "Momentum Trader")
- Show agent appear in city

### 5. Enter Council Room (60 sec) ⭐ KEY DEMO

> "The Council Room is where agents deliberate. Let me enter and see what they recommend."

- Click the Council building
- Show the roundtable UI with 5 agents

> "I'll ask the council: 'I want passive income from my ETH'"

- Select "Passive Income" prompt
- Watch speech bubbles appear sequentially:
  - 🎯 Alpha Hunter: "Great opportunity! 15-25% APY..."
  - 🛡️ Risk Sentinel: "Impermanent loss risk is moderate..."
  - 🔮 Macro Oracle: "Market is ranging, good for LP..."
  - 😈 Devil's Advocate: "What if ETH drops 20%..."
  - 📋 Clerk: Synthesizes final proposal

> "Each agent has a role - the Risk Sentinel can even VETO dangerous proposals."

- Point out consensus indicator (unanimous/majority/contested)
- Show final proposal card with risk level and confidence

### 6. Approve & Execute (30 sec)

> "I'll approve this proposal. It executes a real swap on Uniswap v4."

- Click APPROVE
- Show "Executing swap..." message
- Show transaction hash (link to BaseScan)

> "That's a real on-chain transaction using Uniswap v4's Universal Router."

### 7. End Session (15 sec)

> "Finally, I'll end my Yellow session to settle on-chain."

- Click End Session
- Show settlement confirmation

---

## Key Points to Emphasize

1. **Multi-Agent Deliberation**: Agents debate and form consensus before proposing
2. **Human-in-the-Loop**: User always approves before execution
3. **Real On-Chain**: Actual Uniswap v4 swaps with transaction IDs
4. **Yellow Integration**: Instant off-chain actions, batch settlement
5. **ENS Identity**: Human-readable names throughout

---

## Fallback Plans

| Issue | Solution |
|-------|----------|
| API rate limit | Use `GROQ_MOCK=true` for mock deliberation |
| Wallet issues | Use `NEXT_PUBLIC_UNISWAP_MOCK=true` for mock swaps |
| Slow network | Pre-record the Uniswap transaction portion |

---

## Technical Highlights for Judges

- **Uniswap v4**: V4_SWAP command encoding, Universal Router integration
- **Yellow Network**: State channel sessions, off-chain micro-transactions
- **ENS**: Reverse resolution, text record storage
- **Architecture**: Multi-agent orchestration with sequential context passing
