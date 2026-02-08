'use client'

import { useState, useEffect } from 'react'
import { PlaceOrderModal, type LimitOrder } from './PlaceOrderModal'
import { placeLimitOrder, claimLimitOrder } from '../lib/uniswap/limit-orders'
import { toast } from 'sonner'

export function LimitOrderManager() {
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false)

  useEffect(() => {
    // Listen for game events
    if (typeof window === 'undefined') return

    const handleClaim = async (event: Event) => {
      const customEvent = event as CustomEvent
      const orderId = customEvent.detail || (event as any).detail

      console.log('[LimitOrderManager] Claiming order:', orderId)

      const result = await claimLimitOrder(orderId)

      if (result.success) {
        toast.success('Order claimed successfully!', {
          description: `TxID: ${result.txHash?.slice(0, 10)}...`,
        })
      } else {
        toast.error('Failed to claim order', {
          description: result.error,
        })
      }
    }

    const handleShowDetails = (event: Event) => {
      const customEvent = event as CustomEvent
      const order = customEvent.detail as LimitOrder

      toast.info(`Order ${order.direction === 'buy' ? 'Buy' : 'Sell'} @ $${order.targetPrice}`, {
        description: `Status: ${order.status}`,
      })
    }

    window.addEventListener('claimLimitOrder' as any, handleClaim)
    window.addEventListener('showLimitOrderDetails' as any, handleShowDetails)

    return () => {
      window.removeEventListener('claimLimitOrder' as any, handleClaim)
      window.removeEventListener('showLimitOrderDetails' as any, handleShowDetails)
    }
  }, [])

  const handlePlaceOrder = async (order: LimitOrder) => {
    console.log('[LimitOrderManager] Placing order:', order)

    const result = await placeLimitOrder(order)

    if (result.success) {
      toast.success('Trade Tower constructed!', {
        description: 'Your limit order is now active in the city.',
      })
    } else {
      toast.error('Failed to place order', {
        description: result.error || 'Unknown error',
      })
    }
  }

  return (
    <>
      {/* Button to open modal - can be placed in header or elsewhere */}
      <button
        onClick={() => setIsPlaceModalOpen(true)}
        className="fixed bottom-14 right-6 z-40 px-5 py-2.5 bg-[#FCEE0A]/10 border border-[#FCEE0A]/40 hover:bg-[#FCEE0A]/20 hover:border-[#FCEE0A] text-[#FCEE0A] font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 font-mono"
      >
        PLACE LIMIT ORDER
      </button>

      <PlaceOrderModal
        isOpen={isPlaceModalOpen}
        onClose={() => setIsPlaceModalOpen(false)}
        onPlaceOrder={handlePlaceOrder}
      />
    </>
  )
}
