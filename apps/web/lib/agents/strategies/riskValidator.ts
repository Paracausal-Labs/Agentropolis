import type { TradeProposal } from '@agentropolis/shared'
import type { AgentStrategy, StrategyProposalRequest } from './base'

/**
 * Risk assessment result from the validator
 */
export interface RiskAssessment {
  proposalId: string
  riskScore: number // 0-100, higher = riskier
  severity: 'low' | 'medium' | 'high'
  concerns: string[]
  recommendations: string[]
  approved: boolean // Advisory only - doesn't block
}

/**
 * Risk Validator Agent Strategy
 * Reviews OTHER agents' proposals for risks
 * Does NOT generate trades, only validates them
 * Advisory role - recommendations don't block execution
 */
export class RiskValidatorStrategy implements AgentStrategy {
  id = 'risk-validator'
  name = 'Risk Validator'

  async generateProposal(_request: StrategyProposalRequest): Promise<TradeProposal> {
    // Risk validator doesn't generate proposals
    // This method is required by AgentStrategy interface but not used
    throw new Error('Risk Validator does not generate proposals. Use validateProposal() instead.')
  }

  /**
   * Validate another agent's proposal for risks
   * Returns advisory assessment without blocking execution
   */
  async validateProposal(proposal: TradeProposal): Promise<RiskAssessment> {
    const concerns: string[] = []
    const recommendations: string[] = []
    let riskScore = 0

    // Check 1: Slippage tolerance
    if (proposal.maxSlippage > 100) {
      concerns.push(`High slippage tolerance: ${proposal.maxSlippage}bps (>1%)`)
      riskScore += 20
      recommendations.push('Consider reducing max slippage to <50bps for better execution')
    } else if (proposal.maxSlippage > 50) {
      concerns.push(`Moderate slippage tolerance: ${proposal.maxSlippage}bps`)
      riskScore += 10
    }

    // Check 2: Amount size relative to confidence
    const amountNum = parseFloat(proposal.amountIn)
    if (proposal.confidence < 50 && amountNum > 100) {
      concerns.push(`Large amount (${proposal.amountIn}) with low confidence (${proposal.confidence}%)`)
      riskScore += 25
      recommendations.push('Reduce position size or wait for higher confidence signal')
    }

    // Check 3: Risk level vs action type
    if (proposal.riskLevel === 'high' && proposal.action === 'swap') {
      concerns.push('High-risk swap action - aggressive positioning')
      riskScore += 15
      recommendations.push('Consider DCA strategy to reduce volatility impact')
    }

    // Check 4: Deadline urgency
    const timeToDeadline = proposal.deadline - Date.now()
    const hoursToDeadline = timeToDeadline / (1000 * 60 * 60)
    if (hoursToDeadline < 0.5) {
      concerns.push(`Very tight deadline: ${hoursToDeadline.toFixed(2)} hours`)
      riskScore += 20
      recommendations.push('Extend deadline to allow for better execution')
    } else if (hoursToDeadline < 1) {
      concerns.push(`Short deadline: ${hoursToDeadline.toFixed(2)} hours`)
      riskScore += 10
    }

    // Check 5: Expected output sanity
    const expectedOut = parseFloat(proposal.expectedAmountOut)
    if (expectedOut <= 0) {
      concerns.push('Invalid expected output amount')
      riskScore += 30
      recommendations.push('Verify price calculation and expected output')
    }

    // Check 6: Confidence level
    if (proposal.confidence < 40) {
      concerns.push(`Low confidence signal: ${proposal.confidence}%`)
      riskScore += 15
      recommendations.push('Wait for higher confidence before execution')
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100)

    // Determine severity
    let severity: 'low' | 'medium' | 'high'
    if (riskScore >= 70) {
      severity = 'high'
    } else if (riskScore >= 40) {
      severity = 'medium'
    } else {
      severity = 'low'
    }

    // Advisory approval: always true (doesn't block)
    // User can still execute even with high risk
    const approved = true

    return {
      proposalId: proposal.id,
      riskScore,
      severity,
      concerns,
      recommendations,
      approved,
    }
  }
}
