/**
 * Shared hook update logic.
 * Sends on-chain transactions to update V4 hook parameters.
 * Used by both the council (direct call) and the /api/hooks/update route.
 */
import { createWalletClient, createPublicClient, http, type Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
import { HOOKS, RPC_URL } from './constants'

const RECEIPT_TIMEOUT_MS = 120_000

const COUNCIL_FEE_HOOK_ABI = [
  {
    type: 'function',
    name: 'setFee',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newFeeBps', type: 'uint24' }],
    outputs: [],
  },
] as const

const SWAP_GUARD_HOOK_ABI = [
  {
    type: 'function',
    name: 'setMaxSwapSize',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_max', type: 'uint256' }],
    outputs: [],
  },
] as const

const SENTIMENT_ORACLE_HOOK_ABI = [
  {
    type: 'function',
    name: 'updateSentiment',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_score', type: 'int8' },
      { name: '_reason', type: 'string' },
    ],
    outputs: [],
  },
] as const

export interface HookUpdateParams {
  feeBps?: number
  maxSwapSize?: string
  sentimentScore?: number
  sentimentReason?: string
}

export interface HookUpdateResult {
  success: boolean
  txHashes: string[]
  updated: {
    fee?: number
    maxSwapSize?: string
    sentiment?: number
  }
  error?: string
}

export function validateHookParams(body: HookUpdateParams): { valid: boolean; error?: string } {
  if (body.feeBps !== undefined) {
    if (typeof body.feeBps !== 'number' || !Number.isInteger(body.feeBps) || body.feeBps < 10 || body.feeBps > 10_000) {
      return { valid: false, error: 'feeBps must be an integer between 10 and 10000' }
    }
  }

  if (body.maxSwapSize !== undefined) {
    if (typeof body.maxSwapSize !== 'string') {
      return { valid: false, error: 'maxSwapSize must be a numeric string' }
    }
    try {
      const size = BigInt(body.maxSwapSize)
      const MIN = BigInt('10000000000000000') // 0.01 ETH in wei
      if (size < MIN) {
        return { valid: false, error: 'maxSwapSize must be at least 0.01 ETH (in wei)' }
      }
      const MAX_REASONABLE = BigInt('1000000000000000000000000') // 1M ETH in wei
      if (size > MAX_REASONABLE) {
        return { valid: false, error: 'maxSwapSize exceeds maximum' }
      }
    } catch {
      return { valid: false, error: 'maxSwapSize must be a valid integer string' }
    }
  }

  if (body.sentimentScore !== undefined) {
    if (typeof body.sentimentScore !== 'number' || !Number.isInteger(body.sentimentScore) || body.sentimentScore < -100 || body.sentimentScore > 100) {
      return { valid: false, error: 'sentimentScore must be an integer between -100 and 100' }
    }
  }

  if (body.sentimentReason !== undefined) {
    if (typeof body.sentimentReason !== 'string') {
      return { valid: false, error: 'sentimentReason must be a string' }
    }
    if (body.sentimentReason.length > 500) {
      return { valid: false, error: 'sentimentReason must be 500 characters or fewer' }
    }
  }

  return { valid: true }
}

/**
 * Execute on-chain hook parameter updates.
 * This is the core logic — no HTTP, no auth. Just send transactions.
 */
export async function executeHookUpdate(params: HookUpdateParams): Promise<HookUpdateResult> {
  const deployerKey = process.env.DEPLOYER_KEY
  if (!deployerKey) {
    return { success: false, txHashes: [], updated: {}, error: 'DEPLOYER_KEY not configured' }
  }

  const validation = validateHookParams(params)
  if (!validation.valid) {
    return { success: false, txHashes: [], updated: {}, error: validation.error }
  }

  const account = privateKeyToAccount(deployerKey as `0x${string}`)

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(RPC_URL),
  })

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  })

  const txHashes: string[] = []
  const errors: string[] = []

  const wait = (hash: `0x${string}`) =>
    publicClient.waitForTransactionReceipt({ hash, timeout: RECEIPT_TIMEOUT_MS })

  // Update CouncilFeeHook
  if (params.feeBps !== undefined) {
    if (HOOKS.COUNCIL_FEE === '0x0000000000000000000000000000000000000000') {
      errors.push('COUNCIL_FEE hook address not configured')
    } else {
      try {
        const hash = await walletClient.writeContract({
          address: HOOKS.COUNCIL_FEE as Address,
          abi: COUNCIL_FEE_HOOK_ABI,
          functionName: 'setFee',
          args: [params.feeBps],
        })
        await wait(hash)
        txHashes.push(hash)
        console.log(`[Hooks] CouncilFeeHook fee updated to ${params.feeBps} bps, tx: ${hash}`)
      } catch (err) {
        errors.push(`CouncilFeeHook update failed: ${err instanceof Error ? err.message : 'unknown error'}`)
      }
    }
  }

  // Update SwapGuardHook
  if (params.maxSwapSize !== undefined) {
    if (HOOKS.SWAP_GUARD === '0x0000000000000000000000000000000000000000') {
      errors.push('SWAP_GUARD hook address not configured')
    } else {
      try {
        const hash = await walletClient.writeContract({
          address: HOOKS.SWAP_GUARD as Address,
          abi: SWAP_GUARD_HOOK_ABI,
          functionName: 'setMaxSwapSize',
          args: [BigInt(params.maxSwapSize)],
        })
        await wait(hash)
        txHashes.push(hash)
        console.log(`[Hooks] SwapGuardHook maxSwapSize updated to ${params.maxSwapSize}, tx: ${hash}`)
      } catch (err) {
        errors.push(`SwapGuardHook update failed: ${err instanceof Error ? err.message : 'unknown error'}`)
      }
    }
  }

  // Update SentimentOracleHook
  if (params.sentimentScore !== undefined || params.sentimentReason !== undefined) {
    if (params.sentimentScore === undefined || params.sentimentReason === undefined) {
      errors.push('Sentiment update requires both sentimentScore and sentimentReason')
    } else if (HOOKS.SENTIMENT_ORACLE === '0x0000000000000000000000000000000000000000') {
      errors.push('SENTIMENT_ORACLE hook address not configured')
    } else {
      try {
        const hash = await walletClient.writeContract({
          address: HOOKS.SENTIMENT_ORACLE as Address,
          abi: SENTIMENT_ORACLE_HOOK_ABI,
          functionName: 'updateSentiment',
          args: [params.sentimentScore, params.sentimentReason],
        })
        await wait(hash)
        txHashes.push(hash)
        console.log(`[Hooks] SentimentOracleHook updated to score=${params.sentimentScore}, tx: ${hash}`)
      } catch (err) {
        errors.push(`SentimentOracleHook update failed: ${err instanceof Error ? err.message : 'unknown error'}`)
      }
    }
  }

  return {
    success: errors.length === 0,
    txHashes,
    updated: {
      fee: params.feeBps,
      maxSwapSize: params.maxSwapSize,
      sentiment: params.sentimentScore,
    },
    error: errors.length ? errors.join(' | ') : undefined,
  }
}
