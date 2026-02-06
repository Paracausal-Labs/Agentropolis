import { useCallback } from 'react'
import { useWalletClient } from 'wagmi'
import {
  createPublicClient,
  encodeAbiParameters,
  encodePacked,
  http,
  parseUnits,
  type Address,
  type Hex,
  type PublicClient,
  type WalletClient,
} from 'viem'
import { baseSepolia } from 'viem/chains'
import type { TradeProposal, ExecutionPlan, SwapReceipt } from '@agentropolis/shared/src/types'
import { CONTRACTS, RPC_URL, TOKEN_DECIMALS } from './constants'
import { type PoolKey } from './pools'
import { getBestFeeTier } from './fee-tier-router'

const UNIVERSAL_ROUTER_ABI = [
  {
    type: 'function',
    name: 'execute',
    stateMutability: 'payable',
    inputs: [
      { name: 'commands', type: 'bytes' },
      { name: 'inputs', type: 'bytes[]' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [],
  },
] as const

const ERC20_ABI = [
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: 'amount', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
] as const

const V4_SWAP_COMMAND = 0x10

const V4_ACTIONS = {
  SWAP_EXACT_IN_SINGLE: 0x06,
  SETTLE_ALL: 0x0c,
  TAKE_ALL: 0x0f,
} as const

const mockEnabled =
  process.env.NEXT_PUBLIC_UNISWAP_MOCK === 'true' ||
  process.env.UNISWAP_MOCK === 'true'

const toRandomHex = () => {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return `0x${Array.from(bytes)
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('')}`
  }

  const fallback = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
  return `0x${fallback.toString(16).padStart(64, '0')}`
}

const getTokenDecimals = (address: string) =>
  TOKEN_DECIMALS[address.toLowerCase()] ?? 18

const sanitizeNumericString = (value: string): string => {
  if (!value) return '0'
  const cleaned = value
    .replace(/[,_]/g, '')
    .replace(/\s*(ETH|WETH|USDC|USD|wei|gwei)\s*/gi, '')
    .replace(/[~≈]/g, '')
    .trim()
  const match = cleaned.match(/^-?\d+\.?\d*/)
  return match ? match[0] : '0'
}

const parseAmount = (value: string | number, decimals: number) => {
  if (!value) return 0n
  const sanitized = sanitizeNumericString(String(value))
  try {
    return parseUnits(sanitized, decimals)
  } catch {
    try {
      return BigInt(sanitized)
    } catch {
      return 0n
    }
  }
}

const DEFAULT_SLIPPAGE_BPS = 300 // 3% default slippage from quote

const encodeV4SwapInput = (
  account: Address,
  amountIn: bigint,
  minAmountOut: bigint,
  zeroForOne: boolean,
  poolKey: PoolKey
): Hex => {
  const actions = encodePacked(
    ['uint8', 'uint8', 'uint8'],
    [V4_ACTIONS.SWAP_EXACT_IN_SINGLE, V4_ACTIONS.SETTLE_ALL, V4_ACTIONS.TAKE_ALL]
  )

  const swapParams = encodeAbiParameters(
    [
      {
        name: 'params',
        type: 'tuple',
        components: [
          {
            name: 'poolKey',
            type: 'tuple',
            components: [
              { name: 'currency0', type: 'address' },
              { name: 'currency1', type: 'address' },
              { name: 'fee', type: 'uint24' },
              { name: 'tickSpacing', type: 'int24' },
              { name: 'hooks', type: 'address' },
            ],
          },
          { name: 'zeroForOne', type: 'bool' },
          { name: 'amountIn', type: 'uint128' },
          { name: 'amountOutMinimum', type: 'uint128' },
          { name: 'hookData', type: 'bytes' },
        ],
      },
    ],
    [
      {
        poolKey: {
          currency0: poolKey.currency0,
          currency1: poolKey.currency1,
          fee: poolKey.fee,
          tickSpacing: poolKey.tickSpacing,
          hooks: poolKey.hooks,
        },
        zeroForOne,
        amountIn,
        amountOutMinimum: minAmountOut,
        hookData: '0x',
      },
    ]
  )

  const currencyIn = zeroForOne ? poolKey.currency0 : poolKey.currency1
  const currencyOut = zeroForOne ? poolKey.currency1 : poolKey.currency0

  const settleParams = encodeAbiParameters(
    [{ name: 'currency', type: 'address' }, { name: 'maxAmount', type: 'uint256' }],
    [currencyIn, amountIn]
  )

  const takeParams = encodeAbiParameters(
    [{ name: 'currency', type: 'address' }, { name: 'recipient', type: 'address' }, { name: 'minAmount', type: 'uint256' }],
    [currencyOut, account, minAmountOut]
  )

  return encodeAbiParameters(
    [{ name: 'actions', type: 'bytes' }, { name: 'params', type: 'bytes[]' }],
    [actions, [swapParams, settleParams, takeParams]]
  )
}

async function readBalances(
  account: Address,
  tokenIn: Address,
  tokenOut: Address,
  publicClient: PublicClient
): Promise<{ tokenIn: bigint; tokenOut: bigint }> {
  const [balIn, balOut] = await Promise.all([
    publicClient.readContract({
      address: tokenIn,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account],
    }),
    publicClient.readContract({
      address: tokenOut,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account],
    }),
  ])
  return { tokenIn: balIn, tokenOut: balOut }
}

