import type { SwapQuote } from '@agentropolis/shared/src/types'
import { getPoolInfo, type PoolKey } from './pools'
import { TOKEN_DECIMALS, DYNAMIC_FEE_FLAG } from './constants'
import { formatUnits } from 'viem'

const Q96 = 1n << 96n

/**
 * Off-chain quoter using within-tick pool math.
 * Only valid when the swap stays within the current tick — suitable for
 * small-to-medium swaps on pools with deep liquidity.
 */
export async function getSwapQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  poolKey: PoolKey
): Promise<SwapQuote> {
  const pool = await getPoolInfo(poolKey)

  if (!pool.isInitialized) {
    throw new Error('Pool not initialized')
  }
  if (pool.liquidity === 0n) {
    throw new Error('Pool has zero liquidity')
  }

  const zeroForOne = tokenIn.toLowerCase() === poolKey.currency0.toLowerCase()
  // For dynamic fee pools, use the lpFee from slot0 (or default to 3000 bps)
  const rawFee = poolKey.fee
  const fee = rawFee === DYNAMIC_FEE_FLAG ? 3000n : BigInt(rawFee)
  const L = pool.liquidity
  const sqrtPrice = pool.sqrtPriceX96

  // Deduct LP fee: amountInAfterFee = amountIn * (1_000_000 - fee) / 1_000_000
  const amountInAfterFee = (amountIn * (1_000_000n - fee)) / 1_000_000n

  let amountOut: bigint
  let sqrtPriceNext: bigint

  if (zeroForOne) {
    // token0 → token1
    // sqrtPriceNext = L * sqrtPrice / (L + amountInAfterFee * sqrtPrice / Q96)
    const denominator = L + (amountInAfterFee * sqrtPrice) / Q96
    sqrtPriceNext = (L * sqrtPrice) / denominator
    // amountOut = L * (sqrtPrice - sqrtPriceNext) / Q96
    amountOut = (L * (sqrtPrice - sqrtPriceNext)) / Q96
  } else {
    // token1 → token0
    // sqrtPriceNext = sqrtPrice + amountInAfterFee * Q96 / L
    sqrtPriceNext = sqrtPrice + (amountInAfterFee * Q96) / L
    // amountOut = L * (sqrtPriceNext - sqrtPrice) / (sqrtPriceNext * sqrtPrice / Q96)
    // Simplified: amountOut = L * Q96 * (sqrtPriceNext - sqrtPrice) / (sqrtPriceNext * sqrtPrice)
    const delta = sqrtPriceNext - sqrtPrice
    amountOut = (L * Q96 * delta) / (sqrtPriceNext * sqrtPrice)
  }

  if (amountOut < 0n) amountOut = 0n

  const decimalsIn = TOKEN_DECIMALS[tokenIn.toLowerCase()] ?? 18
  const decimalsOut = TOKEN_DECIMALS[tokenOut.toLowerCase()] ?? 18

  return {
    amountIn: formatUnits(amountIn, decimalsIn),
    amountInWei: amountIn.toString(),
    amountOut: formatUnits(amountOut, decimalsOut),
    amountOutWei: amountOut.toString(),
    source: 'offchain',
    timestamp: Date.now(),
    poolKey: {
      currency0: poolKey.currency0,
      currency1: poolKey.currency1,
      fee: poolKey.fee,
      tickSpacing: poolKey.tickSpacing,
      hooks: poolKey.hooks,
    },
    sqrtPriceX96: pool.sqrtPriceX96.toString(),
    tick: pool.tick,
  }
}
