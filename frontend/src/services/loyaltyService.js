import { USE_MOCK, mockResponse, apiGet } from './apiClient.js'
import { leavesTransactions } from '../data/leavesTransactions.js'
import { stampCards, stampHistory } from '../data/stampCards.js'

/** @typedef {import('../types/models').LeavesTransaction} LeavesTransaction */
/** @typedef {import('../types/models').StampCard} StampCard */
/** @typedef {import('../types/models').StampHistoryEntry} StampHistoryEntry */

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

/**
 * @param {string} customerId
 * @returns {Promise<StampCard[]>}
 */
export async function getStampCards(customerId) {
  if (USE_MOCK) {
    return mockResponse(stampCards.filter((c) => c.customerId === customerId))
  }
  return (await apiGet(`/customers/${encodeURIComponent(customerId)}/stamp-cards`)) ?? []
}

/**
 * @param {string} customerId
 * @returns {Promise<StampHistoryEntry[]>} newest first
 */
export async function getStampHistory(customerId) {
  if (USE_MOCK) {
    return mockResponse(stampHistory.filter((s) => s.customerId === customerId))
  }
  return (await apiGet(`/customers/${encodeURIComponent(customerId)}/stamp-history`)) ?? []
}
