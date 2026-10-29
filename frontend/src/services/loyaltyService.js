import { USE_MOCK, mockResponse, apiGet } from './apiClient.js'
import { leavesTransactions } from '../data/leavesTransactions.js'

/** @typedef {import('../types/models').LeavesTransaction} LeavesTransaction */

/**
 * @param {string} customerId
 * @returns {Promise<LeavesTransaction[]>} newest first
 */
export async function getLeavesTransactions(customerId) {
  if (USE_MOCK) {
    return mockResponse(leavesTransactions.filter((t) => t.customerId === customerId))
  }
  return (await apiGet(`/customers/${encodeURIComponent(customerId)}/leaves-transactions`)) ?? []
}
