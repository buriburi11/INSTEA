import { createDashboardAnalytics, createRecentActivity, dashboardRanges } from '../data/adminDashboard.js'
import { mockPolls } from '../data/communityPolls.js'
import { events } from '../data/events.js'
import { products } from '../data/products.js'
import { getCommunityOverview, getDashboardAnalytics, getRecentActivity } from '../services/adminDashboardService.js'
import { createEvent, setEventStatus, updateEvent } from '../services/eventService.js'
import {
  buildExportFilename,
  buildRevenueCsv,
  describeTimeLeft,
  downloadTextFile,
  formatActivityTime,
  formatClock,
  formatCompact,
  formatCurrency,
  formatDateSpan,
  formatHour,
  formatIsoDate,
  formatNumber,
  formatShortDate,
  getActivePolls,
  getTrend,
  getUpcomingEvents,
  niceScale,
  normalizeActivity,
  normalizeAnalytics,
  normalizeCommunity,
  parseLocalDate,
  percentChange,
  sumRevenue,
} from './adminDashboard.js'

// Saturday, 14 November 2026, 11:00 local time.
const NOW = new Date(2026, 10, 14, 11, 0)

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('dates', () => {
  it('parses YYYY-MM-DD as a local calendar date and rejects impossible dates', () => {
    const date = parseLocalDate('2026-12-06')
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 11, 6, 0])
    for (const value of ['2026-02-30', '2026-13-01', '2026-1-1', '2026-12-06T10:00:00', '', null, undefined, 20261206]) {
      expect(parseLocalDate(value)).toBeNull()
    }
  })

  it('formats local dates and times without relying on Intl', () => {
    expect(formatIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(formatClock(new Date(2026, 10, 14, 9, 42))).toBe('9:42 AM')
    expect(formatClock(new Date(2026, 10, 14, 0, 5))).toBe('12:05 AM')
    expect(formatClock(new Date(2026, 10, 14, 12, 0))).toBe('12:00 PM')
    expect(formatClock(new Date(2026, 10, 14, 23, 30))).toBe('11:30 PM')
    expect([formatHour(8), formatHour(12), formatHour(13), formatHour(0), formatHour(24)]).toEqual(['8 AM', '12 PM', '1 PM', '12 AM', '12 AM'])
    expect(formatShortDate(new Date(2026, 10, 9), NOW)).toBe('Nov 9')
    expect(formatShortDate(new Date(2025, 11, 31), NOW)).toBe('Dec 31, 2025')
    expect(formatDateSpan(new Date(2026, 9, 16), new Date(2026, 9, 20))).toBe('Oct 16 - Oct 20, 2026')
    expect(formatDateSpan(new Date(2025, 11, 28), new Date(2026, 0, 3))).toBe('Dec 28, 2025 - Jan 3, 2026')
  })

  it('labels activity as a time today, Yesterday, or a short date', () => {
    expect(formatActivityTime(new Date(2026, 10, 14, 9, 42), NOW)).toBe('9:42 AM')
    expect(formatActivityTime(new Date(2026, 10, 13, 23, 59), NOW)).toBe('Yesterday')
    expect(formatActivityTime(new Date(2026, 10, 12, 16, 0), NOW)).toBe('Nov 12')
    expect(formatActivityTime(new Date(2025, 10, 13, 16, 0), NOW)).toBe('Nov 13, 2025')
    expect(formatActivityTime(null, NOW)).toBe('Time unavailable')
    expect(formatActivityTime(new Date('nope'), NOW)).toBe('Time unavailable')
    // Midnight is the boundary, not 24 hours.
    expect(formatActivityTime(new Date(2026, 10, 13, 23, 59), new Date(2026, 10, 14, 0, 1))).toBe('Yesterday')
  })

  it('describes the time left by calendar day, then hours and minutes', () => {
    const closes = (...args) => describeTimeLeft(new Date(...args), new Date(2026, 11, 6, 12, 0))
    expect(closes(2026, 11, 10, 23, 59, 59)).toBe('Closes in 4 days')
    expect(closes(2026, 11, 7, 8, 0)).toBe('Closes in 1 day')
    expect(closes(2026, 11, 6, 23, 59, 59)).toBe('Closes in 11 hours')
    expect(closes(2026, 11, 6, 13, 30)).toBe('Closes in 1 hour')
    expect(closes(2026, 11, 6, 12, 20)).toBe('Closes in 20 minutes')
    expect(closes(2026, 11, 6, 12, 0, 10)).toBe('Closes in 1 minute')
    expect(closes(2026, 11, 6, 12, 0)).toBe('Closed')
    expect(closes(2026, 11, 5, 12, 0)).toBe('Closed')
  })
})

