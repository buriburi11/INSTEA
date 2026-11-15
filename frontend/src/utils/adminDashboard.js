/**
 * Pure helpers for the admin dashboard overview: formatting, trends, chart
 * scale, CSV export, relative dates, and response validation.
 *
 * Nothing here reads the clock. Callers pass `now` so results are repeatable.
 * Dates use local calendar days; "YYYY-MM-DD" strings are never parsed as UTC.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_MS = 24 * 60 * 60 * 1000
const UNAVAILABLE = '—'

const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** Parses "YYYY-MM-DD" as a local date. Returns null for anything else. */
export function parseLocalDate(value) {
  const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day)
  const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  return valid ? date : null
}

/** Formats a date as a local "YYYY-MM-DD" string (not UTC). */
export function formatIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// Whole local calendar days, unaffected by daylight saving changes.
function dayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS)
}

export function formatWeekday(date) {
  return WEEKDAYS[date.getDay()]
}

export function formatMonthDay(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

/** "Nov 9", or "Nov 9, 2025" when the year differs from `now`. */
export function formatShortDate(date, now) {
  const year = date.getFullYear() === now.getFullYear() ? '' : `, ${date.getFullYear()}`
  return `${formatMonthDay(date)}${year}`
}

/** "Oct 16 - Oct 20, 2026", with the start year added when the span crosses years. */
export function formatDateSpan(start, end) {
  const startYear = start.getFullYear() === end.getFullYear() ? '' : `, ${start.getFullYear()}`
  return `${formatMonthDay(start)}${startYear} - ${formatMonthDay(end)}, ${end.getFullYear()}`
}

/** 8 -> "8 AM", 13 -> "1 PM". */
export function formatHour(hour) {
  return `${hour % 12 || 12} ${hour % 24 < 12 ? 'AM' : 'PM'}`
}

/** "9:42 AM". Built by hand so the result does not depend on the ICU version. */
export function formatClock(date) {
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${date.getHours() % 12 || 12}:${minutes} ${date.getHours() < 12 ? 'AM' : 'PM'}`
}

/** Today shows the time, yesterday says "Yesterday", anything else a short date. */
export function formatActivityTime(date, now) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Time unavailable'
  const daysAgo = dayNumber(now) - dayNumber(date)
  if (daysAgo === 0) return formatClock(date)
  if (daysAgo === 1) return 'Yesterday'
  return formatShortDate(date, now)
}

function plural(count, unit) {
  return `${count} ${unit}${count === 1 ? '' : 's'}`
}

/** "Closes in 4 days" by calendar day, then hours or minutes on the last day. */
export function describeTimeLeft(endsAt, now) {
  const remaining = endsAt.getTime() - now.getTime()
  if (remaining <= 0) return 'Closed'
  const days = dayNumber(endsAt) - dayNumber(now)
  if (days >= 1) return `Closes in ${plural(days, 'day')}`
  const hours = Math.floor(remaining / (60 * 60 * 1000))
  if (hours >= 1) return `Closes in ${plural(hours, 'hour')}`
  return `Closes in ${plural(Math.max(1, Math.ceil(remaining / (60 * 1000))), 'minute')}`
}

// Poll deadlines are saved as local date-times; a bare date closes at the end of that day.
function parseEndsAt(value) {
  if (typeof value !== 'string') return null
  const day = parseLocalDate(value)
  if (day) return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// ---------------------------------------------------------------------------
// Numbers and trends
// ---------------------------------------------------------------------------

/** 19018 -> "$19,018". Missing values show a dash. */
export function formatCurrency(value) {
  return Number.isFinite(value) ? currencyFormat.format(value) : UNAVAILABLE
}

/** 31280 -> "31,280". Missing values show a dash. */
export function formatNumber(value) {
  return Number.isFinite(value) ? numberFormat.format(value) : UNAVAILABLE
}

/** Short chart labels: 950 -> "950", 2412 -> "2.4k", 1250000 -> "1.3M". */
export function formatCompact(value) {
  if (!Number.isFinite(value)) return UNAVAILABLE
  const rounded = Math.round(value)
  if (Math.abs(rounded) < 1000) return String(rounded)
  const [divisor, suffix] = Math.abs(value) >= 999500 ? [1000000, 'M'] : [1000, 'k']
  return `${numberFormat.format(value / divisor)}${suffix}`
}

/** Percentage change from `previous` to `current`, or null when there is no baseline. */
export function percentChange(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous < 0) return null
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

const TREND_WORDS = { up: 'Up', down: 'Down', flat: 'No change', none: 'No comparison available' }

/**
 * Describes how `current` compares with `previous`.
 * `mode` is "percent" ("+8.4%") or "count" ("+5").
 *
 * @returns {{ direction: 'up' | 'down' | 'flat' | 'none', text: string, word: string }}
 */
export function getTrend(current, previous, mode = 'percent') {
  const change = mode === 'count'
    ? (Number.isFinite(current) && Number.isFinite(previous) ? current - previous : null)
    : percentChange(current, previous)
  if (change === null) return { direction: 'none', text: '', word: TREND_WORDS.none }

  // Direction follows what is displayed, so "+0.04%" is flat rather than a tiny rise.
  const rounded = Math.round(change * 10) / 10
  const direction = rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat'
  const sign = direction === 'up' ? '+' : direction === 'down' ? '-' : ''
  const text = `${sign}${numberFormat.format(Math.abs(rounded))}${mode === 'count' ? '' : '%'}`
  return { direction, text, word: TREND_WORDS[direction] }
}

/** Sums revenue in cents so decimal prices do not accumulate floating-point drift. */
export function sumRevenue(buckets) {
  return buckets.reduce((sum, bucket) => sum + Math.round(bucket.revenue * 100), 0) / 100
}

/**
 * Chart axis for a largest value: a rounded ceiling and evenly spaced ticks
 * starting at 0 (at most four intervals).
 *
 * @returns {{ max: number, ticks: number[] }}
 */
export function niceScale(maxValue) {
  if (!Number.isFinite(maxValue) || maxValue <= 0) return { max: 100, ticks: [0, 50, 100] }
  const rough = maxValue / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough)
  const intervals = Math.ceil(maxValue / step)
  const ticks = Array.from({ length: intervals + 1 }, (_, index) => Math.round(index * step * 1e6) / 1e6)
  return { max: ticks[intervals], ticks }
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

// Numbers are written as-is. Text is quoted when needed, and text that a
// spreadsheet could run as a formula gets a leading apostrophe.
function csvCell(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''
  let text = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const money = (value) => value.toFixed(2)

/**
 * Builds the revenue export: the chart buckets for the selected range followed
 * by the totals shown on the page. `change` is the percentage change, rounded
 * to one decimal like the page. Rows end with CRLF as RFC 4180 describes.
 *
 * @param {{
 *   rangeLabel: string,
 *   reportDate: string,
 *   buckets: { period: string, revenue: number }[],
 *   total: number,
 *   previousRevenue: number | null,
 *   change: number | null,
 *   orders: number | null,
 * }} report
 * @returns {string}
 */
export function buildRevenueCsv({ rangeLabel, reportDate, buckets, total, previousRevenue, change, orders }) {
  const rows = [
    ['INSTEA revenue export'],
    ['Range', rangeLabel],
    ['Report date', reportDate],
    [],
    ['Period', 'Revenue (USD)'],
    ...buckets.map((bucket) => [bucket.period, money(bucket.revenue)]),
    [],
    ['Total revenue (USD)', money(total)],
    ['Previous period revenue (USD)', previousRevenue === null ? '' : money(previousRevenue)],
    ['Change vs previous period (%)', change === null ? '' : Math.round(change * 10) / 10],
    ['Orders', orders === null ? '' : orders],
  ]
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

/** "instea-revenue-7-days-2026-11-14.csv" */
export function buildExportFilename(rangeLabel, date) {
  const slug = rangeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `instea-revenue-${slug}-${formatIsoDate(date)}.csv`
}

/** Saves text as a file through a temporary download link. */
export function downloadTextFile(filename, text, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.hidden = true
  document.body.append(link)
  try {
    link.click()
  } finally {
    link.remove()
    // Revoke after the click has been handled; some browsers cancel the download otherwise.
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}

// ---------------------------------------------------------------------------
// Community widgets
// ---------------------------------------------------------------------------

function pollTitle(poll, products) {
  const fallback = poll.title || 'Untitled poll'
  if (poll.type === 'keep-retire') {
    const product = products.find((entry) => entry.id === poll.productId)
    return `Keep or retire: ${product?.name || fallback}`
  }
  return poll.question || fallback
}

/**
 * Polls members can vote on right now, newest first. Mirrors the Community
 * page: only polls with status "active" whose deadline has not passed.
 */
export function getActivePolls(polls, now, products = []) {
  return [...polls]
    .reverse()
    .map((poll) => ({ poll, endsAt: parseEndsAt(poll.endsAt) }))
    .filter(({ poll, endsAt }) => poll.status === 'active' && endsAt !== null && endsAt > now)
    .map(({ poll, endsAt }, index) => ({
      id: poll.id ?? `poll-${index}`,
      title: pollTitle(poll, products),
      votes: Number.isFinite(poll.voteCount) && poll.voteCount > 0 ? Math.floor(poll.voteCount) : 0,
      closesIn: describeTimeLeft(endsAt, now),
    }))
}

/** The next events starting today or later, soonest first. Cancelled events are left out. */
export function getUpcomingEvents(events, now, limit = 3) {
  return events
    .map((event) => ({ event, day: parseLocalDate(event.date) }))
    .filter(({ event, day }) => event.status !== 'cancelled' && day !== null && dayNumber(day) >= dayNumber(now))
    .sort((a, b) => a.day - b.day)
    .slice(0, limit)
    .map(({ event, day }, index) => ({
      id: event.id ?? `event-${index}`,
      title: event.title || 'Untitled event',
      date: event.date,
      label: formatShortDate(day, now),
    }))
}

// ---------------------------------------------------------------------------
// Response validation. Each function returns clean data or throws, so the
// page shows its error state instead of rendering something misleading.
// ---------------------------------------------------------------------------

function toList(value, name) {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw new Error(`Invalid ${name}`)
  return value
}

function toAmount(value, name, { optional = false } = {}) {
  if (optional && (value === undefined || value === null)) return null
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid ${name}`)
  return value
}

