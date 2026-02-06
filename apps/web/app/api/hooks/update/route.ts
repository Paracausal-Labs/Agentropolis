import { NextResponse } from 'next/server'
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

export async function POST(request: Request) {
  try {
    const deployerKey = process.env.DEPLOYER_KEY
    if (!deployerKey) {
      return NextResponse.json(
        { success: false, error: 'DEPLOYER_KEY not configured' },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('x-hook-auth')
    if (authHeader !== process.env.HOOK_AUTH_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: HookUpdateRequest = await request.json()
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
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