async function simulateSwap(
  account: Address,
  amountIn: bigint,
  minAmountOut: bigint,
  zeroForOne: boolean,
  poolKey: PoolKey,
  deadlineSeconds: number,
  publicClient: PublicClient
): Promise<{ ok: boolean; error?: string; gasEstimate?: bigint }> {
  const swapInput = encodeV4SwapInput(account, amountIn, minAmountOut, zeroForOne, poolKey)
  const commands: Hex = `0x${V4_SWAP_COMMAND.toString(16).padStart(2, '0')}`

  try {
    await publicClient.simulateContract({
      address: CONTRACTS.UNIVERSAL_ROUTER,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: 'execute',
      args: [commands, [swapInput], BigInt(deadlineSeconds)],
      account,
    })
    // If simulation succeeds, try to estimate gas
    let gasEstimate: bigint | undefined
    try {
      gasEstimate = await publicClient.estimateContractGas({
        address: CONTRACTS.UNIVERSAL_ROUTER,
        abi: UNIVERSAL_ROUTER_ABI,
        functionName: 'execute',
        args: [commands, [swapInput], BigInt(deadlineSeconds)],
        account,
      })
    } catch {
      // gas estimation can fail even when simulation succeeds
    }
    return { ok: true, gasEstimate }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Simulation failed',
    }
  }
}

export async function buildExecutionPlan(
  proposal: TradeProposal,
  publicClient: PublicClient,
  account: Address
): Promise<ExecutionPlan> {
  const tokenIn = proposal.pair.tokenIn.address
  const tokenOut = proposal.pair.tokenOut.address
  const amountIn = parseAmount(proposal.amountIn, getTokenDecimals(tokenIn))

  if (amountIn <= 0n) {
    throw new Error('Invalid amountIn: must be greater than 0')
  }

  // Route through best fee tier
  const { poolKey, quote } = await getBestFeeTier(tokenIn, tokenOut, amountIn)

  console.log(`[executor] Quote: ${quote.amountOut} out via ${poolKey.fee}bps pool`)

  // Compute minAmountOut from quote + slippage
  const slippageBps = DEFAULT_SLIPPAGE_BPS
  const quoteOutWei = BigInt(quote.amountOutWei)
  const minAmountOut = quoteOutWei - (quoteOutWei * BigInt(slippageBps)) / 10_000n

  // Compute deadline
  const nowSeconds = Math.floor(Date.now() / 1000)
  const proposalDeadline = proposal.deadline > 1_000_000_000_000
    ? Math.floor(proposal.deadline / 1000)
    : proposal.deadline
  const deadlineSeconds = Math.max(proposalDeadline, nowSeconds + 300) // at least 5 min from now

  // Determine swap direction
  const zeroForOne = tokenIn.toLowerCase() === poolKey.currency0.toLowerCase()

  // Simulate
  const simulation = await simulateSwap(
    account,
    amountIn,
    minAmountOut,
    zeroForOne,
    poolKey,
    deadlineSeconds,
    publicClient
  )

  return {
    quote,
    slippageBps,
    minAmountOut: minAmountOut.toString(),
    deadlineSeconds,
    simulation: {
      ok: simulation.ok,
      error: simulation.error,
      gasEstimate: simulation.gasEstimate?.toString(),
    },
  }
}

const BASE_SEPOLIA_CHAIN_ID = 84532

export interface SwapResult {
  txHash: string
  executionPlan: ExecutionPlan
  receipt: SwapReceipt
}

