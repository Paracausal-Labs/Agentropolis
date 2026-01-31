export interface TradeProposal {
  id: string
  agentId: string
  agentName: string
  pair: {
    tokenIn: { symbol: string; address: string }
    tokenOut: { symbol: string; address: string }
  }
  action: 'swap' | 'rebalance' | 'dca'
  amountIn: string
  expectedAmountOut: string
  maxSlippage: number
  deadline: number
  reasoning: string
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface AgentProfile {
  agentId: number
  name: string
  description: string
  image: string
  strategy: 'momentum' | 'dca' | 'arbitrage' | 'yield'
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  services: { name: string; endpoint: string; version: string }[]
}

export interface YellowSession {
  sessionId: string
  userAddress: string
  balance: string
  isActive: boolean
  createdAt: number
  expiresAt: number
}
