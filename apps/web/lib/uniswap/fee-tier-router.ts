import type { SwapQuote } from '@agentropolis/shared/src/types'
import { COMMON_POOLS, getPoolInfo, type PoolKey } from './pools'
import { getSwapQuote } from './quoter'

export interface FeeTierResult {
  poolKey: PoolKey
  quote: SwapQuote
}

/**
 * Iterate COMMON_POOLS, skip uninitialized/zero-liquidity pools,
 * quote each, and return the one with the highest amountOutWei.
 */
export async function getBestFeeTier(
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<FeeTierResult> {
  const candidates: FeeTierResult[] = []

  for (const poolKey of COMMON_POOLS) {
    // Check this pool contains the right pair
    const addresses = [poolKey.currency0.toLowerCase(), poolKey.currency1.toLowerCase()]
    if (!addresses.includes(tokenIn.toLowerCase()) || !addresses.includes(tokenOut.toLowerCase())) {
      continue
    }

    try {
      const info = await getPoolInfo(poolKey)
      if (!info.isInitialized || info.liquidity === 0n) {
        console.log(`[fee-tier-router] Skipping ${poolKey.fee}bps pool: not initialized or zero liquidity`)
        continue
      }

      const quote = await getSwapQuote(tokenIn, tokenOut, amountIn, poolKey)
      candidates.push({ poolKey, quote })
      console.log(`[fee-tier-router] ${poolKey.fee}bps → amountOut: ${quote.amountOut}`)
    } catch (err) {
      console.warn(`[fee-tier-router] Failed to quote ${poolKey.fee}bps pool:`, err)
    }
  }

  if (candidates.length === 0) {
    throw new Error('No initialized pools found for this token pair')
  }

  // Pick the candidate with the highest amountOutWei
  candidates.sort((a, b) => {
    const aOut = BigInt(a.quote.amountOutWei)
    const bOut = BigInt(b.quote.amountOutWei)
    if (bOut > aOut) return 1
    if (bOut < aOut) return -1
    return 0
  })

  const best = candidates[0]
  console.log(`[fee-tier-router] Selected ${best.poolKey.fee}bps pool (best output: ${best.quote.amountOut})`)
  return best
}
