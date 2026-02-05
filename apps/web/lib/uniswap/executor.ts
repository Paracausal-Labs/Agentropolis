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
  type WalletClient,
} from 'viem'
import { baseSepolia } from 'viem/chains'
import type { TradeProposal } from '@agentropolis/shared/src/types'
import { CONTRACTS, POOL_KEY, RPC_URL, TOKEN_DECIMALS } from './constants'
import { computePoolId, type PoolKey } from './pools'

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

const computeMinAmountOut = (expectedAmountOut: bigint, maxSlippage: number) => {
  if (expectedAmountOut === 0n) return 0n
  const slippage = Number.isFinite(maxSlippage) ? maxSlippage : 0
  const slippageBps =
    slippage <= 1
      ? Math.round(slippage * 10_000) // treat 0-1 as fraction
      : Math.round(slippage) // treat >1 as basis points
  const clampedBps = Math.max(0, Math.min(10_000, slippageBps))
  return expectedAmountOut - (expectedAmountOut * BigInt(clampedBps)) / 10_000n
}

const encodeV4SwapInput = (
  account: Address,
  amountIn: bigint,
  minAmountOut: bigint,
  zeroForOne: boolean
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
          currency0: POOL_KEY.currency0,
          currency1: POOL_KEY.currency1,
          fee: POOL_KEY.fee,
          tickSpacing: POOL_KEY.tickSpacing,
          hooks: POOL_KEY.hooks,
        },
        zeroForOne,
        amountIn,
        amountOutMinimum: minAmountOut,
        hookData: '0x',
      },
    ]
  )

  const currencyIn = zeroForOne ? POOL_KEY.currency0 : POOL_KEY.currency1
  const currencyOut = zeroForOne ? POOL_KEY.currency1 : POOL_KEY.currency0

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

const assertSupportedPair = (proposal: TradeProposal) => {
  const tokenIn = proposal.pair.tokenIn.address.toLowerCase()
  const tokenOut = proposal.pair.tokenOut.address.toLowerCase()
  const currency0 = POOL_KEY.currency0.toLowerCase()
  const currency1 = POOL_KEY.currency1.toLowerCase()

  const isMatch =
    (tokenIn === currency0 && tokenOut === currency1) ||
    (tokenIn === currency1 && tokenOut === currency0)

  if (!isMatch) {
    throw new Error('Unsupported token pair for configured pool')
  }
}

const BASE_SEPOLIA_CHAIN_ID = 84532

export const executeSwap = async (
  proposal: TradeProposal,
  walletClient?: WalletClient
): Promise<{ txHash: string }> => {
  if (mockEnabled) {
    console.info('[uniswap][mock] swap', {
      proposalId: proposal.id,
      pair: proposal.pair,
      amountIn: proposal.amountIn,
      expectedAmountOut: proposal.expectedAmountOut,
      maxSlippage: proposal.maxSlippage,
      deadline: proposal.deadline,
    })
    return { txHash: toRandomHex() }
  }

  if (!walletClient?.account?.address) {
    throw new Error('Wallet not connected. Please connect your wallet to execute swaps.')
  }

  if (walletClient.chain?.id !== BASE_SEPOLIA_CHAIN_ID) {
    throw new Error(`Wrong network. Please switch to Base Sepolia (chainId: ${BASE_SEPOLIA_CHAIN_ID})`)
  }

  assertSupportedPair(proposal)

  const account = walletClient.account.address
  const publicClient = createPublicClient({
    chain: walletClient.chain ?? baseSepolia,
    transport: http(RPC_URL),
  })

  const poolId = computePoolId(POOL_KEY as PoolKey)
  console.log('[uniswap] Executing swap on pool:', poolId)

  const amountIn = parseAmount(
    proposal.amountIn,
    getTokenDecimals(proposal.pair.tokenIn.address)
  )
  const expectedAmountOut = parseAmount(
    proposal.expectedAmountOut,
    getTokenDecimals(proposal.pair.tokenOut.address)
  )

  if (amountIn <= 0n) {
    throw new Error('Invalid amountIn: must be greater than 0')
  }

  if (expectedAmountOut <= 0n) {
    throw new Error('Invalid expectedAmountOut: must be greater than 0')
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const deadlineSeconds = proposal.deadline > 1_000_000_000_000
    ? Math.floor(proposal.deadline / 1000)
    : proposal.deadline
  if (deadlineSeconds <= nowSeconds) {
    throw new Error('Proposal deadline has expired')
  }

  const minAmountOut = computeMinAmountOut(expectedAmountOut, proposal.maxSlippage)

  const tokenIn = proposal.pair.tokenIn.address.toLowerCase()
  const zeroForOne = tokenIn === POOL_KEY.currency0.toLowerCase()

  const allowance = await publicClient.readContract({
    address: proposal.pair.tokenIn.address as Address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [account, CONTRACTS.UNIVERSAL_ROUTER],
  })

  if (allowance < amountIn) {
    const approvalHash = await walletClient.writeContract({
      address: proposal.pair.tokenIn.address as Address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.UNIVERSAL_ROUTER, amountIn],
      account,
      chain: walletClient.chain ?? null,
    })

    await publicClient.waitForTransactionReceipt({ hash: approvalHash })
  }

  const swapInput = encodeV4SwapInput(account, amountIn, minAmountOut, zeroForOne)
  const commands: Hex = `0x${V4_SWAP_COMMAND.toString(16).padStart(2, '0')}`
  const inputs: Hex[] = [swapInput]

  const txHash = await walletClient.writeContract({
    address: CONTRACTS.UNIVERSAL_ROUTER,
    abi: UNIVERSAL_ROUTER_ABI,
    functionName: 'execute',
    args: [commands, inputs, BigInt(deadlineSeconds)],
    account,
    chain: walletClient.chain ?? null,
  })

  return { txHash }
}

export const useSwapExecutor = () => {
  const { data: walletClient } = useWalletClient()

  const execute = useCallback(
    (proposal: TradeProposal) => executeSwap(proposal, walletClient ?? undefined),
    [walletClient]
  )

  return { executeSwap: execute, walletClient }
}
