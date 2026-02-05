'use client'

import { useEffect, useState } from 'react'
import type { TradeProposal } from '@agentropolis/shared'
import { useStrategyExecutor } from '@/lib/uniswap/strategy-router'

interface SwapResult {
  status: 'idle' | 'pending' | 'success' | 'error'
  txHash?: string
  positionId?: string
  error?: string
  strategyType?: string
}

export function SwapHandler() {
  const { execute } = useStrategyExecutor()
  const [result, setResult] = useState<SwapResult>({ status: 'idle' })

  useEffect(() => {
    const handleProposalApproved = async (proposal: TradeProposal) => {
      console.log('[SwapHandler] Proposal approved, routing strategy:', proposal.strategyType || 'swap')
      
      setResult({ status: 'pending' })
      
      try {
        const executionResult = await execute(proposal)
        if (executionResult.success) {
          setResult({ 
            status: 'success', 
            txHash: executionResult.txHash,
            positionId: executionResult.positionId,
            strategyType: executionResult.strategyType,
          })
          console.log('[SwapHandler] Strategy execution successful:', executionResult)
        } else {
          throw new Error(executionResult.error || 'Execution failed')
        }
      } catch (err) {
        console.error('[SwapHandler] Execution error:', err)
        setResult({ status: 'error', error: String(err) })
      }
      
      setTimeout(() => setResult({ status: 'idle' }), 5000)
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

  const isLP = result.strategyType === 'lp_full_range' || result.strategyType === 'lp_concentrated'
  const actionLabel = isLP ? 'LP Position' : 'Swap'

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800 rounded-lg p-4 shadow-xl">
      {result.status === 'pending' && (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-yellow-500">Executing {actionLabel.toLowerCase()}...</span>
        </div>
      )}
      {result.status === 'success' && (
        <div className="text-green-500">
          <div className="font-bold">{actionLabel} Successful!</div>
          {result.positionId && (
            <div className="text-sm">Position ID: {result.positionId}</div>
          )}
          {result.txHash && (
            <a
              href={`https://sepolia.basescan.org/tx/${result.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline hover:text-green-400"
            >
              View on BaseScan →
            </a>
          )}
        </div>
      )}
      {result.status === 'error' && (
        <div className="text-red-500">
          <div className="font-bold">{actionLabel} Failed</div>
          <div className="text-sm">{result.error}</div>
        </div>
      )}
    </div>
  )
}