describe('number formatting and trends', () => {
  it('formats currency, counts, and compact chart labels', () => {
    expect(formatCurrency(19018)).toBe('$19,018')
    expect(formatCurrency(0)).toBe('$0')
    expect(formatCurrency(null)).toBe('—')
    expect(formatNumber(31280)).toBe('31,280')
    expect(formatNumber(undefined)).toBe('—')
    expect([0, 950, 2408, 3196, 9960, 13205, 231000, 999.6, 1250000].map(formatCompact))
      .toEqual(['0', '950', '2.4k', '3.2k', '10k', '13.2k', '231k', '1k', '1.3M'])
  })

  it('derives the percentage change and treats a missing baseline as unknown', () => {
    expect(percentChange(19018, 17544)).toBeCloseTo(8.4, 1)
    expect(percentChange(1412, 1442)).toBeCloseTo(-2.08, 2)
    expect(percentChange(0, 0)).toBe(0)
    expect(percentChange(50, 0)).toBeNull()
    expect(percentChange(50, null)).toBeNull()
    expect(percentChange(null, 50)).toBeNull()
  })

  it('describes trends by what is displayed', () => {
    expect(getTrend(19018, 17544)).toEqual({ direction: 'up', text: '+8.4%', word: 'Up' })
    expect(getTrend(1412, 1442)).toEqual({ direction: 'down', text: '-2.1%', word: 'Down' })
    expect(getTrend(31280, 28697)).toMatchObject({ direction: 'up', text: '+9%' })
    expect(getTrend(23, 18, 'count')).toMatchObject({ direction: 'up', text: '+5' })
    expect(getTrend(9, 11, 'count')).toMatchObject({ direction: 'down', text: '-2' })
    expect(getTrend(5, 5, 'count')).toMatchObject({ direction: 'flat', text: '0', word: 'No change' })
    // A change that rounds to zero is flat, not a rise or a fall.
    expect(getTrend(100.04, 100)).toMatchObject({ direction: 'flat', text: '0%' })
    expect(getTrend(99.96, 100)).toMatchObject({ direction: 'flat', text: '0%' })
    expect(getTrend(5, 0)).toEqual({ direction: 'none', text: '', word: 'No comparison available' })
    expect(getTrend(null, 5, 'count').direction).toBe('none')
  })

  it('sums revenue in cents without floating-point drift', () => {
    expect(sumRevenue([{ revenue: 0.1 }, { revenue: 0.2 }])).toBe(0.3)
    expect(sumRevenue([])).toBe(0)
  })
})

describe('niceScale', () => {
  it('rounds the top of the axis up to evenly spaced ticks', () => {
    expect(niceScale(3196)).toEqual({ max: 4000, ticks: [0, 1000, 2000, 3000, 4000] })
    expect(niceScale(318)).toEqual({ max: 400, ticks: [0, 100, 200, 300, 400] })
    expect(niceScale(14163)).toEqual({ max: 15000, ticks: [0, 5000, 10000, 15000] })
    expect(niceScale(19431)).toEqual({ max: 20000, ticks: [0, 5000, 10000, 15000, 20000] })
    expect(niceScale(4000).max).toBe(4000)
    expect(niceScale(7).ticks[niceScale(7).ticks.length - 1]).toBeGreaterThanOrEqual(7)
  })

  it('never produces a ceiling below the largest value or more than four intervals', () => {
    for (const value of [1, 3.5, 99, 101, 999, 1001, 2500, 2501, 48999, 123456]) {
      const { max, ticks } = niceScale(value)
      expect(max).toBeGreaterThanOrEqual(value)
      expect(ticks[0]).toBe(0)
      expect(ticks.length - 1).toBeLessThanOrEqual(4)
    }
  })

  it('has a default axis when there is nothing to scale', () => {
    for (const value of [0, -5, NaN, undefined]) expect(niceScale(value)).toEqual({ max: 100, ticks: [0, 50, 100] })
  })
})

