import { USE_MOCK, mockResponse, apiGet } from './apiClient.js'
import { createDashboardAnalytics, createRecentActivity } from '../data/adminDashboard.js'
import { mockPolls } from '../data/communityPolls.js'
import { products } from '../data/products.js'
import { getEvents } from './eventService.js'

/** @typedef {import('../data/adminDashboard.js').DashboardAnalytics} DashboardAnalytics */
/** @typedef {import('../data/adminDashboard.js').ActivityItem} ActivityItem */

// Where the admin Community page saves polls and the public page reads them.
const POLLS_STORAGE_KEY = 'instea-polls'

// Same fallback as the Community page: saved polls, otherwise the sample polls.
function readPolls() {
  try {
    const saved = JSON.parse(localStorage.getItem(POLLS_STORAGE_KEY) || 'null')
    return Array.isArray(saved) ? saved : mockPolls
  } catch {
    return mockPolls
  }
}

/**
 * Revenue, popular products, and business metrics for a date range.
 *
 * @param {'today' | '7d' | '30d' | 'quarter'} range
 * @returns {Promise<DashboardAnalytics>}
 */
export async function getDashboardAnalytics(range) {
  if (USE_MOCK) return mockResponse(createDashboardAnalytics(range))
  return apiGet(`/admin/dashboard/analytics?range=${encodeURIComponent(range)}`)
}

/**
 * The latest staff and system actions, newest first.
 *
 * @returns {Promise<ActivityItem[]>}
 */
export async function getRecentActivity() {
  if (USE_MOCK) return mockResponse(createRecentActivity())
  return apiGet('/admin/dashboard/activity')
}

/**
 * Polls, events, and product names for the community widgets. The page decides
 * which polls are open and which events are upcoming. In mock mode the events
 * come from the event service, so events an admin creates, edits, or cancels on
 * the Community page show up here too.
 *
 * @returns {Promise<{ polls: Object[], events: Object[], products: { id: string, name: string }[] }>}
 */
export async function getCommunityOverview() {
  if (USE_MOCK) {
    // getEvents already simulates the network delay, so the rest is copied without adding a second one.
    return structuredClone({
      events: await getEvents(),
      polls: readPolls(),
      products: products.map(({ id, name }) => ({ id, name })),
    })
  }
  return apiGet('/admin/dashboard/community')
}
