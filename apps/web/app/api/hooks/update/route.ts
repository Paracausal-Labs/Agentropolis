import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createWalletClient, createPublicClient, http, type Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
import { HOOKS, RPC_URL } from '@/lib/uniswap/constants'

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

interface HookUpdateRequest {
  feeBps?: number
  maxSwapSize?: string
  sentimentScore?: number
  sentimentReason?: string
}

// Rate limiting for hook updates
const hookRateLimits = new Map<string, { count: number; resetAt: number }>()
const HOOK_RATE_LIMIT_WINDOW_MS = 60_000
const HOOK_RATE_LIMIT_MAX = 5

function checkHookRateLimit(caller: string): boolean {
  const key = `hook:${caller}`
  const now = Date.now()
  const entry = hookRateLimits.get(key)

  if (!entry || now >= entry.resetAt) {
    hookRateLimits.set(key, { count: 1, resetAt: now + HOOK_RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= HOOK_RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

function validateHookParams(body: HookUpdateRequest): { valid: boolean; error?: string } {
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
      if (size <= 0n) {
        return { valid: false, error: 'maxSwapSize must be positive' }
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

export async function POST(request: Request) {
  try {
    const deployerKey = process.env.DEPLOYER_KEY
    if (!deployerKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('x-hook-auth')
    const secret = process.env.HOOK_AUTH_SECRET
    if (!authHeader || !secret || authHeader.length !== secret.length || !timingSafeEqual(Buffer.from(authHeader), Buffer.from(secret))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!checkHookRateLimit(authHeader)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body: HookUpdateRequest = await request.json()

    const validation = validateHookParams(body)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
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

    // Update CouncilFeeHook
    if (body.feeBps !== undefined && HOOKS.COUNCIL_FEE !== '0x0000000000000000000000000000000000000000') {
      const hash = await walletClient.writeContract({
        address: HOOKS.COUNCIL_FEE as Address,
        abi: COUNCIL_FEE_HOOK_ABI,
        functionName: 'setFee',
        args: [body.feeBps],
      })
      await publicClient.waitForTransactionReceipt({ hash })
      txHashes.push(hash)
      console.log(`[Hooks] CouncilFeeHook fee updated to ${body.feeBps} bps, tx: ${hash}`)
    }

    // Update SwapGuardHook
    if (body.maxSwapSize !== undefined && HOOKS.SWAP_GUARD !== '0x0000000000000000000000000000000000000000') {
      const hash = await walletClient.writeContract({
        address: HOOKS.SWAP_GUARD as Address,
        abi: SWAP_GUARD_HOOK_ABI,
        functionName: 'setMaxSwapSize',
        args: [BigInt(body.maxSwapSize)],
      })
      await publicClient.waitForTransactionReceipt({ hash })
      txHashes.push(hash)
      console.log(`[Hooks] SwapGuardHook maxSwapSize updated to ${body.maxSwapSize}, tx: ${hash}`)
    }

    // Update SentimentOracleHook
    if (
      body.sentimentScore !== undefined &&
      body.sentimentReason !== undefined &&
      HOOKS.SENTIMENT_ORACLE !== '0x0000000000000000000000000000000000000000'
    ) {
      const hash = await walletClient.writeContract({
        address: HOOKS.SENTIMENT_ORACLE as Address,
        abi: SENTIMENT_ORACLE_HOOK_ABI,
        functionName: 'updateSentiment',
        args: [body.sentimentScore, body.sentimentReason],
      })
      await publicClient.waitForTransactionReceipt({ hash })
      txHashes.push(hash)
      console.log(`[Hooks] SentimentOracleHook updated to score=${body.sentimentScore}, tx: ${hash}`)
    }

    return NextResponse.json({
      success: true,
      txHashes,
      updated: {
        fee: body.feeBps,
        maxSwapSize: body.maxSwapSize,
        sentiment: body.sentimentScore,
      },
    })
  } catch (err) {
    console.error('[Hooks] Update failed:', err)
    return NextResponse.json(
      { success: false, error: 'Hook update failed' },
      { status: 500 }
    )
  }
}
