'use client'

import { useEffect, useState } from 'react'
import type { TradeProposal } from '@agentropolis/shared'
import { useSwapExecutor } from '@/lib/uniswap/executor'

interface SwapResult {
  status: 'idle' | 'pending' | 'success' | 'error'
  txHash?: string
  error?: string
}

export function SwapHandler() {
  const { executeSwap } = useSwapExecutor()
  const [result, setResult] = useState<SwapResult>({ status: 'idle' })

  useEffect(() => {
    const handleProposalApproved = async (proposal: TradeProposal) => {
      console.log('[SwapHandler] Proposal approved, executing swap:', proposal.id)
      
      setResult({ status: 'pending' })
      
      try {
        const { txHash } = await executeSwap(proposal)
        setResult({ status: 'success', txHash })
        console.log('[SwapHandler] Swap successful:', txHash)
      } catch (err) {
        console.error('[SwapHandler] Swap error:', err)
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
  }, [executeSwap])

  if (result.status === 'idle') return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800 rounded-lg p-4 shadow-xl">
      {result.status === 'pending' && (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-yellow-500">Executing swap...</span>
        </div>
      )}
      {result.status === 'success' && (
        <div className="text-green-500">
          <div className="font-bold">Swap Successful!</div>
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
          <div className="font-bold">Swap Failed</div>
          <div className="text-sm">{result.error}</div>
        </div>
      )}
    </div>
  )
}