describe('buildRevenueCsv', () => {
  const report = {
    rangeLabel: '7 days',
    reportDate: '2026-11-14',
    buckets: [
      { period: 'Sun Nov 8, 2026', revenue: 2408 },
      { period: 'Mon Nov 9, 2026', revenue: 2803.5 },
    ],
    total: 5211.5,
    previousRevenue: 4800,
    change: 8.572916,
    orders: 410,
  }

  it('lists every bucket, then the totals shown on the page', () => {
    expect(buildRevenueCsv(report).split('\r\n')).toEqual([
      'INSTEA revenue export',
      'Range,7 days',
      'Report date,2026-11-14',
      '',
      'Period,Revenue (USD)',
      '"Sun Nov 8, 2026",2408.00',
      '"Mon Nov 9, 2026",2803.50',
      '',
      'Total revenue (USD),5211.50',
      'Previous period revenue (USD),4800.00',
      'Change vs previous period (%),8.6',
      'Orders,410',
      '',
    ])
  })

  it('leaves unknown comparisons blank and keeps negative changes numeric', () => {
    const rows = buildRevenueCsv({ ...report, previousRevenue: null, change: null, orders: null }).split('\r\n')
    expect(rows).toContain('Previous period revenue (USD),')
    expect(rows).toContain('Change vs previous period (%),')
    expect(rows).toContain('Orders,')
    expect(buildRevenueCsv({ ...report, change: -2.08 })).toContain('Change vs previous period (%),-2.1\r\n')
  })

  it('quotes special characters and neutralises spreadsheet formulas', () => {
    const csv = buildRevenueCsv({
      ...report,
      rangeLabel: 'Say "hi", ok',
      buckets: [{ period: '=SUM(A1:A2)', revenue: 1 }, { period: '@cmd', revenue: 2 }],
    })
    expect(csv).toContain('Range,"Say ""hi"", ok"\r\n')
    expect(csv).toContain("'=SUM(A1:A2),1.00\r\n")
    expect(csv).toContain("'@cmd,2.00\r\n")
  })

  it('handles an empty chart', () => {
    const rows = buildRevenueCsv({ ...report, buckets: [], total: 0 }).split('\r\n')
    expect(rows.slice(4, 8)).toEqual(['Period,Revenue (USD)', '', 'Total revenue (USD),0.00', 'Previous period revenue (USD),4800.00'])
  })

  it('names the file after the range and the local date', () => {
    expect(buildExportFilename('7 days', new Date(2026, 10, 14, 23, 59))).toBe('instea-revenue-7-days-2026-11-14.csv')
    expect(buildExportFilename('Today', new Date(2026, 0, 5))).toBe('instea-revenue-today-2026-01-05.csv')
    expect(buildExportFilename('Quarter', new Date(2026, 10, 14))).toBe('instea-revenue-quarter-2026-11-14.csv')
  })
})

