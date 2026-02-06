import { useCallback } from 'react'
import { useWalletClient } from 'wagmi'
import type { TradeProposal, StrategyType, ExecutionPlan, SwapReceipt } from '@agentropolis/shared'
import { executeSwap, useSwapExecutor } from './executor'
import type { WalletClient } from 'viem'

export interface ExecutionResult {
  success: boolean
  txHash?: string
  positionId?: string
  error?: string
  warning?: string
  strategyType: StrategyType
  executionPlan?: ExecutionPlan
  receipt?: SwapReceipt
}

const isLPStrategy = (strategyType?: StrategyType): boolean => {
  return strategyType === 'lp_full_range' || strategyType === 'lp_concentrated'
}

export const executeProposal = async (
  proposal: TradeProposal,
  walletClient?: WalletClient
): Promise<ExecutionResult> => {
  const strategyType = proposal.strategyType || 'swap'

  try {
    if (isLPStrategy(proposal.strategyType)) {
      throw new Error('LP positions disabled on testnet — use swap or DCA')
    }

    const isDCA = strategyType === 'dca'
    if (isDCA) {
      console.warn('[strategy-router] DCA not fully implemented - executing as single swap')
    }
    console.info('[strategy-router] Executing swap strategy:', strategyType)
    const result = await executeSwap(proposal, walletClient)
    return {
      success: true,
      txHash: result.txHash,
      strategyType,
      executionPlan: result.executionPlan,
      receipt: result.receipt,
      ...(isDCA && { warning: 'DCA executed as single swap (scheduling not yet implemented)' }),
    }
  } catch (err) {
    console.error('[strategy-router] Execution failed:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      strategyType,
    }
  }
}

export const useStrategyExecutor = () => {
  const { data: walletClient } = useWalletClient()
  const { executeSwap: swapExecute } = useSwapExecutor()

  const execute = useCallback(
    async (proposal: TradeProposal): Promise<ExecutionResult> => {
      const strategyType = proposal.strategyType || 'swap'

      try {
        if (isLPStrategy(proposal.strategyType)) {
          throw new Error('LP positions disabled on testnet — use swap or DCA')
        }

        const isDCA = strategyType === 'dca'
        if (isDCA) {
          console.warn('[strategy-router] DCA not fully implemented - executing as single swap')
        }
        const result = await swapExecute(proposal)
        return {
          success: true,
          txHash: result.txHash,
          strategyType,
          executionPlan: result.executionPlan,
          receipt: result.receipt,
          ...(isDCA && { warning: 'DCA executed as single swap (scheduling not yet implemented)' }),
        }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          strategyType,
        }
      }
    },
    [swapExecute]
  )

  return { execute, walletClient, isLPStrategy }
}

export const getStrategyDescription = (strategyType?: StrategyType): string => {
  switch (strategyType) {
    case 'swap':
      return 'Simple token swap'
    case 'dca':
      return 'Dollar-cost averaging (multiple swaps over time)'
    case 'lp_full_range':
      return 'Full-range liquidity (disabled on testnet)'
    case 'lp_concentrated':
      return 'Concentrated liquidity (disabled on testnet)'
    default:
      return 'Unknown strategy'
  }
}

export const getStrategyRiskLevel = (strategyType?: StrategyType): 'low' | 'medium' | 'high' => {
  switch (strategyType) {
    case 'swap':
      return 'low'
    case 'dca':
      return 'low'
    case 'lp_full_range':
      return 'medium'
    case 'lp_concentrated':
      return 'high'
    default:
      return 'medium'
  }
}
