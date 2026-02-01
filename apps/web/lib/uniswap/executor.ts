import { useCallback } from 'react'
import { useWalletClient } from 'wagmi'
import {
  createPublicClient,
  encodeAbiParameters,
  http,
  type Address,
  type Hex,
  type WalletClient,
} from 'viem'
import { baseSepolia } from 'viem/chains'
import type { TradeProposal } from '@agentropolis/shared/src/types'
import { CONTRACTS, POOL_KEY, RPC_URL } from './constants'

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

const V4_SWAP_COMMAND = '0x00'

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

const parseAmount = (value: string) => {
  if (!value) return 0n
  try {
    return BigInt(value)
  } catch {
    return 0n
  }
}

const computeMinAmountOut = (expectedAmountOut: bigint, maxSlippage: number) => {
  if (expectedAmountOut === 0n) return 0n
  const slippage = Number.isFinite(maxSlippage) ? maxSlippage : 0
  const slippageBps = Math.max(0, Math.min(10_000, Math.round(slippage * 10_000)))
  return expectedAmountOut - (expectedAmountOut * BigInt(slippageBps)) / 10_000n
}

const encodeV4SwapInput = (
  account: Address,
  amountIn: bigint,
  minAmountOut: bigint
): Hex => {
  return encodeAbiParameters(
    [
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
      { name: 'amountIn', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    [
      {
        currency0: POOL_KEY.currency0,
        currency1: POOL_KEY.currency1,
        fee: POOL_KEY.fee,
        tickSpacing: POOL_KEY.tickSpacing,
        hooks: POOL_KEY.hooks,
      },
      amountIn,
      minAmountOut,
      account,
    ]
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

export const executeSwap = async (
  proposal: TradeProposal,
  walletClient?: WalletClient
): Promise<{ txHash: string }> => {
  if (mockEnabled || !walletClient) {
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

  if (!walletClient.account?.address) {
    return { txHash: toRandomHex() }
  }

  assertSupportedPair(proposal)

  const account = walletClient.account.address
  const publicClient = createPublicClient({
    chain: walletClient.chain ?? baseSepolia,
    transport: http(RPC_URL),
  })

  const amountIn = parseAmount(proposal.amountIn)
  const expectedAmountOut = parseAmount(proposal.expectedAmountOut)
  const minAmountOut = computeMinAmountOut(expectedAmountOut, proposal.maxSlippage)

  const allowance = await publicClient.readContract({
    address: proposal.pair.tokenIn.address as Address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [account, CONTRACTS.PERMIT2],
  })

  if (allowance < amountIn) {
    const approvalHash = await walletClient.writeContract({
      address: proposal.pair.tokenIn.address as Address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.PERMIT2, amountIn],
      account,
      chain: walletClient.chain ?? null,
    })

    await publicClient.waitForTransactionReceipt({ hash: approvalHash })
  }

  const swapInput = encodeV4SwapInput(account, amountIn, minAmountOut)
  const commands: Hex = V4_SWAP_COMMAND
  const inputs: Hex[] = [swapInput]

  const txHash = await walletClient.writeContract({
    address: CONTRACTS.UNIVERSAL_ROUTER,
    abi: UNIVERSAL_ROUTER_ABI,
    functionName: 'execute',
    args: [commands, inputs, BigInt(proposal.deadline)],
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
