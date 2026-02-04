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
export type StrategyType = 'swap' | 'dca' | 'lp_full_range' | 'lp_concentrated' | 'token_launch'

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

export interface TokenLaunchProposal {
  id: string
  agentId: string
  agentName: string
  action: 'token_launch'
  strategyType: 'token_launch'
  tokenName: string
  tokenSymbol: string
  tokenDescription: string
  tokenImage?: string
  pairedToken: string
  rewardRecipient: string
  rewardBps: number
  vaultPercentage?: number
  lockupDays?: number
  reasoning: string
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  deliberation?: DeliberationResult
}

export interface TokenLaunchResult {
  success: boolean
  txHash?: string
  tokenAddress?: string
  clankerUrl?: string
  error?: string
}

export interface AgentProfile {
  agentId: number
  name: string
  description: string
  image: string
  strategy: 'momentum' | 'dca' | 'arbitrage' | 'yield'
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  services: { name: string; endpoint: string; version: string }[]
  // ERC-8004 additions
  reputation?: number // 0-100 scale from reputation registry
  registrySource?: 'erc8004' | 'mock' // Track if from real registry or mock
  serviceEndpoint?: string // External agent endpoint URL
}

// External Agent Protocol (BYOA)
export interface ExternalAgentRequest {
  prompt: string
  context: {
    balance?: string
    riskLevel?: 'low' | 'medium' | 'high'
    preferredTokens?: string[]
  }
  requestId: string
}

export interface ExternalAgentResponse {
  success: boolean
  proposal?: TradeProposal | TokenLaunchProposal
  error?: string
  processingTime?: number
  paymentTxHash?: string // x402 payment transaction if applicable
}

export interface YellowSession {
  sessionId: string
  userAddress: string
  balance: string
  isActive: boolean
  createdAt: number
  expiresAt: number
}