export const executeSwap = async (
  proposal: TradeProposal,
  walletClient?: WalletClient
): Promise<SwapResult> => {
  if (mockEnabled) {
    console.info('[uniswap][mock] swap', {
      proposalId: proposal.id,
      pair: proposal.pair,
      amountIn: proposal.amountIn,
      expectedAmountOut: proposal.expectedAmountOut,
      maxSlippage: proposal.maxSlippage,
      deadline: proposal.deadline,
    })
    const mockPlan: ExecutionPlan = {
      quote: {
        amountIn: proposal.amountIn,
        amountInWei: '0',
        amountOut: proposal.expectedAmountOut,
        amountOutWei: '0',
        source: 'offchain',
        timestamp: Date.now(),
        poolKey: { currency0: '', currency1: '', fee: 3000, tickSpacing: 60, hooks: '' },
        sqrtPriceX96: '0',
        tick: 0,
      },
      slippageBps: DEFAULT_SLIPPAGE_BPS,
      minAmountOut: '0',
      deadlineSeconds: 0,
      simulation: { ok: true },
    }
    const mockReceipt: SwapReceipt = {
      txHash: toRandomHex(),
      blockNumber: 0,
      gasUsed: '0',
      balanceBefore: { tokenIn: '0', tokenOut: '0' },
      balanceAfter: { tokenIn: '0', tokenOut: '0' },
      realizedAmountIn: '0',
      realizedAmountOut: '0',
      slippageVsQuoteBps: 0,
    }
    return { txHash: mockReceipt.txHash, executionPlan: mockPlan, receipt: mockReceipt }
  }

  if (!walletClient?.account?.address) {
    throw new Error('Wallet not connected. Please connect your wallet to execute swaps.')
  }

  if (walletClient.chain?.id !== BASE_SEPOLIA_CHAIN_ID) {
    throw new Error(`Wrong network. Please switch to Base Sepolia (chainId: ${BASE_SEPOLIA_CHAIN_ID})`)
  }

  const account = walletClient.account.address
  const publicClient = createPublicClient({
    chain: walletClient.chain ?? baseSepolia,
    transport: http(RPC_URL),
  })

  // 1. Build execution plan (quote + simulate)
  const plan = await buildExecutionPlan(proposal, publicClient, account)
  console.log('[executor] Execution plan:', {
    quoteOut: plan.quote.amountOut,
    minAmountOut: plan.minAmountOut,
    feeTier: plan.quote.poolKey.fee,
    simulationOk: plan.simulation.ok,
  })

  // 2. If simulation fails → throw
  if (!plan.simulation.ok) {
    throw new Error(`Swap simulation failed: ${plan.simulation.error}`)
  }

  const tokenIn = proposal.pair.tokenIn.address as Address
  const tokenOut = proposal.pair.tokenOut.address as Address
  const amountIn = parseAmount(proposal.amountIn, getTokenDecimals(tokenIn))
  const minAmountOut = BigInt(plan.minAmountOut)
  const poolKey: PoolKey = {
    currency0: plan.quote.poolKey.currency0 as Address,
    currency1: plan.quote.poolKey.currency1 as Address,
    fee: plan.quote.poolKey.fee,
    tickSpacing: plan.quote.poolKey.tickSpacing,
    hooks: plan.quote.poolKey.hooks as Address,
  }
  const zeroForOne = tokenIn.toLowerCase() === poolKey.currency0.toLowerCase()

  // 3. Read balances before
  const balBefore = await readBalances(account, tokenIn, tokenOut, publicClient)

  // 4. Approve if needed
  const allowance = await publicClient.readContract({
    address: tokenIn,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [account, CONTRACTS.UNIVERSAL_ROUTER],
  })

  if (allowance < amountIn) {
    const approvalHash = await walletClient.writeContract({
      address: tokenIn,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.UNIVERSAL_ROUTER, amountIn],
      account,
      chain: walletClient.chain ?? null,
    })
    await publicClient.waitForTransactionReceipt({ hash: approvalHash })
  }

  // 5. Execute swap
  const swapInput = encodeV4SwapInput(account, amountIn, minAmountOut, zeroForOne, poolKey)
  const commands: Hex = `0x${V4_SWAP_COMMAND.toString(16).padStart(2, '0')}`

  const txHash = await walletClient.writeContract({
    address: CONTRACTS.UNIVERSAL_ROUTER,
    abi: UNIVERSAL_ROUTER_ABI,
    functionName: 'execute',
    args: [commands, [swapInput], BigInt(plan.deadlineSeconds)],
    account,
    chain: walletClient.chain ?? null,
  })

  // 6. Wait for receipt + read balances after
  const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
  const balAfter = await readBalances(account, tokenIn, tokenOut, publicClient)

  // 7. Compute SwapReceipt
  const realizedIn = balBefore.tokenIn - balAfter.tokenIn
  const realizedOut = balAfter.tokenOut - balBefore.tokenOut
  const quoteOutWei = BigInt(plan.quote.amountOutWei)

  let slippageVsQuoteBps = 0
  if (quoteOutWei > 0n) {
    // positive = worse than quote, negative = better than quote
    slippageVsQuoteBps = Number(((quoteOutWei - realizedOut) * 10_000n) / quoteOutWei)
  }

  const receipt: SwapReceipt = {
    txHash,
    blockNumber: Number(txReceipt.blockNumber),
    gasUsed: txReceipt.gasUsed.toString(),
    balanceBefore: { tokenIn: balBefore.tokenIn.toString(), tokenOut: balBefore.tokenOut.toString() },
    balanceAfter: { tokenIn: balAfter.tokenIn.toString(), tokenOut: balAfter.tokenOut.toString() },
    realizedAmountIn: realizedIn.toString(),
    realizedAmountOut: realizedOut.toString(),
    slippageVsQuoteBps,
  }

  console.log('[executor] Swap complete:', {
    txHash,
    realizedOut: realizedOut.toString(),
    slippageVsQuoteBps,
    gasUsed: txReceipt.gasUsed.toString(),
  })

  return { txHash, executionPlan: plan, receipt }
}

export const useSwapExecutor = () => {
  const { data: walletClient } = useWalletClient()

  const execute = useCallback(
    (proposal: TradeProposal) => executeSwap(proposal, walletClient ?? undefined),
    [walletClient]
  )

  return { executeSwap: execute, walletClient }
}