describe('downloadTextFile', () => {
  // jsdom has no object URLs, so they are replaced for these tests and put back afterwards.
  const originalUrlMethods = { createObjectURL: URL.createObjectURL, revokeObjectURL: URL.revokeObjectURL }
  afterEach(() => Object.assign(URL, originalUrlMethods))

  it('saves the text through a temporary link and releases the object URL', async () => {
    const createObjectURL = vi.fn(() => 'blob:instea-test')
    const revokeObjectURL = vi.fn()
    Object.assign(URL, { createObjectURL, revokeObjectURL })
    let clicked
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click() {
      clicked = { href: this.href, download: this.download, attached: this.isConnected }
    })

    downloadTextFile('report.csv', 'a,b\r\n')

    const blob = createObjectURL.mock.calls[0][0]
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('text/csv;charset=utf-8')
    expect(await blob.text()).toBe('a,b\r\n')
    expect(clicked).toEqual({ href: 'blob:instea-test', download: 'report.csv', attached: true })
    expect(document.querySelector('a[download]')).toBeNull()
    await vi.waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:instea-test'))
  })

  it('removes the link and releases the URL even if the click fails', async () => {
    const revokeObjectURL = vi.fn()
    Object.assign(URL, { createObjectURL: () => 'blob:x', revokeObjectURL })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => { throw new Error('blocked') })

    expect(() => downloadTextFile('report.csv', 'a')).toThrow('blocked')
    expect(document.querySelector('a[download]')).toBeNull()
    await vi.waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:x'))
  })
})

describe('community widgets', () => {
  const poll = (overrides) => ({ id: 1, type: 'general', title: 'Winter vote', status: 'active', endsAt: '2026-12-10T23:59:59', ...overrides })

  it('lists open polls newest first with their votes and time left', () => {
    const now = new Date(2026, 11, 6, 9, 0)
    const result = getActivePolls([
      poll({ id: 'old', title: 'Old', voteCount: 12 }),
      poll({ id: 'kr', type: 'keep-retire', title: 'Fallback', productId: 'prod-taro-milk-tea', voteCount: 1, endsAt: '2026-12-15T23:59:59' }),
    ], now, products)
    expect(result).toEqual([
      { id: 'kr', title: 'Keep or retire: Taro Milk Tea', votes: 1, closesIn: 'Closes in 9 days' },
      { id: 'old', title: 'Old', votes: 12, closesIn: 'Closes in 4 days' },
    ])
  })

  it('skips replaced, deleted, ended, and undated polls and prefers a poll question', () => {
    const now = new Date(2026, 11, 6, 9, 0)
    const result = getActivePolls([
      poll({ id: 'a', status: 'replaced' }),
      poll({ id: 'b', status: 'deleted' }),
      poll({ id: 'c', endsAt: '2026-12-06T08:59:59' }),
      poll({ id: 'd', endsAt: undefined }),
      poll({ id: 'e', endsAt: 'not a date' }),
      poll({ id: 'f', question: 'Which tea?', endsAt: '2026-12-06' }),
      poll({ id: 'g', title: undefined, voteCount: -4 }),
    ], now)
    expect(result.map(({ id, title, votes }) => [id, title, votes])).toEqual([
      ['g', 'Untitled poll', 0],
      ['f', 'Which tea?', 0],
    ])
    // A bare date closes at the end of that day, in local time.
    expect(result[1].closesIn).toBe('Closes in 14 hours')
  })

  it('shows the next events from today onward, soonest first', () => {
    const list = [
      { id: 4, title: 'Late', date: '2026-12-15' },
      { id: 1, title: 'Past', date: '2026-12-05' },
      { id: 2, title: 'Today', date: '2026-12-06' },
      { id: 3, title: 'Cancelled', date: '2026-12-07', status: 'cancelled' },
      { id: 5, title: 'Broken', date: '12/08/2026' },
      { id: 6, title: 'Next year', date: '2027-01-02' },
      { id: 7, date: '2026-12-09' },
    ]
    const result = getUpcomingEvents(list, new Date(2026, 11, 6, 22, 0))
    expect(result.map(({ title, label }) => [title, label])).toEqual([['Today', 'Dec 6'], ['Untitled event', 'Dec 9'], ['Late', 'Dec 15']])
    expect(getUpcomingEvents(list, new Date(2026, 11, 6), 5).map((event) => event.label)).toEqual(['Dec 6', 'Dec 9', 'Dec 15', 'Jan 2, 2027'])
    expect(getUpcomingEvents([], NOW)).toEqual([])
  })
})

