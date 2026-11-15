/**
 * Mock analytics for the admin dashboard overview, until the backend is ready.
 *
 * Only raw figures are stored. Totals and percentage changes are derived from
 * them, so they cannot disagree: total revenue is the sum of the revenue
 * buckets, and the change compares that total with `previousRevenue`.
 * Bucket labels are built from the date passed in, so nothing here is pinned
 * to a calendar day. Values are illustrative sample data.
 */

import { formatDateSpan, formatHour, formatMonthDay, formatWeekday } from '../utils/adminDashboard.js'
import { products } from './products.js'

/**
 * @typedef {Object} RevenueBucket
 * @property {string} label Short axis label, such as "Sun" or "8 AM".
 * @property {string} period Unambiguous description used in tables and exports.
 * @property {number} revenue Revenue in US dollars.
 *
 * @typedef {Object} DashboardAnalytics
 * @property {string} range One of the ids in `dashboardRanges`.
 * @property {string} [chartNote] Optional note shown under the chart title.
 * @property {RevenueBucket[]} buckets Revenue per chart bar, oldest first.
 * @property {number} previousRevenue Total revenue for the previous period.
 * @property {number} orders Order count for the range.
 * @property {{ productId: string, name: string, quantity: number }[]} popularProducts
 * @property {Record<string, { current: number, previous: number }>} metrics
 *   Keyed by newMembers, activeCustomers, leavesAwarded, and rewardsRedeemed.
 *
 * @typedef {Object} ActivityItem
 * @property {string} id
 * @property {string} actor Staff member name, or "System".
 * @property {string} [role] Role of a staff member.
 * @property {string} description
 * @property {string} timestamp ISO 8601 date-time.
 */

/** Date filters shown on the dashboard. The ids are also sent to the API. */
export const dashboardRanges = [
  { id: 'today', label: 'Today', chartTitle: 'Revenue by hour' },
  { id: '7d', label: '7 days', chartTitle: 'Revenue by day' },
  { id: '30d', label: '30 days', chartTitle: 'Revenue by 5-day period' },
  { id: 'quarter', label: 'Quarter', chartTitle: 'Revenue by week' },
]

export const DEFAULT_DASHBOARD_RANGE = '7d'

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

// Consecutive spans of `length` days ending today, oldest first, labelled by their first day.
function spans(today, count, length) {
  return Array.from({ length: count }, (_, index) => {
    const start = addDays(today, -(count - index) * length + 1)
    const end = addDays(start, length - 1)
    return { label: formatMonthDay(start), period: formatDateSpan(start, end) }
  })
}

const productName = (id) => products.find((product) => product.id === id)?.name ?? id

