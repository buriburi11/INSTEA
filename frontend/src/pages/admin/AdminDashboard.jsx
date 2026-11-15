import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Download, Minus } from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton.jsx'
import useAdminPermissions from '../../auth/useAdminPermissions.js'
import { DEFAULT_DASHBOARD_RANGE, dashboardRanges } from '../../data/adminDashboard.js'
import { getCommunityOverview, getDashboardAnalytics, getRecentActivity } from '../../services/adminDashboardService.js'
import {
  buildExportFilename,
  buildRevenueCsv,
  downloadTextFile,
  formatActivityTime,
  formatCompact,
  formatCurrency,
  formatIsoDate,
  formatNumber,
  getActivePolls,
  getTrend,
  getUpcomingEvents,
  niceScale,
  normalizeActivity,
  normalizeAnalytics,
  normalizeCommunity,
  percentChange,
  sumRevenue,
} from '../../utils/adminDashboard.js'
import './AdminDashboard.css'

const POPULAR_PRODUCT_LIMIT = 5
const ACTIVITY_LIMIT = 5
const trendIcons = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus }

// `trend` is how the change is shown: a percentage, or the difference in a count.
const metricDefinitions = [
  { id: 'revenue', label: 'Revenue', format: formatCurrency, trend: 'percent' },
  { id: 'newMembers', label: 'New members', format: formatNumber, trend: 'count' },
  { id: 'activeCustomers', label: 'Active customers', format: formatNumber, trend: 'percent' },
  { id: 'leavesAwarded', label: 'Leaves awarded', format: formatNumber, trend: 'percent' },
  { id: 'rewardsRedeemed', label: 'Rewards redeemed', format: formatNumber, trend: 'count' },
]

/**
 * Loads data and keeps the result only while it still matches the request, so a
 * slow response for an earlier date range can never replace a newer one.
 * `now` is when the data arrived; relative times are shown against it.
 */
function useRequest(load, input, normalize) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null })
  const key = `${input}:${attempt}`

  useEffect(() => {
    let ignore = false
    Promise.resolve()
      .then(() => load(input))
      .then((data) => {
        const normalized = normalize(data)
        if (!ignore) setResult({ key, data: normalized, now: new Date(), failed: false })
      })
      .catch(() => {
        if (!ignore) setResult({ key, data: null, now: null, failed: true })
      })
    return () => { ignore = true }
  }, [load, input, normalize, key])

  return {
    status: result.key !== key ? 'loading' : result.failed ? 'error' : 'ready',
    data: result.data ?? null,
    now: result.now ?? null,
    retry: () => setAttempt((previous) => previous + 1),
  }
}

function RequestBody({ request, name, framed = false, children }) {
  const className = `admin-dashboard-message${framed ? ' admin-dashboard-message--card' : ''}`
  if (request.status === 'loading') return <p className={className} role="status">Loading {name}…</p>
  if (request.status === 'error') {
    return (
      <div className={className}>
        <p role="alert">We couldn’t load {name}. Please try again.</p>
        <AdminButton variant="secondary" size="compact" aria-label={`Try again: ${name}`} onClick={request.retry}>Try again</AdminButton>
      </div>
    )
  }
  return children(request.data, request.now)
}

// Total revenue is always the sum of the buckets on screen; the change compares it with the previous period.
function summarizeRevenue({ buckets, previousRevenue }) {
  const total = buckets.length > 0 ? sumRevenue(buckets) : null
  return { total, change: percentChange(total, previousRevenue), trend: getTrend(total, previousRevenue) }
}

function buildMetrics(data, total) {
  return metricDefinitions.map(({ id, label, format, trend }) => {
    const { current, previous } = id === 'revenue'
      ? { current: total, previous: data.previousRevenue }
      : data.metrics[id] ?? { current: null, previous: null }
    return { id, label, value: format(current), trend: getTrend(current, previous, trend) }
  })
}

