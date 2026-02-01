# Agentropolis

**Build a city of agents. Approve their plans. Execute trades on-chain.**

A gamified DeFi trading platform for HackMoney 2026. Deploy AI agents in an isometric city, let them propose trades in the Council Room, and execute approved swaps on Uniswap v4.

## Quick Start

```bash
# Install dependencies
bun install

# Build shared package
cd packages/shared && bun run build && cd ../..

# Run dev server
cd apps/web && bun run dev
```

Open http://localhost:3000

## Environment Variables

Create `apps/web/.env.local`:

```env
# Optional - for AI proposals (defaults to mock mode)
GROQ_API_KEY=your_groq_api_key

# Optional - force mock modes for demo
GROQ_MOCK=true
UNISWAP_MOCK=true
ERC8004_MOCK=true
```

## Sponsor Integrations

### Yellow Network ($15k Track)
- Session-based off-chain micro-actions
- Instant agent deployment without gas
- On-chain settlement when session ends
- Implementation: `apps/web/lib/yellow/session.ts`

### Uniswap v4 ($10k Track)
- Agent proposals execute via Universal Router
- V4_SWAP command encoding
- Real swaps on Base Sepolia
- Implementation: `apps/web/lib/uniswap/executor.ts`

### ENS ($5k Track)
- Human-readable identity display
- ENS name + avatar in header
- Implementation: `apps/web/components/UserIdentity.tsx`

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Game Engine**: Phaser 3 (isometric city)
- **Web3**: wagmi, viem
- **AI**: Groq LLM (llama-3.3-70b-versatile)
- **Chain**: Base Sepolia (testnet)

## Project Structure

```
apps/
  web/                    # Next.js app
    app/                  # Pages (landing, app, docs)
    components/           # React + Phaser components
    lib/                  # Yellow, Uniswap, ERC-8004 integrations
packages/
  shared/                 # TypeScript types
```

## Demo Flow

1. Landing page → Launch App
2. Connect wallet (MetaMask)
3. Start Yellow session
4. Deploy agent from ERC-8004 registry
5. Enter Council Room → See proposal
6. Approve → Execute Uniswap swap
7. View TxID on BaseScan
8. End session → Settlement

## Contracts (Base Sepolia)

- Universal Router: `0x6fF5693b99212Da76ad316178A184AB56D299b43`
- Pool Manager: `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`
- WETH: `0x4200000000000000000000000000000000000006`
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## License

MIT

---

Built for HackMoney 2026
