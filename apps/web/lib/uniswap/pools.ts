import { createPublicClient, http, type Address, keccak256, encodeAbiParameters, encodePacked, numberToHex, hexToBigInt } from 'viem'
import { baseSepolia } from 'viem/chains'
import { CONTRACTS, POOL_KEY, RPC_URL, TOKENS, HOOKS, DYNAMIC_FEE_FLAG } from './constants'

// V4 PoolManager uses extsload (EIP-7702) for state reads, not regular functions
const EXTSLOAD_ABI = [
  {
    type: 'function',
    name: 'extsload',
    stateMutability: 'view',
    inputs: [{ name: 'slot', type: 'bytes32' }],
    outputs: [{ name: 'value', type: 'bytes32' }],
  },
] as const

// StateLibrary constants (from v4-core/src/libraries/StateLibrary.sol)
const POOLS_SLOT = '0x0000000000000000000000000000000000000000000000000000000000000006' as `0x${string}`
const LIQUIDITY_OFFSET = 3n

export interface PoolInfo {
  poolId: `0x${string}`
  currency0: Address
  currency1: Address
  fee: number
  tickSpacing: number
  hooks: Address
  sqrtPriceX96: bigint
  tick: number
  liquidity: bigint
  isInitialized: boolean
}

export interface PoolKey {
  currency0: Address
  currency1: Address
  fee: number
  tickSpacing: number
  hooks: Address
}

const sortCurrencies = (tokenA: Address, tokenB: Address): [Address, Address] => {
  return tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA]
}

export const computePoolId = (poolKey: PoolKey): `0x${string}` => {
  const encoded = encodeAbiParameters(
    [
      {
        type: 'tuple',
        components: [
          { name: 'currency0', type: 'address' },
          { name: 'currency1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickSpacing', type: 'int24' },
          { name: 'hooks', type: 'address' },
        ],
      },
    ],
    [
      {
        currency0: poolKey.currency0,
        currency1: poolKey.currency1,
        fee: poolKey.fee,
        tickSpacing: poolKey.tickSpacing,
        hooks: poolKey.hooks,
      },
    ]
  )
  return keccak256(encoded)
}

const getPublicClient = () =>
  createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  })

// Replicate StateLibrary._getPoolStateSlot: keccak256(abi.encodePacked(poolId, POOLS_SLOT))
const getPoolStateSlot = (poolId: `0x${string}`): `0x${string}` => {
  return keccak256(encodePacked(['bytes32', 'bytes32'], [poolId, POOLS_SLOT]))
}

// Parse packed slot0: [24 bits lpFee | 24 bits protocolFee | 24 bits tick | 160 bits sqrtPriceX96]
const parseSlot0 = (data: `0x${string}`): { sqrtPriceX96: bigint; tick: number } => {
  const raw = hexToBigInt(data)
  const sqrtPriceX96 = raw & ((1n << 160n) - 1n)
  const tickRaw = Number((raw >> 160n) & 0xFFFFFFn)
  const tick = tickRaw >= 0x800000 ? tickRaw - 0x1000000 : tickRaw
  return { sqrtPriceX96, tick }
}

export const getPoolInfo = async (poolKey: PoolKey): Promise<PoolInfo> => {
  const client = getPublicClient()
  const poolId = computePoolId(poolKey)

  try {
    const stateSlot = getPoolStateSlot(poolId)
    const liquiditySlot = numberToHex(hexToBigInt(stateSlot) + LIQUIDITY_OFFSET, { size: 32 })

    const [slot0Data, liquidityData] = await Promise.all([
      client.readContract({
        address: CONTRACTS.POOL_MANAGER as Address,
        abi: EXTSLOAD_ABI,
        functionName: 'extsload',
        args: [stateSlot],
      }),
      client.readContract({
        address: CONTRACTS.POOL_MANAGER as Address,
        abi: EXTSLOAD_ABI,
        functionName: 'extsload',
        args: [liquiditySlot],
      }),
    ])

    const { sqrtPriceX96, tick } = parseSlot0(slot0Data)
    const liquidity = hexToBigInt(liquidityData) & ((1n << 128n) - 1n)
    const isInitialized = sqrtPriceX96 !== 0n

    return {
      poolId,
      currency0: poolKey.currency0,
      currency1: poolKey.currency1,
      fee: poolKey.fee,
      tickSpacing: poolKey.tickSpacing,
      hooks: poolKey.hooks,
      sqrtPriceX96,
      tick,
      liquidity,
      isInitialized,
    }
  } catch (err) {
    console.error('[pools] Failed to get pool info:', err)
    return {
      poolId,
      currency0: poolKey.currency0,
      currency1: poolKey.currency1,
      fee: poolKey.fee,
      tickSpacing: poolKey.tickSpacing,
      hooks: poolKey.hooks,
      sqrtPriceX96: 0n,
      tick: 0,
      liquidity: 0n,
      isInitialized: false,
    }
  }
}