// Per range: the label of each revenue bucket (built from today's date), the
// revenue in each bucket, and the comparison figures. Metrics are [current, previous].
const rangeData = {
  today: {
    chartNote: 'Illustrative values · sample day by hour',
    periods: () => Array.from({ length: 12 }, (_, index) => ({
      label: formatHour(8 + index),
      period: `${formatHour(8 + index)} - ${formatHour(9 + index)}`,
    })),
    revenue: [142, 318, 296, 203, 231, 318, 276, 188, 164, 213, 207, 153],
    previousRevenue: 2598,
    orders: 208,
    popular: [
      ['prod-brown-sugar-milk-tea', 61],
      ['prod-jasmine-green-tea', 52],
      ['prod-vanilla-latte', 38],
      ['prod-earl-grey-espresso-latte', 29],
      ['prod-hibiscus-rose-tisane', 24],
    ],
    metrics: {
      newMembers: [4, 3],
      activeCustomers: [186, 191],
      leavesAwarded: [4450, 4240],
      rewardsRedeemed: [9, 11],
    },
  },
  '7d': {
    chartNote: 'Illustrative values · 7-day sample',
    periods: (today) => Array.from({ length: 7 }, (_, index) => {
      const day = addDays(today, index - 6)
      return {
        label: formatWeekday(day),
        period: `${formatWeekday(day)} ${formatMonthDay(day)}, ${day.getFullYear()}`,
      }
    }),
    revenue: [2408, 2803, 2311, 3097, 2722, 2481, 3196],
    previousRevenue: 17544,
    orders: 1462,
    popular: [
      ['prod-brown-sugar-milk-tea', 412],
      ['prod-jasmine-green-tea', 356],
      ['prod-vanilla-latte', 241],
      ['prod-earl-grey-espresso-latte', 198],
      ['prod-hibiscus-rose-tisane', 176],
    ],
    metrics: {
      newMembers: [23, 18],
      activeCustomers: [1412, 1442],
      leavesAwarded: [31280, 28697],
      rewardsRedeemed: [64, 50],
    },
  },
  '30d': {
    chartNote: 'Illustrative values · 30-day sample · labels show the first day of each period',
    periods: (today) => spans(today, 6, 5),
    revenue: [12486, 13120, 12934, 13702, 13415, 14163],
    previousRevenue: 74968,
    orders: 6121,
    popular: [
      ['prod-brown-sugar-milk-tea', 1684],
      ['prod-jasmine-green-tea', 1402],
      ['prod-taro-milk-tea', 1011],
      ['prod-vanilla-latte', 982],
      ['prod-earl-grey-espresso-latte', 817],
    ],
    metrics: {
      newMembers: [91, 83],
      activeCustomers: [3980, 3846],
      leavesAwarded: [130900, 121400],
      rewardsRedeemed: [262, 241],
    },
  },
  quarter: {
    chartNote: 'Illustrative values · 13-week sample · labels show the first day of each week',
    periods: (today) => spans(today, 13, 7),
    revenue: [17640, 17912, 18204, 17785, 18430, 18876, 18142, 19205, 18630, 19044, 18517, 19431, 19018],
    previousRevenue: 227600,
    orders: 18480,
    popular: [
      ['prod-brown-sugar-milk-tea', 4905],
      ['prod-jasmine-green-tea', 4110],
      ['prod-taro-milk-tea', 3284],
      ['prod-vanilla-latte', 2940],
      ['prod-hibiscus-rose-tisane', 2512],
    ],
    metrics: {
      newMembers: [262, 247],
      activeCustomers: [7640, 7415],
      leavesAwarded: [395000, 372000],
      rewardsRedeemed: [781, 742],
    },
  },
}

/**
 * Builds the analytics for one date range, ending today (`now`).
 *
 * @param {string} range One of the ids in `dashboardRanges`.
 * @param {Date} [now] Defaults to the current time when called.
 * @returns {DashboardAnalytics}
 */
export function createDashboardAnalytics(range, now = new Date()) {
  const data = rangeData[range]
  if (!data) throw new Error(`Unknown dashboard range: ${range}`)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return {
    range,
    chartNote: data.chartNote,
    buckets: data.periods(today).map((bucket, index) => ({ ...bucket, revenue: data.revenue[index] })),
    previousRevenue: data.previousRevenue,
    orders: data.orders,
    popularProducts: data.popular.map(([productId, quantity]) => ({
      productId,
      name: productName(productId),
      quantity,
    })),
    metrics: Object.fromEntries(Object.entries(data.metrics).map(([id, [current, previous]]) => [id, { current, previous }])),
  }
}

/**
 * Builds a sample activity feed relative to `now`: recent entries minutes ago,
 * older ones yesterday.
 *
 * @param {Date} [now] Defaults to the current time when called.
 * @returns {ActivityItem[]}
 */
export function createRecentActivity(now = new Date()) {
  const minutesAgo = (minutes) => new Date(now.getTime() - minutes * 60 * 1000).toISOString()
  const yesterdayAt = (hour, minute) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, hour, minute).toISOString()

  return [
    { id: 'activity-1', actor: 'Mei Chen', role: 'Manager', description: 'Marked Taro Milk Tea as sold out', timestamp: minutesAgo(18) },
    { id: 'activity-2', actor: 'System', description: 'Square sync completed · 208 orders', timestamp: minutesAgo(30) },
    { id: 'activity-3', actor: 'Leo Park', role: 'Admin', description: 'Adjusted +50 leaves for Alex Rivera · Reason: missed stamp', timestamp: minutesAgo(65) },
    { id: 'activity-4', actor: 'Leo Park', role: 'Admin', description: 'Published poll “Winter seasonal vote”', timestamp: yesterdayAt(16, 20) },
    { id: 'activity-5', actor: 'Mei Chen', role: 'Manager', description: 'Refunded order ord-1001 · $6.80', timestamp: yesterdayAt(11, 5) },
  ]
}
