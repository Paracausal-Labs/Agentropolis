import type { Address } from 'viem'

// Yellow Network - Base Sepolia (Chain ID: 84532)
export const YELLOW_CHAIN_ID = 84532

// Clearnode WebSocket endpoint (sandbox)
export const YELLOW_CLEARNODE_URL = 'wss://clearnet-sandbox.yellow.com/ws'

// Contract addresses on Base Sepolia
export const YELLOW_CONTRACTS = {
  // Custody contract for deposits/withdrawals
  CUSTODY: '0x019B65A265EB3363822f2752141b3dF16131b262' as Address,
  
  // ytest.USD token (6 decimals) - test stablecoin for Yellow sandbox
  YTEST_USD: '0xDB9F293e3898c9E5536A3be1b0C56c89d2b32DEb' as Address,
} as const

// Token decimals
export const YTEST_USD_DECIMALS = 6

// Default amounts (in smallest units)
export const YELLOW_DEFAULTS = {
  // Default deposit amount: 10 ytest.USD
  DEPOSIT_AMOUNT: BigInt(10 * 10 ** YTEST_USD_DECIMALS),
  
  // Agent deploy cost: 0.01 ytest.USD
  AGENT_DEPLOY_COST: BigInt(0.01 * 10 ** YTEST_USD_DECIMALS),
  
  // Minimum balance warning threshold: 1 ytest.USD
  MIN_BALANCE_WARNING: BigInt(1 * 10 ** YTEST_USD_DECIMALS),
} as const

// Format ytest.USD amount for display
export function formatYtestUsd(amount: bigint): string {
  const value = Number(amount) / 10 ** YTEST_USD_DECIMALS
  return value.toFixed(2)
}

// Parse ytest.USD amount from string
export function parseYtestUsd(amount: string): bigint {
  const value = parseFloat(amount)
  if (isNaN(value)) return BigInt(0)
  return BigInt(Math.floor(value * 10 ** YTEST_USD_DECIMALS))
}
