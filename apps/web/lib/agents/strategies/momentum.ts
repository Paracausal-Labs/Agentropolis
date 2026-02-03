import type { TradeProposal } from '@agentropolis/shared'
import { TOKENS } from '../../uniswap/constants'
import type { AgentStrategy, StrategyProposalRequest } from './base'

/**
 * Momentum Strategy
 * Trend-following approach: buy what's going up, ride the trend
 * Higher confidence, larger amounts, high risk profile
 */
export class MomentumStrategy implements AgentStrategy {
  id = 'momentum'
  name = 'Momentum Trading'

  async generateProposal(request: StrategyProposalRequest): Promise<TradeProposal> {
    const { agentId, agentProfile, context } = request
    const { balance = '1000', preferredTokens = ['USDC', 'WETH'], riskLevel: _riskLevel = 'high' } = context

    // Parse balance as number for calculations
    const balanceNum = parseFloat(balance) || 1000

    // Momentum: Use 30-50% of balance for aggressive trend-following
    const amountPercentage = 0.40 // 40% per trade
    const amountIn = (balanceNum * amountPercentage).toFixed(2)

    // Determine token pair - momentum typically buys the trending asset
    const tokenIn = preferredTokens?.[0] === 'WETH' ? 'WETH' : 'USDC'
    const tokenOut = tokenIn === 'USDC' ? 'WETH' : 'USDC'

    // Optimistic expected output (momentum assumes uptrend)
    let expectedAmountOut: string
    if (tokenIn === 'USDC') {
      // Assume uptrend: 1 USDC = 0.00032 ETH (optimistic)
      expectedAmountOut = (parseFloat(amountIn) * 0.00032).toFixed(6)
    } else {
      // Assume uptrend: 1 WETH = 3400 USDC (optimistic)
      expectedAmountOut = (parseFloat(amountIn) * 3400).toFixed(2)
    }

    const proposal: TradeProposal = {
      id: `momentum-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      agentId,
      agentName: agentProfile?.name || 'Momentum Agent',
      pair: {
        tokenIn: {
          symbol: tokenIn,
          address: tokenIn === 'USDC' ? TOKENS.USDC : TOKENS.WETH,
        },
        tokenOut: {
          symbol: tokenOut,
          address: tokenOut === 'USDC' ? TOKENS.USDC : TOKENS.WETH,
        },
      },
      action: 'swap',
      amountIn,
      expectedAmountOut,
      maxSlippage: 75, // Higher tolerance: 0.75% slippage (momentum trades faster)
      deadline: Date.now() + 900000, // 15 minutes (shorter window for momentum)
      reasoning: `Trend-following momentum strategy. Momentum indicators suggest ${tokenOut} is trending upward. Executing ${amountIn} ${tokenIn} swap to capture the move.`,
      confidence: 82, // Higher confidence for momentum (trend-based)
      riskLevel: 'high',
    }

    return proposal
  }
}
