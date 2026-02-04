import { createPublicClient, http, type Address, keccak256, encodeAbiParameters } from 'viem'
import { baseSepolia } from 'viem/chains'
import { CONTRACTS, POOL_KEY, RPC_URL, TOKENS } from './constants'

const POOL_MANAGER_ABI = [
  {
    type: 'function',
    name: 'getSlot0',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'protocolFee', type: 'uint24' },
      { name: 'lpFee', type: 'uint24' },
    ],
  },
  {
    type: 'function',
    name: 'getLiquidity',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [{ name: 'liquidity', type: 'uint128' }],
  },
] as const

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

export const getPoolInfo = async (poolKey: PoolKey): Promise<PoolInfo> => {
  const client = getPublicClient()
  const poolId = computePoolId(poolKey)

  try {
    const [slot0, liquidity] = await Promise.all([
      client.readContract({
        address: CONTRACTS.POOL_MANAGER as Address,
        abi: POOL_MANAGER_ABI,
        functionName: 'getSlot0',
        args: [poolId],
      }),
      client.readContract({
        address: CONTRACTS.POOL_MANAGER as Address,
        abi: POOL_MANAGER_ABI,
        functionName: 'getLiquidity',
        args: [poolId],
      }),
    ])

    const isInitialized = slot0[0] !== 0n

    return {
      poolId,
      currency0: poolKey.currency0,
      currency1: poolKey.currency1,
      fee: poolKey.fee,
      tickSpacing: poolKey.tickSpacing,
      hooks: poolKey.hooks,
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
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
]

export const discoverPools = async (): Promise<PoolInfo[]> => {
  const results: PoolInfo[] = []

  for (const poolKey of COMMON_POOLS) {
    const info = await getPoolInfo(poolKey)
    if (info.isInitialized) {
      results.push(info)
    }
  }

  return results
}