describe('response validation', () => {
  it('accepts a complete analytics response and keeps its numbers', () => {
    const result = normalizeAnalytics(createDashboardAnalytics('7d', NOW))
    expect(result.buckets).toHaveLength(7)
    expect(result.previousRevenue).toBe(17544)
    expect(result.orders).toBe(1462)
    expect(result.popularProducts[0]).toEqual({ id: 'prod-brown-sugar-milk-tea', name: 'Brown Sugar Milk Tea', quantity: 412 })
    expect(result.metrics.newMembers).toEqual({ current: 23, previous: 18 })
  })

  it.each([null, undefined, {}])('treats %j analytics as empty rather than failing', (data) => {
    expect(normalizeAnalytics(data)).toEqual({ chartNote: '', buckets: [], previousRevenue: null, orders: null, popularProducts: [], metrics: {} })
  })

  it.each([
    ['a list', []],
    ['text', 'nope'],
    ['a negative bucket', { buckets: [{ label: 'a', revenue: -1 }] }],
    ['a non-numeric bucket', { buckets: [{ label: 'a', revenue: '12' }] }],
    ['a missing bucket value', { buckets: [{ label: 'a' }] }],
    ['buckets that are not a list', { buckets: {} }],
    ['an invalid previous total', { previousRevenue: NaN }],
    ['an invalid order count', { orders: -3 }],
    ['an invalid product quantity', { popularProducts: [{ name: 'Tea', quantity: 'many' }] }],
    ['an invalid metric', { metrics: { newMembers: { current: -1, previous: 2 } } }],
    ['metrics as a list', { metrics: [] }],
  ])('rejects analytics with %s', (_, data) => {
    expect(() => normalizeAnalytics(data)).toThrow()
  })

  it('sorts the activity feed newest first and tolerates missing fields', () => {
    const result = normalizeActivity([
      { id: 'old', description: 'Old', timestamp: '2026-11-13T10:00:00' },
      { id: 'none', description: 'No time' },
      { id: 'nul', description: 'Null time', timestamp: null },
      { description: '   ' },
      { id: 'new', actor: 'Mei', role: 'Manager', description: 'New', timestamp: '2026-11-14T09:00:00' },
    ])
    expect(result.map((item) => item.id)).toEqual(['new', 'old', 'none', 'nul'])
    expect(result[0]).toMatchObject({ actor: 'Mei', role: 'Manager' })
    expect(result[2]).toMatchObject({ actor: 'System', role: '', date: null })
    expect(result[3].date).toBeNull()
    expect(normalizeActivity(null)).toEqual([])
    expect(() => normalizeActivity({})).toThrow()
  })

  it('keeps only objects in the community response', () => {
    expect(normalizeCommunity({ polls: [{ id: 1 }, null, 'x'], events: [{ id: 2 }], products: undefined }))
      .toEqual({ polls: [{ id: 1 }], events: [{ id: 2 }], products: [] })
    expect(normalizeCommunity(null)).toEqual({ polls: [], events: [], products: [] })
    expect(() => normalizeCommunity({ polls: 'x' })).toThrow()
    expect(() => normalizeCommunity([])).toThrow()
  })
})

