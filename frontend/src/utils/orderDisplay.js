// Display helpers shared by the order history list (INST-68) and order detail page (INST-69).
import { calculateTeaLeaves } from '../data/rewards.js'

export const ORDER_STATUS_LABELS = {
  new: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const ORDER_CHANNEL_LABELS = { online: 'Online', 'in-store': 'In-store' }

// Times are shown in the store's time zone so every customer sees the same time.
const STORE_TIME_ZONE = 'America/Los_Angeles'

// "ord-1006" -> "1006"
export function orderNumber(orderId) {
  return orderId.replace(/^ord-/, '')
}

// "2026-10-12T20:45:00Z" -> "Oct 12, 2026 · 1:45 PM"
export function formatOrderDate(isoDate) {
  const date = new Date(isoDate)
  const day = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: STORE_TIME_ZONE,
  })
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: STORE_TIME_ZONE,
  })
  return `${day} · ${time}`
}

// Leaves for an order: none if cancelled/refunded, pending until the order is completed.
export function orderLeaves(order) {
  if (order.status === 'cancelled' || order.status === 'refunded') {
    return { amount: 0, state: 'none' }
  }
  return {
    amount: calculateTeaLeaves(order.subtotal),
    state: order.status === 'completed' ? 'earned' : 'pending',
  }
}
