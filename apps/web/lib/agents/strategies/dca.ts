import type { TradeProposal } from '@agentropolis/shared'
import { TOKENS } from '../../uniswap/constants'
import type { AgentStrategy, StrategyProposalRequest } from './base'

/**
 * DCA (Dollar-Cost Averaging) Strategy
 * Splits investment into smaller periodic buys to minimize timing risk
 * Lower confidence, conservative amounts, low risk profile
 */
export class DCAStrategy implements AgentStrategy {
  id = 'dca'
  name = 'Dollar-Cost Averaging'

  async generateProposal(request: StrategyProposalRequest): Promise<TradeProposal> {
    const { agentId, agentProfile, context } = request
    const { balance = '1000', preferredTokens = ['USDC', 'WETH'], riskLevel = 'low' } = context

    // Parse balance as number for calculations
    const balanceNum = parseFloat(balance) || 1000

    // DCA: Use only 10-20% of balance per chunk to spread over time
    const chunkPercentage = 0.15 // 15% per chunk
    const amountIn = (balanceNum * chunkPercentage).toFixed(2)

    // Determine token pair based on preferred tokens
    const tokenIn = preferredTokens?.[0] === 'WETH' ? 'WETH' : 'USDC'
    const tokenOut = tokenIn === 'USDC' ? 'WETH' : 'USDC'

    // Conservative expected output (slightly pessimistic for DCA)
    let expectedAmountOut: string
    if (tokenIn === 'USDC') {
      // ~1 ETH = 3300 USDC, so 1 USDC = 0.0003 ETH (conservative)
      expectedAmountOut = (parseFloat(amountIn) * 0.00028).toFixed(6)
    } else {
      // 1 WETH = ~3300 USDC (conservative)
      expectedAmountOut = (parseFloat(amountIn) * 3200).toFixed(2)
    }

    const proposal: TradeProposal = {
      id: `dca-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      agentId,
      agentName: agentProfile?.name || 'DCA Agent',
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
      action: 'dca',
      amountIn,
      expectedAmountOut,
      maxSlippage: 30, // Conservative: 0.3% slippage
      deadline: Date.now() + 3600000, // 1 hour
      reasoning: `Steady accumulation strategy. Investing ${amountIn} ${tokenIn} as part of a dollar-cost averaging plan to minimize timing risk and reduce volatility impact.`,
      confidence: 68, // Lower confidence for DCA (steady, not aggressive)
      riskLevel: 'low',
    }

    return proposal
  }
}