describe('mock analytics data', () => {
  it('has the four dashboard ranges', () => {
    expect(dashboardRanges.map((range) => range.id)).toEqual(['today', '7d', '30d', 'quarter'])
  })

  it.each([
    ['today', 12, 2709, 2598, 208],
    ['7d', 7, 19018, 17544, 1462],
    ['30d', 6, 79820, 74968, 6121],
    ['quarter', 13, 240834, 227600, 18480],
  ])('%s has consistent buckets, totals, and comparison', (range, bucketCount, total, previous, orders) => {
    const data = createDashboardAnalytics(range, NOW)
    expect(data.buckets).toHaveLength(bucketCount)
    expect(data.buckets.every((bucket) => Number.isFinite(bucket.revenue) && bucket.revenue > 0)).toBe(true)
    expect(new Set(data.buckets.map((bucket) => bucket.period)).size).toBe(bucketCount)
    expect(sumRevenue(data.buckets)).toBe(total)
    expect(data.previousRevenue).toBe(previous)
    expect(data.orders).toBe(orders)
    // An order averages a few items at $4-$7 each.
    expect(total / orders).toBeGreaterThan(10)
    expect(total / orders).toBeLessThan(16)
    // The response survives validation unchanged.
    expect(normalizeAnalytics(data).buckets).toEqual(data.buckets)
  })

  it('derives the percentage changes the dashboard shows', () => {
    const change = (range) => {
      const data = createDashboardAnalytics(range, NOW)
      return getTrend(sumRevenue(data.buckets), data.previousRevenue).text
    }
    expect([change('today'), change('7d'), change('30d'), change('quarter')]).toEqual(['+4.3%', '+8.4%', '+6.5%', '+5.8%'])
  })

  it('labels buckets from the date given, with local weekdays and dates', () => {
    const week = createDashboardAnalytics('7d', NOW).buckets
    expect(week.map((bucket) => bucket.label)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
    expect(week[0].period).toBe('Sun Nov 8, 2026')
    expect(week[6].period).toBe('Sat Nov 14, 2026')

    const day = createDashboardAnalytics('today', NOW).buckets
    expect([day[0].label, day[0].period, day[11].label, day[11].period]).toEqual(['8 AM', '8 AM - 9 AM', '7 PM', '7 PM - 8 PM'])

    const month = createDashboardAnalytics('30d', NOW).buckets
    expect([month[0].label, month[0].period, month[5].label, month[5].period])
      .toEqual(['Oct 16', 'Oct 16 - Oct 20, 2026', 'Nov 10', 'Nov 10 - Nov 14, 2026'])

    const quarter = createDashboardAnalytics('quarter', NOW).buckets
    expect([quarter[0].period, quarter[12].period]).toEqual(['Aug 16 - Aug 22, 2026', 'Nov 8 - Nov 14, 2026'])

    // The buckets move with the date rather than being fixed to one calendar day.
    expect(createDashboardAnalytics('7d', new Date(2027, 0, 2)).buckets[0].period).toBe('Sun Dec 27, 2026')
  })

  it('uses real menu products, scaled to each range', () => {
    for (const { id } of dashboardRanges) {
      const { popularProducts } = createDashboardAnalytics(id, NOW)
      expect(popularProducts).toHaveLength(5)
      for (const product of popularProducts) {
        expect(products.find((entry) => entry.id === product.productId)?.name).toBe(product.name)
      }
      const quantities = popularProducts.map((product) => product.quantity)
      expect(quantities).toEqual([...quantities].sort((a, b) => b - a))
    }
  })

  it('supplies every business metric with a current and previous value', () => {
    for (const { id } of dashboardRanges) {
      const { metrics } = createDashboardAnalytics(id, NOW)
      expect(Object.keys(metrics)).toEqual(['newMembers', 'activeCustomers', 'leavesAwarded', 'rewardsRedeemed'])
      for (const metric of Object.values(metrics)) expect(Object.keys(metric)).toEqual(['current', 'previous'])
    }
    expect(createDashboardAnalytics('7d', NOW).metrics).toEqual({
      newMembers: { current: 23, previous: 18 },
      activeCustomers: { current: 1412, previous: 1442 },
      leavesAwarded: { current: 31280, previous: 28697 },
      rewardsRedeemed: { current: 64, previous: 50 },
    })
  })

  it('rejects an unknown range', () => {
    expect(() => createDashboardAnalytics('year', NOW)).toThrow('Unknown dashboard range: year')
  })

  it('builds the activity feed relative to the date given, newest first', () => {
    const feed = createRecentActivity(NOW)
    expect(feed).toHaveLength(5)
    const times = feed.map((item) => new Date(item.timestamp).getTime())
    expect(times).toEqual([...times].sort((a, b) => b - a))
    expect(feed.map((item) => formatActivityTime(new Date(item.timestamp), NOW))).toEqual(['10:42 AM', '10:30 AM', '9:55 AM', 'Yesterday', 'Yesterday'])
    expect(feed.filter((item) => item.role).map((item) => item.actor)).toEqual(['Mei Chen', 'Leo Park', 'Leo Park', 'Mei Chen'])
    expect(feed.find((item) => item.actor === 'System')).not.toHaveProperty('role')
  })
})

describe('adminDashboardService (mock mode)', () => {
  // Only the clock is faked, so the service's simulated network delay is stepped by hand.
  async function settle(promise) {
    await vi.advanceTimersByTimeAsync(300)
    return promise
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  it('returns analytics for the requested range, built from the current date', async () => {
    const data = await settle(getDashboardAnalytics('30d'))
    expect(data.range).toBe('30d')
    expect(sumRevenue(data.buckets)).toBe(79820)
    expect(data.buckets[5].period).toBe('Nov 10 - Nov 14, 2026')
    await expect(getDashboardAnalytics('nope')).rejects.toThrow('Unknown dashboard range: nope')
  })

  it('returns an activity feed relative to the current date', async () => {
    const feed = await settle(getRecentActivity())
    expect(new Date(feed[0].timestamp).getTime()).toBe(NOW.getTime() - 18 * 60 * 1000)
  })

  it('returns the sample polls, events, and product names when nothing is saved', async () => {
    const community = await settle(getCommunityOverview())
    expect(community.polls).toEqual(mockPolls)
    // The event service seeds from the sample events and marks each one active.
    expect(community.events.map(({ id, title, date, status }) => [id, title, date, status]))
      .toEqual(events.map(({ id, title, date }) => [id, title, date, 'active']))
    expect(community.products).toContainEqual({ id: 'prod-taro-milk-tea', name: 'Taro Milk Tea' })
    expect(Object.keys(community.products[0])).toEqual(['id', 'name'])
  })

  it('reads events through the event service, so created, edited, and cancelled events are reflected', async () => {
    const created = await settle(createEvent({
      title: 'Matcha Workshop',
      category: 'Drink tasting',
      date: '2026-11-20',
      location: 'SoHo Tea',
      description: 'Hands-on matcha.',
    }))
    await settle(setEventStatus(1, 'cancelled'))
    await settle(updateEvent(2, { title: 'Book Club (moved)', date: '2026-11-18' }))

    const community = await settle(getCommunityOverview())
    expect(community.events).toHaveLength(events.length + 1)
    expect(community.events.find((event) => event.id === created.id)).toMatchObject({ title: 'Matcha Workshop', status: 'active' })
    expect(community.events.find((event) => event.id === 1)).toMatchObject({ status: 'cancelled' })

    // The widget's rules then apply: the cancelled Dec 6 event is skipped, the new and moved ones appear in date order.
    expect(getUpcomingEvents(community.events, NOW).map(({ title, label }) => [title, label])).toEqual([
      ['Book Club (moved)', 'Nov 18'],
      ['Matcha Workshop', 'Nov 20'],
      ['Game Night — Example Event', 'Dec 12'],
    ])
  })

  it('does not wait for the event service twice', async () => {
    const community = getCommunityOverview()
    await vi.advanceTimersByTimeAsync(300)
    expect((await community).events).toHaveLength(events.length)
  })

  it('reads the polls that the Community admin saved, including votes', async () => {
    const saved = [{ id: 'saved', type: 'general', title: 'Saved', status: 'active', endsAt: '2026-12-01T23:59:59', voteCount: 7 }]
    localStorage.setItem('instea-polls', JSON.stringify(saved))
    expect((await settle(getCommunityOverview())).polls).toEqual(saved)
  })

  it.each([['invalid JSON', '{not json'], ['an object', '{"a":1}'], ['text', '"polls"']])('falls back to the sample polls for %s', async (_, value) => {
    localStorage.setItem('instea-polls', value)
    expect((await settle(getCommunityOverview())).polls).toEqual(mockPolls)
  })

  it('does not change the stored polls or the sample data', async () => {
    const saved = JSON.stringify([{ id: 1, status: 'active', endsAt: '2026-12-01T23:59:59' }])
    localStorage.setItem('instea-polls', saved)
    const community = await settle(getCommunityOverview())
    community.polls.push({ id: 2 })
    expect(localStorage.getItem('instea-polls')).toBe(saved)
    expect((await settle(getCommunityOverview())).polls).toHaveLength(1)
  })
})
