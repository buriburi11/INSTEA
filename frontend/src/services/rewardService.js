import { USE_MOCK, mockResponse, apiGet } from './apiClient.js'
import { rewardsCatalog } from '../data/rewardsCatalog.js'

/** @typedef {import('../data/rewardsCatalog.js').Reward} Reward */

// Rewards catalog for the admin Loyalty page (INST-81). While USE_MOCK is true this returns
// the mock data in src/data/rewardsCatalog.js. Backend team: the API path is a placeholder.

/**
 * @returns {Promise<Reward[]>} active and deactivated rewards
 */
export async function getRewards() {
  if (USE_MOCK) return mockResponse(rewardsCatalog)
  return (await apiGet('/rewards')) ?? []
}
