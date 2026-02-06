'use client'

import { useEffect, useState } from 'react'
import type { TradeProposal, ExecutionPlan, SwapReceipt } from '@agentropolis/shared'
import { useStrategyExecutor } from '@/lib/uniswap/strategy-router'
import { formatUnits } from 'viem'

interface SwapResult {
  status: 'idle' | 'quoting' | 'pending' | 'success' | 'error'
  txHash?: string
  positionId?: string
  error?: string
  warning?: string
  strategyType?: string
  executionPlan?: ExecutionPlan
  receipt?: SwapReceipt
}

function formatFeeTier(fee: number): string {
  return `${(fee / 10_000).toFixed(2)}%`
}

export function SwapHandler() {
  const { execute } = useStrategyExecutor()
  const [result, setResult] = useState<SwapResult>({ status: 'idle' })

  useEffect(() => {
    const handleProposalApproved = async (proposal: TradeProposal) => {
      console.log('[SwapHandler] Proposal approved, routing strategy:', proposal.strategyType || 'swap')

      setResult({ status: 'quoting' })

      try {
        setResult({ status: 'pending' })
        const executionResult = await execute(proposal)
        if (executionResult.success) {
          setResult({
            status: 'success',
            txHash: executionResult.txHash,
            positionId: executionResult.positionId,
            warning: executionResult.warning,
            strategyType: executionResult.strategyType,
            executionPlan: executionResult.executionPlan,
            receipt: executionResult.receipt,
          })
          console.log('[SwapHandler] Strategy execution successful:', executionResult)
          if (executionResult.warning) {
            console.warn('[SwapHandler] Warning:', executionResult.warning)
          }
        } else {
          throw new Error(executionResult.error || 'Execution failed')
        }
      } catch (err) {
        console.error('[SwapHandler] Execution error:', err)
        setResult({ status: 'error', error: String(err) })
      }

      setTimeout(() => setResult({ status: 'idle' }), 10000)
    }

    if (typeof window === 'undefined') return

    let cleanup: (() => void) | null = null
    let attached = false

    const tryAttach = () => {
      if (attached) return true
      const game = (window as any).game as Phaser.Game | undefined
      if (!game) return false
      game.events.on('proposalApproved', handleProposalApproved)
      cleanup = () => {
        game.events.off('proposalApproved', handleProposalApproved)
      }
      attached = true
      return true
    }

    if (!tryAttach()) {
      const interval = setInterval(() => {
        if (tryAttach()) {
          clearInterval(interval)
        }
      }, 250)

      return () => {
        clearInterval(interval)
        cleanup?.()
      }
    }

    return () => {
      cleanup?.()
    }
  }, [execute])

  if (result.status === 'idle') return null

  const plan = result.executionPlan
  const receipt = result.receipt

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800 rounded-lg p-4 shadow-xl max-w-sm">
      {result.status === 'quoting' && (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-400">Getting quote...</span>
        </div>
      )}
      {result.status === 'pending' && (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <div>
            <span className="text-yellow-500">Executing swap...</span>
            {plan && (
              <div className="text-xs text-gray-400 mt-1">
                <div>Quote: {plan.quote.amountOut} out</div>
                <div>Min out: {plan.minAmountOut !== '0' ? formatUnits(BigInt(plan.minAmountOut), plan.tokenOutDecimals ?? 18) : '...'}</div>
                <div>Fee tier: {formatFeeTier(plan.quote.poolKey.fee)}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {result.status === 'success' && (
        <div className="text-green-500">
          <div className="font-bold">Swap Successful!</div>
          {result.warning && (
            <div className="text-yellow-500 text-sm mt-1">{result.warning}</div>
          )}
          {plan && (
            <div className="text-xs text-gray-400 mt-1 space-y-0.5">
              <div>Quote: {plan.quote.amountOut} | Fee tier: {formatFeeTier(plan.quote.poolKey.fee)}</div>
            </div>
          )}
          {receipt && (
            <div className="text-xs text-gray-400 mt-1 space-y-0.5">
              <div>Realized out: {receipt.realizedAmountOut !== '0' ? receipt.realizedAmountOut : 'N/A'}</div>
              <div>Slippage vs quote: {receipt.slippageVsQuoteBps > 0 ? '+' : ''}{receipt.slippageVsQuoteBps} bps</div>
              <div>Gas used: {receipt.gasUsed}</div>
            </div>
          )}
          {result.txHash && (
            <a
              href={`https://sepolia.basescan.org/tx/${result.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline hover:text-green-400 block mt-1"
            >
              View on BaseScan
            </a>
          )}
        </div>
      )}
      {result.status === 'error' && (
        <div className="text-red-500">
          <div className="font-bold">Swap Failed</div>
          <div className="text-sm">{result.error}</div>
        </div>
      )}
    </div>
  )
}
