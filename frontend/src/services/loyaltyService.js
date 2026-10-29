import { USE_MOCK, mockResponse, apiGet } from './apiClient.js'
import { leavesTransactions } from '../data/leavesTransactions.js'

/** @typedef {import('../types/models').LeavesTransaction} LeavesTransaction */

// Loyalty data for the Rewards page. While USE_MOCK is true these return the mock data in
// src/data/. Backend team: the API paths below are placeholders, so tell us the real ones.
// A missing customer (404) is treated as "no history" rather than an error.

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
