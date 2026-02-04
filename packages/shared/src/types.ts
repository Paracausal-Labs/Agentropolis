// Council Agent Roles
export type AgentRole = 'alpha' | 'risk' | 'macro' | 'devil' | 'clerk'

// Council Message from deliberation
export interface CouncilMessage {
  agentId: string
  agentName: string
  agentRole: AgentRole
  opinion: 'SUPPORT' | 'CONCERN' | 'OPPOSE' | 'NEUTRAL'
  reasoning: string
  confidence: number // 0-100
  timestamp: number
}

// Result of council deliberation
export interface DeliberationResult {
  messages: CouncilMessage[]
  consensus: 'unanimous' | 'majority' | 'contested' | 'vetoed'
  voteTally: { support: number; oppose: number; abstain: number }
  rounds: number
}

// Strategy types for proposals
export type StrategyType = 'swap' | 'dca' | 'lp_full_range' | 'lp_concentrated'

export interface TradeProposal {
  id: string
  agentId: string
  agentName: string
  pair: {
    tokenIn: { symbol: string; address: string }
    tokenOut: { symbol: string; address: string }
  }
  action: 'swap' | 'rebalance' | 'dca'
  strategyType?: StrategyType
  amountIn: string
  expectedAmountOut: string
  maxSlippage: number
  deadline: number
  reasoning: string
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  // LP-specific fields
  tickLower?: number
  tickUpper?: number
  // Multi-agent deliberation
  deliberation?: DeliberationResult
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
