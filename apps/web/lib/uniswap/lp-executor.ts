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
import type { TradeProposal } from '@agentropolis/shared'
import { CONTRACTS, POOL_KEY, RPC_URL, TOKEN_DECIMALS, TOKENS } from './constants'
import type { PoolKey } from './pools'

const POSITION_MANAGER_ABI = [
  {
    type: 'function',
    name: 'modifyLiquidities',
    stateMutability: 'payable',
    inputs: [
      { name: 'unlockData', type: 'bytes' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'nextTokenId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

const PM_ACTIONS = {
  MINT_POSITION: 0x01,
  SETTLE_PAIR: 0x10,
  TAKE_PAIR: 0x16,
} as const

const mockEnabled =
  process.env.NEXT_PUBLIC_UNISWAP_MOCK === 'true' || process.env.UNISWAP_MOCK === 'true'

const toRandomHex = (): `0x${string}` => {
  const bytes = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`
}

const BASE_SEPOLIA_CHAIN_ID = 84532

const getTokenDecimals = (address: string) => TOKEN_DECIMALS[address.toLowerCase()] ?? 18

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
    return 0n
  }
}

const MAX_TICK = 887220
const MIN_TICK = -887220

export interface LPParams {
  poolKey: PoolKey
  tickLower: number
  tickUpper: number
  amount0Desired: bigint
  amount1Desired: bigint
  amount0Min: bigint
  amount1Min: bigint
  recipient: Address
  deadline: bigint
}

const encodeMintParams = (params: LPParams): Hex => {
  return encodeAbiParameters(
    [
      {
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
          { name: 'tickLower', type: 'int24' },
          { name: 'tickUpper', type: 'int24' },
          { name: 'liquidity', type: 'uint256' },
          { name: 'amount0Max', type: 'uint128' },
          { name: 'amount1Max', type: 'uint128' },
          { name: 'owner', type: 'address' },
          { name: 'hookData', type: 'bytes' },
        ],
      },
    ],
    [
      {
        poolKey: {
          currency0: params.poolKey.currency0,
          currency1: params.poolKey.currency1,
          fee: params.poolKey.fee,
          tickSpacing: params.poolKey.tickSpacing,
          hooks: params.poolKey.hooks,
        },
        tickLower: params.tickLower,
        tickUpper: params.tickUpper,
        // TODO: Production needs proper liquidity calculation using SqrtPriceMath
        // Currently using amount0Desired as liquidity which is incorrect for production
        liquidity: params.amount0Desired,
        amount0Max: params.amount0Desired,
        amount1Max: params.amount1Desired,
        owner: params.recipient,
        hookData: '0x' as Hex,
      },
    ]
  )
}

const encodeSettlePairParams = (currency0: Address, currency1: Address): Hex => {
  return encodeAbiParameters(
    [
      { name: 'currency0', type: 'address' },
      { name: 'currency1', type: 'address' },
    ],
    [currency0, currency1]
  )
}

export const addLiquidity = async (
  proposal: TradeProposal,
  walletClient?: WalletClient
): Promise<{ txHash: string; positionId?: string }> => {
  if (mockEnabled) {
    console.info('[lp-executor][mock] addLiquidity', {
      proposalId: proposal.id,
      strategyType: proposal.strategyType,
      tickLower: proposal.tickLower,
      tickUpper: proposal.tickUpper,
    })
    return { txHash: toRandomHex(), positionId: `mock-${Date.now()}` }
  }

  if (!walletClient?.account?.address) {
    throw new Error('Wallet not connected. Please connect your wallet to add liquidity.')
  }

  if (walletClient.chain?.id !== BASE_SEPOLIA_CHAIN_ID) {
    throw new Error(`Wrong network. Please switch to Base Sepolia (chainId: ${BASE_SEPOLIA_CHAIN_ID})`)
  }

  const account = walletClient.account.address
  const publicClient = createPublicClient({
    chain: walletClient.chain ?? baseSepolia,
    transport: http(RPC_URL),
  })

  const amount0 = parseAmount(proposal.amountIn, getTokenDecimals(TOKENS.USDC))
  const amount1 = parseAmount(proposal.amountIn, getTokenDecimals(TOKENS.WETH))

  const tickLower = proposal.tickLower ?? MIN_TICK
  const tickUpper = proposal.tickUpper ?? MAX_TICK

  const poolKey: PoolKey = {
    currency0: POOL_KEY.currency0 as Address,
    currency1: POOL_KEY.currency1 as Address,
    fee: POOL_KEY.fee,
    tickSpacing: POOL_KEY.tickSpacing,
    hooks: POOL_KEY.hooks as Address,
  }

  for (const token of [TOKENS.USDC, TOKENS.WETH]) {
    const allowance = await publicClient.readContract({
      address: token as Address,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [account, CONTRACTS.POSITION_MANAGER as Address],
    })

    const requiredAmount = token === TOKENS.USDC ? amount0 : amount1
    if (allowance < requiredAmount) {
      const approvalHash = await walletClient.writeContract({
        address: token as Address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.POSITION_MANAGER as Address, requiredAmount * 2n],
        account,
        chain: walletClient.chain ?? null,
      })
      await publicClient.waitForTransactionReceipt({ hash: approvalHash })
    }
  }

  const actions = encodePacked(
    ['uint8', 'uint8'],
    [PM_ACTIONS.MINT_POSITION, PM_ACTIONS.SETTLE_PAIR]
  )

  const mintParams = encodeMintParams({
    poolKey,
    tickLower,
    tickUpper,
    amount0Desired: amount0,
    amount1Desired: amount1,
    amount0Min: 0n,
    amount1Min: 0n,
    recipient: account,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
  })

  const settleParams = encodeSettlePairParams(poolKey.currency0, poolKey.currency1)

  const unlockData = encodeAbiParameters(
    [
      { name: 'actions', type: 'bytes' },
      { name: 'params', type: 'bytes[]' },
    ],
    [actions, [mintParams, settleParams]]
  )

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)

  const txHash = await walletClient.writeContract({
    address: CONTRACTS.POSITION_MANAGER as Address,
    abi: POSITION_MANAGER_ABI,
    functionName: 'modifyLiquidities',
    args: [unlockData, deadline],
    account,
    chain: walletClient.chain ?? null,
  })

  return { txHash }
}

export const useLPExecutor = () => {
  const { data: walletClient } = useWalletClient()

  const execute = useCallback(
    (proposal: TradeProposal) => addLiquidity(proposal, walletClient ?? undefined),
    [walletClient]
  )

  return { addLiquidity: execute, walletClient }
}
