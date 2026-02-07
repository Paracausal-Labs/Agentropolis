export const BASE_SEPOLIA_CHAIN_ID = 84532

export const CONTRACTS = {
  // Base Sepolia Universal Router (supports V4)
  UNIVERSAL_ROUTER: '0x492E6456D9528771018DeB9E87ef7750EF184104' as const,
  POOL_MANAGER: '0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408' as const,
  PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3' as const,
  POSITION_MANAGER: '0xABD2e846ea3927eA90e5e4Caa2A0fFd0CcbF60f8' as const,
}

export const TOKENS = {
  WETH: '0x4200000000000000000000000000000000000006' as const,
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const,
}

export const TOKEN_DECIMALS: Record<string, number> = {
  [TOKENS.USDC.toLowerCase()]: 6,
  [TOKENS.WETH.toLowerCase()]: 18,
}

// V4 Hook contracts — update after deploying via DeployHooks.s.sol
export const HOOKS = {
  COUNCIL_FEE: (process.env.NEXT_PUBLIC_COUNCIL_FEE_HOOK ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  SWAP_GUARD: (process.env.NEXT_PUBLIC_SWAP_GUARD_HOOK ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
  SENTIMENT_ORACLE: (process.env.NEXT_PUBLIC_SENTIMENT_ORACLE_HOOK ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
}

// Dynamic fee flag used by CouncilFeeHook pools
export const DYNAMIC_FEE_FLAG = 0x800000

export const POOL_KEY = {
  currency0: TOKENS.USDC,
  currency1: TOKENS.WETH,
  fee: 3000,
  tickSpacing: 60,
  hooks: '0x0000000000000000000000000000000000000000' as const,
}

export const RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'