// The arrow, the sign, and the hidden "Up"/"Down" wording all repeat the colour, so it is never the only cue.
function Trend({ trend, showContext = false }) {
  const Icon = trendIcons[trend.direction]
  if (!Icon) return <p className="admin-dashboard-trend admin-dashboard-trend--none">{trend.word}</p>
  return (
    <p className={`admin-dashboard-trend admin-dashboard-trend--${trend.direction}`}>
      <Icon size={14} aria-hidden="true" />
      <span className="admin-dashboard-visually-hidden">{trend.word} </span>
      <span className="admin-dashboard-trend-value">{trend.text}</span>
      <span className={showContext ? undefined : 'admin-dashboard-visually-hidden'}> vs previous period</span>
    </p>
  )
}

function RangeFilter({ value, onChange }) {
  return (
    <div className="admin-dashboard-ranges" role="group" aria-label="Date range">
      {dashboardRanges.map((range) => (
        <button
          key={range.id}
          type="button"
          className="admin-dashboard-range"
          aria-pressed={range.id === value}
          onClick={() => onChange(range.id)}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}

// The bars are decorative for assistive technology: the same values are in the hidden table.
function RevenueChart({ title, note, buckets }) {
  const scale = niceScale(Math.max(0, ...buckets.map((bucket) => bucket.revenue)))
  const position = (value) => `${Math.round((value / scale.max) * 10000) / 100}%`

  return (
    <figure className="admin-dashboard-chart">
      <figcaption className="admin-dashboard-chart-caption">
        <span className="admin-dashboard-chart-title" id="admin-dashboard-chart-title">{title}</span>
        {note && <span className="admin-dashboard-chart-note">{note}</span>}
      </figcaption>

      {buckets.length === 0 ? (
        <p className="admin-dashboard-empty">No revenue recorded for this period.</p>
      ) : (
        <div className="admin-dashboard-chart-scroll" role="region" tabIndex={0} aria-labelledby="admin-dashboard-chart-title">
          <div className="admin-dashboard-plot" aria-hidden="true" style={{ '--admin-dashboard-columns': buckets.length }}>
            <div className="admin-dashboard-axis">
              {scale.ticks.map((tick) => (
                <span key={tick} className="admin-dashboard-tick" style={{ bottom: position(tick) }}>{formatCompact(tick)}</span>
              ))}
            </div>
            <div className="admin-dashboard-area">
              {scale.ticks.map((tick) => (
                <span key={tick} className="admin-dashboard-gridline" style={{ bottom: position(tick) }} />
              ))}
              <div className="admin-dashboard-bars">
                {buckets.map((bucket, index) => (
                  <div key={index} className="admin-dashboard-bar-column">
                    <span className="admin-dashboard-bar-value">{formatCompact(bucket.revenue)}</span>
                    <span className="admin-dashboard-bar" style={{ height: position(bucket.revenue) }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="admin-dashboard-labels">
              {buckets.map((bucket, index) => <span key={index} className="admin-dashboard-label">{bucket.label}</span>)}
            </div>
          </div>

          {/* The 1px wrapper clips the table. Hiding the table itself would not: a table cannot shrink below its content, and clipping does not stop it adding scrollable overflow. */}
          <div className="admin-dashboard-visually-hidden admin-dashboard-chart-data">
            <table>
              <caption>{title}</caption>
              <thead>
                <tr><th scope="col">Period</th><th scope="col">Revenue</th></tr>
              </thead>
              <tbody>
                {buckets.map((bucket, index) => (
                  <tr key={index}><th scope="row">{bucket.period}</th><td>{formatCurrency(bucket.revenue)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </figure>
  )
}

function RevenueCard({ range, data, summary }) {
  return (
    <section className="admin-dashboard-card" aria-labelledby="admin-dashboard-revenue-heading">
      <div className="admin-dashboard-revenue-summary">
        <div>
          <h2 id="admin-dashboard-revenue-heading" className="admin-dashboard-eyebrow">Revenue · {range.label}</h2>
          <p className="admin-dashboard-total">{formatCurrency(summary.total)}</p>
          <Trend trend={summary.trend} showContext />
        </div>
        <div className="admin-dashboard-orders">
          <p className="admin-dashboard-eyebrow">Orders · {range.label}</p>
          <p className="admin-dashboard-orders-value">{formatNumber(data.orders)}</p>
        </div>
      </div>
      <RevenueChart title={range.chartTitle} note={data.chartNote} buckets={data.buckets} />
    </section>
  )
}

function PopularProducts({ range, products }) {
  // Best sellers first; each bar is sized against the top seller.
  const rows = [...products]
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
    .slice(0, POPULAR_PRODUCT_LIMIT)
  const top = rows[0]?.quantity ?? 0

  return (
    <section className="admin-dashboard-card" aria-labelledby="admin-dashboard-products-heading">
      <div className="admin-dashboard-card-header">
        <h2 id="admin-dashboard-products-heading" className="admin-dashboard-title">Popular products</h2>
        <p className="admin-dashboard-muted">Quantity sold · {range.label}</p>
      </div>
      {rows.length === 0 ? (
        <p className="admin-dashboard-empty">No product sales recorded for this period.</p>
      ) : (
        <ol className="admin-dashboard-products">
          {rows.map((product) => (
            <li key={product.id}>
              <div className="admin-dashboard-product-row">
                <span>{product.name}</span>
                <span className="admin-dashboard-product-quantity">
                  {formatNumber(product.quantity)}
                  <span className="admin-dashboard-visually-hidden"> sold</span>
                </span>
              </div>
              <div className="admin-dashboard-track" aria-hidden="true">
                <div className="admin-dashboard-fill" style={{ width: `${top > 0 ? Math.round((product.quantity / top) * 10000) / 100 : 0}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function MetricCards({ metrics }) {
  return (
    <section aria-labelledby="admin-dashboard-metrics-heading">
      <h2 id="admin-dashboard-metrics-heading" className="admin-dashboard-visually-hidden">Business metrics</h2>
      <dl className="admin-dashboard-metrics">
        {metrics.map((metric) => (
          <div key={metric.id} className="admin-dashboard-metric">
            <dt>{metric.label}</dt>
            <dd className="admin-dashboard-metric-value">{metric.value}</dd>
            <dd><Trend trend={metric.trend} /></dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function RecentActivity({ request }) {
  return (
    <section className="admin-dashboard-card" aria-labelledby="admin-dashboard-activity-heading">
      <h2 id="admin-dashboard-activity-heading" className="admin-dashboard-title">Recent activity</h2>
      <RequestBody request={request} name="recent activity">
        {(items, now) => items.length === 0 ? (
          <p className="admin-dashboard-empty">No recent activity.</p>
        ) : (
          <ul className="admin-dashboard-activity">
            {items.slice(0, ACTIVITY_LIMIT).map((item) => (
              <li key={item.id}>
                <p>
                  <strong>{item.role ? `${item.actor} (${item.role})` : item.actor}</strong> — {item.description}
                </p>
                {item.date
                  ? <time className="admin-dashboard-activity-time" dateTime={item.date.toISOString()}>{formatActivityTime(item.date, now)}</time>
                  : <span className="admin-dashboard-activity-time">{formatActivityTime(null, now)}</span>}
              </li>
            ))}
          </ul>
        )}
      </RequestBody>
    </section>
  )
}

function CommunityWidgets({ request }) {
  return (
    <RequestBody request={request} name="community highlights" framed>
      {({ polls, events, products }, now) => {
        const activePolls = getActivePolls(polls, now, products)
        const upcomingEvents = getUpcomingEvents(events, now)
        return (
          <>
            <section className="admin-dashboard-card admin-dashboard-widget" aria-labelledby="admin-dashboard-polls-heading">
              <h2 id="admin-dashboard-polls-heading" className="admin-dashboard-kicker">
                {activePolls.length > 1 ? 'Active polls' : 'Active poll'}
              </h2>
              {activePolls.length === 0 ? (
                <p className="admin-dashboard-empty">No active poll right now.</p>
              ) : (
                <ul className="admin-dashboard-polls">
                  {activePolls.map((poll) => (
                    <li key={poll.id}>
                      <h3 className="admin-dashboard-poll-title">{poll.title}</h3>
                      <p className="admin-dashboard-muted">
                        {formatNumber(poll.votes)} {poll.votes === 1 ? 'vote' : 'votes'} · {poll.closesIn}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="admin-dashboard-card admin-dashboard-widget" aria-labelledby="admin-dashboard-events-heading">
              <h2 id="admin-dashboard-events-heading" className="admin-dashboard-kicker">Upcoming events</h2>
              {upcomingEvents.length === 0 ? (
                <p className="admin-dashboard-empty">No upcoming events.</p>
              ) : (
                <ul className="admin-dashboard-events">
                  {upcomingEvents.map((event) => (
                    <li key={event.id}>
                      <span>{event.title}</span>
                      <time dateTime={event.date}>{event.label}</time>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )
      }}
    </RequestBody>
  )
}

export default function AdminDashboard() {
  const { can } = useAdminPermissions()
  const canExport = can('reports.view')
  const [rangeId, setRangeId] = useState(DEFAULT_DASHBOARD_RANGE)
  const [exportNotice, setExportNotice] = useState({ status: 'idle', message: '' })
  const analytics = useRequest(getDashboardAnalytics, rangeId, normalizeAnalytics)
  const activity = useRequest(getRecentActivity, undefined, normalizeActivity)
  const community = useRequest(getCommunityOverview, undefined, normalizeCommunity)
  const range = dashboardRanges.find((entry) => entry.id === rangeId)
  const exportable = analytics.status === 'ready' && analytics.data.buckets.length > 0

  function selectRange(nextRangeId) {
    setRangeId(nextRangeId)
    setExportNotice({ status: 'idle', message: '' })
  }

  // Exports exactly what the chart and totals show for the selected range.
  function exportRevenue() {
    if (!canExport || !exportable) return
    const { buckets, previousRevenue, orders } = analytics.data
    const { total, change } = summarizeRevenue(analytics.data)
    const exportedAt = new Date()
    const filename = buildExportFilename(range.label, exportedAt)
    try {
      downloadTextFile(filename, buildRevenueCsv({
        rangeLabel: range.label,
        reportDate: formatIsoDate(exportedAt),
        buckets,
        total,
        previousRevenue,
        change,
        orders,
      }))
      setExportNotice({ status: 'success', message: `Exported ${filename}` })
    } catch {
      setExportNotice({ status: 'error', message: 'We couldn’t export the revenue data. Please try again.' })
    }
  }

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-heading">
      <header className="admin-dashboard-header">
        <h1 id="admin-dashboard-heading">Overview</h1>
        <div className="admin-dashboard-controls">
          <RangeFilter value={rangeId} onChange={selectRange} />
          {canExport && (
            <AdminButton variant="secondary" aria-label="Export revenue data as CSV" disabled={!exportable} onClick={exportRevenue}>
              <Download size={16} aria-hidden="true" />
              Export
            </AdminButton>
          )}
        </div>
      </header>
      <p className="admin-dashboard-visually-hidden" role="status">{exportNotice.status === 'success' ? exportNotice.message : ''}</p>
      {exportNotice.status === 'error' && <p className="admin-dashboard-export-error" role="alert">{exportNotice.message}</p>}

      <RequestBody request={analytics} name="revenue analytics" framed>
        {(data) => {
          const summary = summarizeRevenue(data)
          return (
            <>
              <RevenueCard range={range} data={data} summary={summary} />
              <PopularProducts range={range} products={data.popularProducts} />
              <MetricCards metrics={buildMetrics(data, summary.total)} />
            </>
          )
        }}
      </RequestBody>

      <div className="admin-dashboard-lower">
        <RecentActivity request={activity} />
        <div className="admin-dashboard-aside">
          <CommunityWidgets request={community} />
        </div>
      </div>
    </section>
  )
}
