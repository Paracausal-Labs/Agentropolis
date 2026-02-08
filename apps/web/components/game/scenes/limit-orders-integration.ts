import { LimitOrderBuilding } from '../LimitOrderBuilding'
import type { LimitOrder } from '../../PlaceOrderModal'
import { getLimitOrders } from '../../../lib/uniswap/limit-orders'

const LIMIT_ORDER_POSITIONS = [
  { x: 1, y: 2 },
  { x: 10, y: 2 },
  { x: 1, y: 9 },
  { x: 10, y: 9 },
]

export function setupLimitOrdersIntegration(scene: Phaser.Scene & {
  tileContainer: Phaser.GameObjects.Container | null
  limitOrderBuildings: Map<string, LimitOrderBuilding>
  gridToIso: (gridX: number, gridY: number) => { x: number; y: number }
}) {
  // Load existing orders
  const orders = getLimitOrders()
  orders.forEach((order: LimitOrder, index: number) => {
    if (index >= 4) return // Max 4 order buildings
    const pos = LIMIT_ORDER_POSITIONS[index]
    const screenPos = scene.gridToIso(pos.x, pos.y)

    const building = new LimitOrderBuilding(scene, screenPos.x, screenPos.y, order)
    scene.tileContainer!.add(building)
    scene.limitOrderBuildings.set(order.id, building)
  })

  // Listen for new orders
  if (typeof window !== 'undefined') {
    window.addEventListener('limitOrdersUpdated', ((event: CustomEvent) => {
      const orders = event.detail as LimitOrder[]

      // Remove buildings for orders that no longer exist
      scene.limitOrderBuildings.forEach((building, orderId) => {
        if (!orders.find((o) => o.id === orderId)) {
          building.destroy()
          scene.limitOrderBuildings.delete(orderId)
        }
      })

      // Add/update buildings
      orders.forEach((order, index) => {
        if (index >= 4) return

        const existing = scene.limitOrderBuildings.get(order.id)
        if (existing) {
          existing.updateOrder(order)
        } else {
          const pos = LIMIT_ORDER_POSITIONS[index]
          const screenPos = scene.gridToIso(pos.x, pos.y)

          const building = new LimitOrderBuilding(scene, screenPos.x, screenPos.y, order)
          scene.tileContainer!.add(building)
          scene.limitOrderBuildings.set(order.id, building)
        }
      })
    }) as EventListener)
  }
}
