import { createPublicClient, http, encodePacked, keccak256 } from 'viem'
import { baseSepolia } from 'viem/chains'
import { CONTRACTS, TOKENS, POOL_KEY, RPC_URL } from '../lib/uniswap/constants'

const POOL_MANAGER_ABI = [
  {
    inputs: [{ name: 'id', type: 'bytes32' }],
    name: 'getSlot0',
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'protocolFee', type: 'uint24' },
      { name: 'lpFee', type: 'uint24' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

function computePoolId(poolKey: typeof POOL_KEY): `0x${string}` {
  const encoded = encodePacked(
    ['address', 'address', 'uint24', 'int24', 'address'],
    [
      poolKey.currency0,
      poolKey.currency1,
      poolKey.fee,
      poolKey.tickSpacing,
      poolKey.hooks,
    ]
  )
  return keccak256(encoded)
}

async function testUniswapPool() {
  console.log('Testing Uniswap v4 pool on Base Sepolia...')
  console.log(`Pool Manager: ${CONTRACTS.POOL_MANAGER}`)
  console.log(`WETH: ${TOKENS.WETH}`)
  console.log(`USDC: ${TOKENS.USDC}`)

  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  })

  const poolId = computePoolId(POOL_KEY)
  console.log(`Pool ID: ${poolId}`)

  try {
    const slot0 = await client.readContract({
      address: CONTRACTS.POOL_MANAGER,
      abi: POOL_MANAGER_ABI,
      functionName: 'getSlot0',
      args: [poolId],
    })

    if (slot0[0] === 0n) {
      console.log('Pool not initialized or does not exist')
      console.log('Note: Pool may need to be created with initial liquidity')
    } else {
      console.log('Pool found:')
      console.log(`  sqrtPriceX96: ${slot0[0]}`)
      console.log(`  tick: ${slot0[1]}`)
      console.log(`  protocolFee: ${slot0[2]}`)
      console.log(`  lpFee: ${slot0[3]}`)
    }
  } catch (error: any) {
    console.log('Error querying pool:', error.message)
    console.log('This may indicate the pool does not exist yet')
  }

  console.log('\nConstants file created at: apps/web/lib/uniswap/constants.ts')
}

testUniswapPool()
  .then(() => {
    console.log('Test complete')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Test failed:', err.message)
    process.exit(1)
  })