function toRecord(data, name) {
  if (data === null || data === undefined) return {}
  if (typeof data !== 'object' || Array.isArray(data)) throw new Error(`Invalid ${name} response`)
  return data
}

/**
 * Validates the analytics response for one date range. Missing sections become
 * empty; negative or non-numeric amounts are rejected.
 */
export function normalizeAnalytics(data) {
  const source = toRecord(data, 'analytics')
  const metrics = toRecord(source.metrics, 'metrics')
  return {
    chartNote: typeof source.chartNote === 'string' ? source.chartNote : '',
    buckets: toList(source.buckets, 'buckets').map((bucket) => ({
      label: String(bucket?.label ?? ''),
      period: String(bucket?.period ?? bucket?.label ?? ''),
      revenue: toAmount(bucket?.revenue, 'bucket revenue'),
    })),
    previousRevenue: toAmount(source.previousRevenue, 'previous revenue', { optional: true }),
    orders: toAmount(source.orders, 'order count', { optional: true }),
    popularProducts: toList(source.popularProducts, 'popular products').map((product, index) => ({
      id: product?.productId ?? `product-${index}`,
      name: String(product?.name ?? 'Unnamed product'),
      quantity: toAmount(product?.quantity, 'product quantity'),
    })),
    metrics: Object.fromEntries(Object.entries(metrics).map(([id, metric]) => [id, {
      current: toAmount(metric?.current, `${id} value`, { optional: true }),
      previous: toAmount(metric?.previous, `${id} previous value`, { optional: true }),
    }])),
  }
}

/** Validates the activity feed; items without a description are dropped. */
export function normalizeActivity(data) {
  return toList(data, 'activity')
    .filter((item) => typeof item?.description === 'string' && item.description.trim() !== '')
    .map((item, index) => {
      // `new Date(null)` is the 1970 epoch, so only real timestamps are parsed.
      const date = item.timestamp ? new Date(item.timestamp) : null
      return {
        id: item.id ?? `activity-${index}`,
        actor: item.actor ? String(item.actor) : 'System',
        role: item.role ? String(item.role) : '',
        description: item.description,
        date: date && !Number.isNaN(date.getTime()) ? date : null,
      }
    })
    .sort((a, b) => (b.date?.getTime() ?? -Infinity) - (a.date?.getTime() ?? -Infinity))
}

/** Validates the community response (polls, events, and product names). */
export function normalizeCommunity(data) {
  const source = toRecord(data, 'community')
  const objects = (value, name) => toList(value, name).filter((entry) => entry && typeof entry === 'object')
  return {
    polls: objects(source.polls, 'polls'),
    events: objects(source.events, 'events'),
    products: objects(source.products, 'products'),
  }
}
