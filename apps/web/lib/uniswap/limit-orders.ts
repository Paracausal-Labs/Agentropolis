import type { LimitOrder } from '../components/PlaceOrderModal'

const LIMIT_ORDERS_KEY = 'agentropolis_limit_orders'

const toRandomHex = (): string =\u003e {
    if (typeof crypto !== 'undefined' \u0026\u0026 'getRandomValues' in crypto) {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return `0x${Array.from(bytes)
        .map((value) =\u003e value.toString(16).padStart(2, '0'))
        .join('')}`
}

const fallback = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
return `0x${fallback.toString(16).padStart(64, '0')}`
}

const mockEnabled =
    process.env.NEXT_PUBLIC_UNISWAP_MOCK === 'true' ||
    process.env.UNISWAP_MOCK === 'true'

/**
 * Get all limit orders from localStorage
 */
export const getLimitOrders = (): LimitOrder[] =\u003e {
    if (typeof window === 'undefined') return []
try {
    const stored = localStorage.getItem(LIMIT_ORDERS_KEY)
    return stored ? JSON.parse(stored) : []
} catch {
    return []
}
}

/**
 * Save limit orders to localStorage
 */
const saveLimitOrders = (orders: LimitOrder[]): void =\u003e {
    if (typeof window === 'undefined') return
localStorage.setItem(LIMIT_ORDERS_KEY, JSON.stringify(orders))
// Dispatch event for CityScene to listen
window.dispatchEvent(new CustomEvent('limitOrdersUpdated', { detail: orders }))
}

/**
 * Place a new limit order
 * In mock mode, this simulates the order placement
 */
export const placeLimitOrder = async (
    order: LimitOrder
): Promise<{ success: boolean; txHash?: string; error?: string }> =\u003e {
    console.info('[limitOrder] Placing order:', order)

if (mockEnabled || true) {
    // Mock: simulate transaction and store order
    const txHash = toRandomHex()
    const orderWithTx: LimitOrder = { ...order, txHash }

    const orders = getLimitOrders()
    orders.push(orderWithTx)
    saveLimitOrders(orders)

    console.info('[limitOrder][mock] Order placed:', txHash)
    return { success: true, txHash }
}

return { success: false, error: 'Real hook interaction not yet implemented' }
}

/**
 * Update order statuses based on current market price
 */
export const updateOrderStatuses = (currentPrice: number): void =\u003e {
    const orders = getLimitOrders()
  let updated = false

  orders.forEach((order) =\u003e {
    if (order.status === 'completed') return

    const targetPrice = parseFloat(order.targetPrice)
    const priceProximity = Math.abs((currentPrice - targetPrice) / targetPrice)

    // If within 5% of target, mark as active
    if (priceProximity \u003c = 0.05 \u0026\u0026 order.status === 'construction') {
        order.status = 'active'
        updated = true
        console.info('[limitOrder] Order now active:', order.id)
    }

    // If price crossed target, mark as completed (filled)
    const shouldFill =
        (order.direction === 'buy' \u0026\u0026 currentPrice \u003c = targetPrice) ||
            (order.direction === 'sell' \u0026\u0026 currentPrice \u003e = targetPrice)

    if (shouldFill \u0026\u0026 order.status !== 'completed') {
        order.status = 'completed'
        order.filledAt = Date.now()
        updated = true
        console.info('[limitOrder] Order filled:', order.id)
    }
})

if (updated) {
    saveLimitOrders(orders)
}
}

/**
 * Claim a completed limit order
 */
export const claimLimitOrder = async (
    orderId: string
): Promise<{ success: boolean; txHash?: string; error?: string }> =\u003e {
    const orders = getLimitOrders()
  const orderIndex = orders.findIndex((o) =\u003e o.id === orderId)

  if (orderIndex === -1) {
    return { success: false, error: 'Order not found' }
}

const order = orders[orderIndex]

if (order.status !== 'completed') {
    return { success: false, error: 'Order not yet filled' }
}

if (mockEnabled || true) {
    // Mock: simulate claim transaction
    const txHash = toRandomHex()

    // Remove order from storage (claimed)
    orders.splice(orderIndex, 1)
    saveLimitOrders(orders)

    console.info('[limitOrder][mock] Order claimed:', txHash)
    return { success: true, txHash }
}

return { success: false, error: 'Real hook interaction not yet implemented' }
}

/**
 * Cancel a limit order
 */
export const cancelLimitOrder = async (
    orderId: string
): Promise<{ success: boolean; error?: string }> =\u003e {
    const orders = getLimitOrders()
  const orderIndex = orders.findIndex((o) =\u003e o.id === orderId)

  if (orderIndex === -1) {
    return { success: false, error: 'Order not found' }
}

if (mockEnabled || true) {
    // Mock: remove order
    orders.splice(orderIndex, 1)
    saveLimitOrders(orders)
    console.info('[limitOrder][mock] Order cancelled:', orderId)
    return { success: true }
}

return { success: false, error: 'Real hook interaction not yet implemented' }
}
