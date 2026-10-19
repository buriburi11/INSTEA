import { USE_MOCK, mockResponse, apiGet } from './apiClient.js'
import { customers } from '../data/customers.js'

/** @typedef {import('../types/models').Customer} Customer */

/**
 * @returns {Promise<Customer[]>}
 */
export async function getCustomers() {
  if (USE_MOCK) return mockResponse(customers)
  return apiGet('/customers')
}

/**
 * @param {string} id
 * @returns {Promise<Customer | null>} null if no customer has this id
 */
export async function getCustomerById(id) {
  if (USE_MOCK) return mockResponse(customers.find((c) => c.id === id) ?? null)
  return apiGet(`/customers/${encodeURIComponent(id)}`)
}
