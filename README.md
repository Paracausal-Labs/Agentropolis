# Agentropolis
<img width="3392" height="1248" alt="image" src="https://github.com/user-attachments/assets/c228a286-3d02-4464-8c9f-32ec117a058e" />

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
NEXT_PUBLIC_UNISWAP_MOCK=true
ERC8004_MOCK=true
```

## Sponsor Integrations

### Yellow Network ($15k Track)
- Session-based off-chain micro-actions
- Instant agent deployment without gas
- On-chain settlement when session ends
- Implementation: `apps/web/lib/yellow/channel.tsx`, `apps/web/components/SessionProvider.tsx`

### Uniswap v4 ($10k Track)
- 3 custom V4 hooks: CouncilFeeHook (dynamic fees), SwapGuardHook (risk limits), SentimentOracleHook (on-chain sentiment)
- LLM council deliberation → on-chain hook parameter updates → swap execution
- Agent proposals execute via Universal Router with V4_SWAP command + Permit2 flow
- Real swaps on Base Sepolia
- **Successful swap TxID**: [`0xd9b8c3cd42018c6b156679b5af8b7835509fecc2c6ce5ee41bdbfeb3cf422878`](https://sepolia.basescan.org/tx/0xd9b8c3cd42018c6b156679b5af8b7835509fecc2c6ce5ee41bdbfeb3cf422878)
- Hook update TxIDs: [`0x6445944b...`](https://sepolia.basescan.org/tx/0x6445944bef0aff3c20ed6f50a1490cc8ddf78763d47477b0341f0ed011b12fe9), [`0x81fd2485...`](https://sepolia.basescan.org/tx/0x81fd24858fc52674de2e6458f1e9950999707546bf847647129bb5a4387b5683), [`0x2540d5c0...`](https://sepolia.basescan.org/tx/0x2540d5c018c47564902279e75be3d35e5ec1bb9ed6d4d85d737b042cfb60958e)
- Implementation: `apps/web/lib/uniswap/executor.ts`, `packages/contracts/src/`

### ENS ($5k Track)
- ENS name + avatar resolution via wagmi hooks (`useEnsName`, `useEnsAvatar`)
- Read/write agent config to ENS text records (`com.agentropolis.risk`, `com.agentropolis.strategy`, `com.agentropolis.tokens`, `com.agentropolis.endpoint`)
- Auto-load user preferences from ENS on wallet connect
- Reverse ENS lookup in council API to discover external agent endpoints from ENS text records
- BYOA (Bring Your Own Agent): store your agent's API endpoint in ENS, council auto-discovers and calls it
- Implementation: `apps/web/components/UserIdentity.tsx`, `apps/web/components/AgentSettings.tsx`, `apps/web/lib/ens/textRecords.ts`

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, React Three Fiber
- **Smart Contracts**: Solidity, Foundry (3 Uniswap V4 hooks)
- **Web3**: wagmi, viem, Permit2
- **AI**: Groq LLM (llama-3.3-70b-versatile) — 5-agent council deliberation
- **Chain**: Base Sepolia (testnet)
- **State Channels**: Yellow Network / Nitrolite (ERC-7824)

## Project Structure

```
apps/
  web/                    # Next.js app
    app/                  # Pages + API routes
    components/           # React + Three.js components
    lib/                  # Uniswap, Yellow, ENS, ERC-8004 integrations
packages/
  contracts/              # Solidity hooks (Foundry)
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

### Uniswap V4 Hooks
- CouncilFeeHook: `0xddda04328455FfbeeBb4a4Fb6ef2292c586E4080`
- SwapGuardHook: `0xA7a8c5D56E6B7318a3Fa61b71A9905e59f474080`
- SentimentOracleHook: `0xE18ef4b29F0DCFf955F6852d468bC18f121a4040`

### Infrastructure
- Universal Router: `0x492E6456D9528771018DeB9E87ef7750EF184104`
- Pool Manager: `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`
- Position Manager: `0x4B2C77d209D3405F41a037Ec6c77F7F5b8e2ca80`
- Permit2: `0x000000000022D473030F116dDEE9F6B43aC78BA3`

### Tokens
- WETH: `0x4200000000000000000000000000000000000006`
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### Other
- ENS Resolver (Sepolia): `0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5`
- ERC-8004 Identity: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- ERC-8004 Reputation: `0x8004B663056A597Dffe9eCcC1965A193B7388713`

## License

MIT

---

Built for HackMoney 2026
