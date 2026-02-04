import { useCallback } from 'react'
import { useWalletClient } from 'wagmi'
import type { TradeProposal, StrategyType } from '@agentropolis/shared'
import { executeSwap, useSwapExecutor } from './executor'
import { addLiquidity, useLPExecutor } from './lp-executor'
import type { WalletClient } from 'viem'

export interface ExecutionResult {
  success: boolean
  txHash?: string
  positionId?: string
  error?: string
  strategyType: StrategyType
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
      console.info('[strategy-router] Executing LP strategy:', strategyType)
      const result = await addLiquidity(proposal, walletClient)
      return {
        success: true,
        txHash: result.txHash,
        positionId: result.positionId,
        strategyType,
      }
    }

    console.info('[strategy-router] Executing swap strategy:', strategyType)
    const result = await executeSwap(proposal, walletClient)
    return {
      success: true,
      txHash: result.txHash,
      strategyType,
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
  const { addLiquidity: lpExecute } = useLPExecutor()

  const execute = useCallback(
    async (proposal: TradeProposal): Promise<ExecutionResult> => {
      const strategyType = proposal.strategyType || 'swap'

      try {
        if (isLPStrategy(proposal.strategyType)) {
          const result = await lpExecute(proposal)
          return {
            success: true,
            txHash: result.txHash,
            positionId: result.positionId,
            strategyType,
          }
        }

        const result = await swapExecute(proposal)
        return {
          success: true,
          txHash: result.txHash,
          strategyType,
        }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          strategyType,
        }
      }
    },
    [swapExecute, lpExecute]
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
      return 'Full-range liquidity (lower fees, lower IL risk)'
    case 'lp_concentrated':
      return 'Concentrated liquidity (higher fees, higher IL risk)'
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
