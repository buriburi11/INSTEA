import { USE_MOCK, mockResponse, apiGet } from './apiClient.js'
import { orders } from '../data/orders.js'

/** @typedef {import('../types/models').Order} Order */

/**
 * @returns {Promise<Order[]>}
 */
export async function getOrders() {
  if (USE_MOCK) return mockResponse(orders)
  return apiGet('/orders')
}

/**
 * @param {string} id
 * @returns {Promise<Order | null>} null if no order has this id
 */
export async function getOrderById(id) {
  if (USE_MOCK) return mockResponse(orders.find((o) => o.id === id) ?? null)
  return apiGet(`/orders/${encodeURIComponent(id)}`)
}

/**
 * A customer's orders, newest first.
 *
 * @param {string} customerId
 * @returns {Promise<Order[]>} empty if the customer has no orders
 */
export async function getOrdersByCustomer(customerId) {
  if (USE_MOCK) {
    const customerOrders = orders
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return mockResponse(customerOrders)
  }
  return apiGet(`/customers/${encodeURIComponent(customerId)}/orders`)
}
