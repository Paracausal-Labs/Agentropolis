import type { TradeProposal, AgentProfile } from '@agentropolis/shared'

/**
 * Context passed to strategy for generating proposals
 */
export interface StrategyContext {
  balance?: string
  preferredTokens?: string[]
  riskLevel?: 'low' | 'medium' | 'high'
}

/**
 * Request to generate a proposal from a strategy
 */
export interface StrategyProposalRequest {
  agentId: string
  agentProfile?: AgentProfile
  context: StrategyContext
}

/**
 * Base interface for all agent strategies
 * Strategies are responsible for generating trade proposals
 */
export interface AgentStrategy {
  /**
   * Unique identifier for this strategy
   */
  id: string

  /**
   * Human-readable name
   */
  name: string

  /**
   * Generate a trade proposal based on context
   */
  generateProposal(request: StrategyProposalRequest): Promise<TradeProposal>
}

/**
 * Registry of available strategies
 * Allows dynamic loading and discovery of strategies
 */
export interface StrategyRegistry {
  /**
   * Get a strategy by ID
   */
  get(id: string): AgentStrategy | undefined

  /**
   * Register a new strategy
   */
  register(strategy: AgentStrategy): void

  /**
   * Get all registered strategies
   */
  getAll(): AgentStrategy[]

  /**
   * Check if a strategy is registered
   */
  has(id: string): boolean
}

/**
 * Default strategy registry implementation
 */
export class DefaultStrategyRegistry implements StrategyRegistry {
  private strategies: Map<string, AgentStrategy> = new Map()

  get(id: string): AgentStrategy | undefined {
    return this.strategies.get(id)
  }

  register(strategy: AgentStrategy): void {
    this.strategies.set(strategy.id, strategy)
  }

  getAll(): AgentStrategy[] {
    return Array.from(this.strategies.values())
  }

  has(id: string): boolean {
    return this.strategies.has(id)
  }
}
