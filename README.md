# Agentropolis

<img width="100%" alt="Agentropolis Banner" src="https://github.com/user-attachments/assets/c228a286-3d02-4464-8c9f-32ec117a058e" />

> **Build a city of agents. Approve their plans. Execute trades on-chain.**

**Agentropolis** is a gamified DeFi trading platform built for **HackMoney 2026**.
Deploy AI agents in an isometric cyberpunk city, watch them deliberate strategies in the Council Room, and execute their approved proposals directly on Uniswap v4.

---

## 🏛️ Architecture

![Architecture](apps/web/public/archi.png)

The system integrates a visually immersive frontend with a robust on-chain execution layer:
1.  **Frontend**: Next.js + Phaser/Three.js for the City and Council views.
2.  **AI Layer**: Groq LLM powering 5 unique agent personas (Alpha Hunter, Risk Sentinel, etc.).
3.  **Settlement**: Uniswap v4 for swaps, Yellow Network for fast session states.

---

## 🏆 Sponsor Tracks

### 🟡 Yellow Network ($15k Track)
**"High-speed off-chain sessions, on-chain settlement."**
-   **Feature**: Users start a Yellow Session to interact gas-free with agents.
-   **Tech**: State Channels for micro-actions (deploying agents, voting).
-   **Implementation**: `apps/web/lib/yellow/channel.tsx`

### 🦄 Uniswap v4 ($10k Track)
**"Agent-driven execution via custom Hooks."**
-   **Feature**: Council proposals execute via Universal Router.
-   **Hooks**:
    -   `CouncilFeeHook`: Dynamic fees based on proposal consensus.
    -   `SwapGuardHook`: Enforces risk parameters set by the Risk Sentinel agent.
    -   `SentimentOracleHook`: On-chain sentiment verification.
-   **Implementation**: `packages/contracts/src/`

### 🔵 ENS ($5k Track)
**"Identity and Agent Discovery."**
-   **Feature**: Your profile is your ENS. Your agents are ENS text records.
-   **BYOA (Bring Your Own Agent)**: Store your custom agent's API endpoint in your ENS text record (`com.agentropolis.endpoint`), and the Council will auto-discover and consult it.
-   **Implementation**: `apps/web/lib/ens/textRecords.ts`

### 🔵 Base Sepolia
**"The home of Agentropolis."**
-   All contracts and the **ERC-8004 Agent Registry** are deployed on Base Sepolia for fast, low-cost execution.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies (Root)
bun install

# 2. Build shared packages
cd packages/shared && bun run build && cd ../..

# 3. Run the development server
cd apps/web && bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to enter the city.

---

## 🔧 Environment Variables

Create `apps/web/.env.local`:

```env
# AI Integration (Optional - Defaults to Mock)
GROQ_API_KEY=your_key_here

# Visual & Debug Modes
NEXT_PUBLIC_UNISWAP_MOCK=false
GROQ_MOCK=false
```

---

## 📜 Smart Contracts (Base Sepolia)

| Contract | Address |
| due | :--- |
| **Universal Router** | `0x492E6456D9528771018DeB9E87ef7750EF184104` |
| **CouncilFeeHook** | `0xddda04328455FfbeeBb4a4Fb6ef2292c586E4080` |
| **SwapGuardHook** | `0xA7a8c5D56E6B7318a3Fa61b71A9905e59f474080` |
| **ERC-8004 Registry**| `0x8004A818BFB912233c491871b3d84c89A494BD9e` |

---

## 🏗️ Tech Stack

-   **Frontend**: Next.js 14, Tailwind CSS, customized Pixel/Cyberpunk UI
-   **Game Engine**: React Three Fiber + Drei (3D Scenes)
-   **Blockchain**: Wagmi, Viem, Foundry
-   **AI**: Llama-3.3-70b via Groq

---

Built with ⚡ & ☕ for HackMoney 2026.