export const getDefaultPoolInfo = () => getPoolInfo(POOL_KEY as PoolKey)

export const findInitializedPool = async (
  tokenA: Address,
  tokenB: Address,
  feeTiers = [500, 3000, 10000]
): Promise<PoolInfo | null> => {
  const [currency0, currency1] = sortCurrencies(tokenA, tokenB)

  for (const fee of feeTiers) {
    const tickSpacing = fee === 500 ? 10 : fee === 3000 ? 60 : 200
    const poolKey: PoolKey = {
      currency0,
      currency1,
      fee,
      tickSpacing,
      hooks: '0x0000000000000000000000000000000000000000' as Address,
    }

    const info = await getPoolInfo(poolKey)
    if (info.isInitialized) {
      return info
    }
  }

  return null
}

export const COMMON_POOLS: PoolKey[] = [
  {
    currency0: TOKENS.USDC as Address,
    currency1: TOKENS.WETH as Address,
    fee: 3000,
    tickSpacing: 60,
    hooks: '0x0000000000000000000000000000000000000000' as Address,
  },
  {
    currency0: TOKENS.USDC as Address,
    currency1: TOKENS.WETH as Address,
    fee: 500,
    tickSpacing: 10,
    hooks: '0x0000000000000000000000000000000000000000' as Address,
  },
  {
    currency0: TOKENS.USDC as Address,
    currency1: TOKENS.WETH as Address,
    fee: 10000,
    tickSpacing: 200,
    hooks: '0x0000000000000000000000000000000000000000' as Address,
  },
]

// Hook-enabled pools — discovered automatically after deployment
export const HOOK_POOLS: PoolKey[] = [
  // CouncilFeeHook: AI council controls dynamic fees
  ...(HOOKS.COUNCIL_FEE !== '0x0000000000000000000000000000000000000000'
    ? [{
        currency0: TOKENS.USDC as Address,
        currency1: TOKENS.WETH as Address,
        fee: DYNAMIC_FEE_FLAG,
        tickSpacing: 60,
        hooks: HOOKS.COUNCIL_FEE as Address,
      }]
    : []),
  // SwapGuardHook: Risk Sentinel controls max swap size
  ...(HOOKS.SWAP_GUARD !== '0x0000000000000000000000000000000000000000'
    ? [{
        currency0: TOKENS.USDC as Address,
        currency1: TOKENS.WETH as Address,
        fee: 3000,
        tickSpacing: 60,
        hooks: HOOKS.SWAP_GUARD as Address,
      }]
    : []),
  // SentimentOracleHook: records council sentiment on-chain
  ...(HOOKS.SENTIMENT_ORACLE !== '0x0000000000000000000000000000000000000000'
    ? [{
        currency0: TOKENS.USDC as Address,
        currency1: TOKENS.WETH as Address,
        fee: 3000,
        tickSpacing: 60,
        hooks: HOOKS.SENTIMENT_ORACLE as Address,
      }]
    : []),
]

export const discoverPools = async (): Promise<PoolInfo[]> => {
  const results: PoolInfo[] = []
  const allPools = [...COMMON_POOLS, ...HOOK_POOLS]

  for (const poolKey of allPools) {
    const info = await getPoolInfo(poolKey)
    if (info.isInitialized) {
      results.push(info)
    }
  }

  return results
}
