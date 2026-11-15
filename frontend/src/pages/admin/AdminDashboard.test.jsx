import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { createDefaultAdminPermissions } from '../../data/adminPermissions.js'
import { createDashboardAnalytics, createRecentActivity } from '../../data/adminDashboard.js'
import { mockPolls } from '../../data/communityPolls.js'
import { events } from '../../data/events.js'
import { products } from '../../data/products.js'
import { ADMIN_PERMISSIONS_STORAGE_KEY } from '../../services/adminPermissionService.js'
import { getCommunityOverview, getDashboardAnalytics, getRecentActivity } from '../../services/adminDashboardService.js'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import AdminDashboard from './AdminDashboard.jsx'

vi.mock('../../services/adminDashboardService.js', () => ({
  getDashboardAnalytics: vi.fn(),
  getRecentActivity: vi.fn(),
  getCommunityOverview: vi.fn(),
}))

// Saturday, 14 November 2026, 11:00 local time.
const NOW = new Date(2026, 10, 14, 11, 0)
const productNames = products.map(({ id, name }) => ({ id, name }))

function community(overrides) {
  return { polls: mockPolls, events, products: productNames, ...overrides }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

async function renderLoadedPage() {
  renderPage()
  await screen.findByRole('region', { name: 'Revenue · 7 days' })
}

function deferred() {
  const result = {}
  result.promise = new Promise((resolve, reject) => Object.assign(result, { resolve, reject }))
  return result
}

const originalUrlMethods = { createObjectURL: URL.createObjectURL, revokeObjectURL: URL.revokeObjectURL }

// jsdom cannot download files, so the object URL and the link click are replaced.
function mockDownload() {
  const createObjectURL = vi.fn(() => 'blob:instea-export')
  const revokeObjectURL = vi.fn()
  Object.assign(URL, { createObjectURL, revokeObjectURL })
  const downloads = []
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click() {
    downloads.push({ href: this.href, download: this.download })
  })
  return { createObjectURL, revokeObjectURL, downloads }
}

const exportButton = () => screen.queryByRole('button', { name: /^Export/ })
const revenueRegion = (label = '7 days') => within(screen.getByRole('region', { name: `Revenue · ${label}` }))
const metric = (name) => within(screen.getByText(name, { selector: 'dt' }).parentElement)
const selectRange = (name) => fireEvent.click(screen.getByRole('button', { name }))

function chartRows(title = 'Revenue by day') {
  const table = within(screen.getByRole('table', { name: title }))
  return table.getAllByRole('row').slice(1).map((row) => [
    within(row).getByRole('rowheader').textContent,
    within(row).getByRole('cell').textContent,
  ])
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  vi.setSystemTime(NOW)
  getDashboardAnalytics.mockImplementation((range) => Promise.resolve(createDashboardAnalytics(range)))
  getRecentActivity.mockImplementation(() => Promise.resolve(createRecentActivity()))
  getCommunityOverview.mockResolvedValue(community())
})

afterEach(() => {
  Object.assign(URL, originalUrlMethods)
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('admin dashboard overview', () => {
  it('has one Overview heading and a heading for each section', async () => {
    await renderLoadedPage()
    await screen.findByText('Upcoming events')
    expect(screen.getAllByRole('heading', { level: 1 }).map((heading) => heading.textContent)).toEqual(['Overview'])
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Revenue · 7 days',
      'Popular products',
      'Business metrics',
      'Recent activity',
      'Active polls',
      'Upcoming events',
    ])
  })

  describe('revenue analytics (7 days by default)', () => {
    it('shows the total, the change from the previous period, the order count, and the chart values', async () => {
      await renderLoadedPage()
      const revenue = revenueRegion()
      expect(revenue.getByText('$19,018')).toBeInTheDocument()
      expect(revenue.getByText('+8.4%')).toBeInTheDocument()
      expect(revenue.getByText(/vs previous period/)).not.toHaveClass('admin-dashboard-visually-hidden')
      expect(revenue.getByText('Orders · 7 days')).toBeInTheDocument()
      expect(revenue.getByText('1,462')).toBeInTheDocument()

      // Axis ticks, then the value above each bar, as in the design.
      expect(screen.getAllByText(/^[\d.]+k$/).map((label) => label.textContent))
        .toEqual(['1k', '2k', '3k', '4k', '2.4k', '2.8k', '2.3k', '3.1k', '2.7k', '2.5k', '3.2k'])
      for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) expect(screen.getByText(day)).toBeInTheDocument()
      expect(screen.getByText('Illustrative values · 7-day sample')).toBeInTheDocument()
      expect(getDashboardAnalytics).toHaveBeenCalledOnce()
      expect(getDashboardAnalytics).toHaveBeenCalledWith('7d')
    })

    it('sizes each bar against the top of the axis', async () => {
      await renderLoadedPage()
      const barFor = (label) => screen.getByText(label).nextElementSibling
      expect(barFor('3.2k')).toHaveStyle({ height: '79.9%' })
      expect(barFor('2.4k')).toHaveStyle({ height: '60.2%' })
      expect(barFor('2.3k')).toHaveStyle({ height: '57.78%' })
    })

    it('gives screen readers the same values as a labelled table', async () => {
      await renderLoadedPage()
      const chart = screen.getByRole('region', { name: 'Revenue by day' })
      expect(chart).toHaveAttribute('tabindex', '0')
      expect(chart.closest('figure')).toHaveTextContent('Revenue by day')
      expect(within(screen.getByRole('table', { name: 'Revenue by day' })).getAllByRole('columnheader').map((cell) => cell.textContent))
        .toEqual(['Period', 'Revenue'])
      expect(chartRows()).toEqual([
        ['Sun Nov 8, 2026', '$2,408'],
        ['Mon Nov 9, 2026', '$2,803'],
        ['Tue Nov 10, 2026', '$2,311'],
        ['Wed Nov 11, 2026', '$3,097'],
        ['Thu Nov 12, 2026', '$2,722'],
        ['Fri Nov 13, 2026', '$2,481'],
        ['Sat Nov 14, 2026', '$3,196'],
      ])
      // The table sits in a clipped 1px wrapper (a hidden table alone would still add scrollable height to the chart).
      expect(screen.getByRole('table', { name: 'Revenue by day' }).parentElement).toHaveClass('admin-dashboard-visually-hidden')
      // The drawn bars are hidden from assistive technology, so the values are not announced twice.
      expect(screen.getByText('3.2k').closest('[aria-hidden="true"]')).not.toBeNull()
    })

    it('offers Today, 7 days, 30 days, and Quarter as a labelled group, with 7 days pressed', async () => {
      await renderLoadedPage()
      const group = within(screen.getByRole('group', { name: 'Date range' }))
      expect(group.getAllByRole('button').map((button) => button.textContent)).toEqual(['Today', '7 days', '30 days', 'Quarter'])
      expect(group.getByRole('button', { name: '7 days' })).toHaveAttribute('aria-pressed', 'true')
      for (const name of ['Today', '30 days', 'Quarter']) expect(group.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false')
    })

    it.each([
      // range, button, total, change, orders, chart title, bar count, products, metrics: value and trend
      ['today', 'Today', '$2,709', '+4.3%', '208', 'Revenue by hour', 12,
        ['Brown Sugar Milk Tea61', 'Jasmine Green Tea52', 'Vanilla Latte38', 'Earl Grey Espresso Latte29', 'Hibiscus Rose Tisane24'],
        { 'New members': ['4', '+1'], 'Active customers': ['186', '-2.6%'], 'Leaves awarded': ['4,450', '+5%'], 'Rewards redeemed': ['9', '-2'] }],
      ['7d', '7 days', '$19,018', '+8.4%', '1,462', 'Revenue by day', 7,
        ['Brown Sugar Milk Tea412', 'Jasmine Green Tea356', 'Vanilla Latte241', 'Earl Grey Espresso Latte198', 'Hibiscus Rose Tisane176'],
        { 'New members': ['23', '+5'], 'Active customers': ['1,412', '-2.1%'], 'Leaves awarded': ['31,280', '+9%'], 'Rewards redeemed': ['64', '+14'] }],
      ['30d', '30 days', '$79,820', '+6.5%', '6,121', 'Revenue by 5-day period', 6,
        ['Brown Sugar Milk Tea1,684', 'Jasmine Green Tea1,402', 'Taro Milk Tea1,011', 'Vanilla Latte982', 'Earl Grey Espresso Latte817'],
        { 'New members': ['91', '+8'], 'Active customers': ['3,980', '+3.5%'], 'Leaves awarded': ['130,900', '+7.8%'], 'Rewards redeemed': ['262', '+21'] }],
      ['quarter', 'Quarter', '$240,834', '+5.8%', '18,480', 'Revenue by week', 13,
        ['Brown Sugar Milk Tea4,905', 'Jasmine Green Tea4,110', 'Taro Milk Tea3,284', 'Vanilla Latte2,940', 'Hibiscus Rose Tisane2,512'],
        { 'New members': ['262', '+15'], 'Active customers': ['7,640', '+3%'], 'Leaves awarded': ['395,000', '+6.2%'], 'Rewards redeemed': ['781', '+39'] }],
    ])('%s filter updates the revenue, products, and metrics', async (range, button, total, change, orders, title, bars, productRows, metrics) => {
      await renderLoadedPage()
      if (range !== '7d') {
        selectRange(button)
        expect(screen.getByText('Loading revenue analytics…')).toBeInTheDocument()
      }
      expect(await screen.findByRole('region', { name: `Revenue · ${button}` })).toBeInTheDocument()

      expect(getDashboardAnalytics).toHaveBeenLastCalledWith(range)
      expect(screen.getByRole('button', { name: button })).toHaveAttribute('aria-pressed', 'true')
      const revenue = revenueRegion(button)
      expect(revenue.getByText(total)).toBeInTheDocument()
      expect(revenue.getByText(change)).toBeInTheDocument()
      expect(revenue.getByText(`Orders · ${button}`)).toBeInTheDocument()
      expect(revenue.getByText(orders)).toBeInTheDocument()
      expect(chartRows(title)).toHaveLength(bars)

      const popular = within(screen.getByRole('region', { name: 'Popular products' }))
      expect(popular.getByText(`Quantity sold · ${button}`)).toBeInTheDocument()
      expect(popular.getAllByRole('listitem').map((item) => item.textContent)).toEqual(productRows.map((row) => `${row} sold`))

      // Revenue repeats the total; its trend is the same change as above.
      expect(metric('Revenue').getByText(total)).toBeInTheDocument()
      expect(metric('Revenue').getByText(change)).toBeInTheDocument()
      for (const [name, [value, trend]] of Object.entries(metrics)) {
        expect(metric(name).getByText(value)).toBeInTheDocument()
        expect(metric(name).getByText(trend)).toBeInTheDocument()
      }
    })

    it('shows the loading state while a new range loads, and drops the old range', async () => {
      await renderLoadedPage()
      const pending = deferred()
      getDashboardAnalytics.mockReturnValueOnce(pending.promise)
      selectRange('30 days')
      expect(screen.getByText('Loading revenue analytics…')).toBeInTheDocument()
      expect(screen.queryByText('$19,018')).not.toBeInTheDocument()
      expect(exportButton()).toBeDisabled()
      // The rest of the page keeps working.
      expect(screen.getByRole('region', { name: 'Recent activity' })).toBeInTheDocument()
    })

    it('ignores a slow response for a range that is no longer selected', async () => {
      const slow = deferred()
      const fast = deferred()
      getDashboardAnalytics
        .mockImplementationOnce(() => Promise.resolve(createDashboardAnalytics('7d')))
        .mockImplementationOnce(() => slow.promise)
        .mockImplementationOnce(() => fast.promise)
      await renderLoadedPage()
      selectRange('30 days')
      selectRange('Today')

      fast.resolve(createDashboardAnalytics('today'))
      expect(await screen.findByRole('region', { name: 'Revenue · Today' })).toBeInTheDocument()
      slow.resolve(createDashboardAnalytics('30d'))
      await Promise.resolve()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(screen.getByRole('region', { name: 'Revenue · Today' })).toBeInTheDocument()
      expect(screen.queryByText('$79,820')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('export', () => {
    async function exportedCsv(downloadMocks) {
      const blob = downloadMocks.createObjectURL.mock.calls.at(-1)[0]
      expect(blob.type).toBe('text/csv;charset=utf-8')
      return (await blob.text()).split('\r\n')
    }

    it('downloads a CSV of the chart buckets and totals for the selected range', async () => {
      const download = mockDownload()
      await renderLoadedPage()
      fireEvent.click(screen.getByRole('button', { name: 'Export revenue data as CSV' }))

      expect(download.downloads).toEqual([{ href: 'blob:instea-export', download: 'instea-revenue-7-days-2026-11-14.csv' }])
      expect(await exportedCsv(download)).toEqual([
        'INSTEA revenue export',
        'Range,7 days',
        'Report date,2026-11-14',
        '',
        'Period,Revenue (USD)',
        '"Sun Nov 8, 2026",2408.00',
        '"Mon Nov 9, 2026",2803.00',
        '"Tue Nov 10, 2026",2311.00',
        '"Wed Nov 11, 2026",3097.00',
        '"Thu Nov 12, 2026",2722.00',
        '"Fri Nov 13, 2026",2481.00',
        '"Sat Nov 14, 2026",3196.00',
        '',
        'Total revenue (USD),19018.00',
        'Previous period revenue (USD),17544.00',
        'Change vs previous period (%),8.4',
        'Orders,1462',
        '',
      ])
      expect(screen.getByText('Exported instea-revenue-7-days-2026-11-14.csv')).toBeInTheDocument()
      await vi.waitFor(() => expect(download.revokeObjectURL).toHaveBeenCalledWith('blob:instea-export'))
    })

    it('exports the same rows that the chart table shows', async () => {
      const download = mockDownload()
      await renderLoadedPage()
      selectRange('Quarter')
      await screen.findByRole('region', { name: 'Revenue · Quarter' })
      fireEvent.click(exportButton())

      const rows = await exportedCsv(download)
      const bucketRows = rows.slice(5, rows.indexOf('', 5))
      const shown = chartRows('Revenue by week')
      expect(bucketRows).toHaveLength(13)
      expect(bucketRows.map((row) => row.replace(/^"?(.*?)"?,(\d+)\.00$/, '$1|$2')))
        .toEqual(shown.map(([period, amount]) => `${period}|${amount.replace(/[$,]/g, '')}`))
      expect(download.downloads[0].download).toBe('instea-revenue-quarter-2026-11-14.csv')
      expect(rows).toContain('Total revenue (USD),240834.00')
      expect(rows).toContain('Change vs previous period (%),5.8')
      expect(rows).toContain('Orders,18480')
    })

    it.each([
      ['Today', 'today', 12, '2709.00', '4.3', '208'],
      ['30 days', '30-days', 6, '79820.00', '6.5', '6121'],
    ])('exports the %s range, not the default one', async (button, slug, bucketCount, total, change, orders) => {
      const download = mockDownload()
      await renderLoadedPage()
      selectRange(button)
      await screen.findByRole('region', { name: `Revenue · ${button}` })
      fireEvent.click(exportButton())

      const rows = await exportedCsv(download)
      expect(download.downloads[0].download).toBe(`instea-revenue-${slug}-2026-11-14.csv`)
      expect(rows[1]).toBe(`Range,${button}`)
      expect(rows.indexOf('', 5) - 5).toBe(bucketCount)
      expect(rows).toContain(`Total revenue (USD),${total}`)
      expect(rows).toContain(`Change vs previous period (%),${change}`)
      expect(rows).toContain(`Orders,${orders}`)
    })

    it('is disabled while data is loading or unavailable and cannot download', async () => {
      const download = mockDownload()
      getDashboardAnalytics.mockReturnValue(new Promise(() => {}))
      renderPage()
      expect(exportButton()).toBeDisabled()
      fireEvent.click(exportButton())
      expect(download.createObjectURL).not.toHaveBeenCalled()
    })

    it('is disabled when there is no revenue data to export', async () => {
      getDashboardAnalytics.mockResolvedValue({ buckets: [], previousRevenue: 100, orders: 4 })
      renderPage()
      await screen.findByText('No revenue recorded for this period.')
      expect(exportButton()).toBeDisabled()
    })

    it('is hidden without the Reports & exports permission and returns when it is granted', async () => {
      await renderLoadedPage()
      expect(exportButton()).toBeEnabled()
      const role = screen.getByRole('combobox', { name: 'Preview role' })

      // Staff can see the dashboard but have no reports.view.
      fireEvent.change(role, { target: { value: 'staff' } })
      expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
      expect(screen.getByText('$19,018', { selector: 'p' })).toBeInTheDocument()
      expect(exportButton()).not.toBeInTheDocument()
      expect(screen.queryByText(/Export/)).not.toBeInTheDocument()

      fireEvent.change(role, { target: { value: 'manager' } })
      expect(exportButton()).toBeEnabled()
    })

    it('follows the saved permission matrix, even for Administrators', async () => {
      const permissions = createDefaultAdminPermissions()
      permissions.administrator['reports.view'] = false
      localStorage.setItem(ADMIN_PERMISSIONS_STORAGE_KEY, JSON.stringify({ version: 1, permissions }))
      await renderLoadedPage()
      expect(exportButton()).not.toBeInTheDocument()
    })

    it('tells the user when the file cannot be created', async () => {
      const download = mockDownload()
      download.createObjectURL.mockImplementation(() => { throw new Error('no blobs') })
      await renderLoadedPage()
      fireEvent.click(exportButton())
      expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t export the revenue data. Please try again.')
      expect(download.downloads).toEqual([])

      // Changing the range clears the old message.
      selectRange('Today')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('popular products', () => {
    it('sizes each progress bar against the top seller', async () => {
      await renderLoadedPage()
      const items = within(screen.getByRole('region', { name: 'Popular products' })).getAllByRole('listitem')
      const widths = items.map((item) => item.querySelector('.admin-dashboard-fill').style.width)
      expect(widths).toEqual(['100%', '86.41%', '58.5%', '48.06%', '42.72%'])
      // The bars repeat the quantities, so they are hidden from assistive technology.
      expect(items[0].querySelector('.admin-dashboard-track')).toHaveAttribute('aria-hidden', 'true')
    })

    it('ranks by quantity whatever order the data arrives in, and shows five', async () => {
      const data = createDashboardAnalytics('7d')
      data.popularProducts = [
        { productId: 'a', name: 'Alpha', quantity: 10 },
        { productId: 'f', name: 'Foxtrot', quantity: 50 },
        { productId: 'b', name: 'Bravo', quantity: 10 },
        { productId: 'c', name: 'Charlie', quantity: 25 },
        { productId: 'd', name: 'Delta', quantity: 5 },
        { productId: 'e', name: 'Echo', quantity: 1 },
      ]
      getDashboardAnalytics.mockResolvedValue(data)
      await renderLoadedPage()
      const items = within(screen.getByRole('region', { name: 'Popular products' })).getAllByRole('listitem')
      expect(items.map((item) => item.textContent)).toEqual(['Foxtrot50 sold', 'Charlie25 sold', 'Alpha10 sold', 'Bravo10 sold', 'Delta5 sold'])
      expect(items.map((item) => item.querySelector('.admin-dashboard-fill').style.width)).toEqual(['100%', '50%', '20%', '20%', '10%'])
    })

    it('shows an empty message, and zero sales draw empty bars', async () => {
      const data = createDashboardAnalytics('7d')
      data.popularProducts = []
      getDashboardAnalytics.mockResolvedValueOnce(data)
      await renderLoadedPage()
      expect(within(screen.getByRole('region', { name: 'Popular products' })).getByText('No product sales recorded for this period.')).toBeInTheDocument()

      data.popularProducts = [{ productId: 'a', name: 'Alpha', quantity: 0 }]
      getDashboardAnalytics.mockResolvedValueOnce(data)
      selectRange('Today')
      const item = (await screen.findByText('Alpha')).closest('li')
      expect(item.querySelector('.admin-dashboard-fill').style.width).toBe('0%')
    })
  })

  describe('business metrics', () => {
    it('shows the five metric cards in order', async () => {
      await renderLoadedPage()
      const cards = within(screen.getByRole('region', { name: 'Business metrics' }))
      expect(cards.getAllByRole('term').map((term) => term.textContent))
        .toEqual(['Revenue', 'New members', 'Active customers', 'Leaves awarded', 'Rewards redeemed'])
    })

    it('marks rises and falls with an arrow, a sign, and words as well as colour', async () => {
      await renderLoadedPage()
      const rise = metric('New members')
      expect(rise.getByText('+5')).toBeInTheDocument()
      expect(rise.getByText('Up', { exact: false })).toHaveClass('admin-dashboard-visually-hidden')
      expect(rise.getByText(/vs previous period/)).toHaveClass('admin-dashboard-visually-hidden')
      expect(rise.getByText('+5').closest('p')).toHaveClass('admin-dashboard-trend--up')
      expect(rise.getByText('+5').closest('p')).toHaveTextContent('Up +5 vs previous period')
      expect(rise.getByText('+5').closest('p').querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

      const fall = metric('Active customers')
      expect(fall.getByText('-2.1%').closest('p')).toHaveClass('admin-dashboard-trend--down')
      expect(fall.getByText('-2.1%').closest('p')).toHaveTextContent('Down -2.1% vs previous period')
      expect(fall.getByText('-2.1%').closest('p').querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('shows no change and missing comparisons in words', async () => {
      const data = createDashboardAnalytics('7d')
      data.metrics.newMembers = { current: 8, previous: 8 }
      data.metrics.activeCustomers = { current: 40, previous: 0 }
      delete data.metrics.leavesAwarded
      data.metrics.rewardsRedeemed = { current: 3, previous: null }
      getDashboardAnalytics.mockResolvedValue(data)
      await renderLoadedPage()

      expect(metric('New members').getByText('0').closest('p')).toHaveTextContent('No change 0 vs previous period')
      expect(metric('New members').getByText('0').closest('p')).toHaveClass('admin-dashboard-trend--flat')
      expect(metric('Active customers').getByText('40')).toBeInTheDocument()
      expect(metric('Active customers').getByText('No comparison available')).toBeInTheDocument()
      expect(metric('Leaves awarded').getByText('—')).toBeInTheDocument()
      expect(metric('Leaves awarded').getByText('No comparison available')).toBeInTheDocument()
      expect(metric('Rewards redeemed').getByText('3')).toBeInTheDocument()
      expect(metric('Rewards redeemed').getByText('No comparison available')).toBeInTheDocument()
    })

    it('derives the change from the totals rather than from fixed text', async () => {
      const data = createDashboardAnalytics('7d')
      data.buckets = data.buckets.map((bucket) => ({ ...bucket, revenue: 100 }))
      data.previousRevenue = 1000
      getDashboardAnalytics.mockResolvedValue(data)
      await renderLoadedPage()
      expect(revenueRegion().getByText('$700')).toBeInTheDocument()
      expect(revenueRegion().getByText('-30%')).toBeInTheDocument()
      expect(metric('Revenue').getByText('$700')).toBeInTheDocument()
      expect(metric('Revenue').getByText('-30%')).toBeInTheDocument()
    })
  })

  describe('recent activity', () => {
    const at = (...args) => new Date(...args).toISOString()
    const activityItems = () => within(screen.getByRole('region', { name: 'Recent activity' })).findAllByRole('listitem')

    it('shows who did what and when, labelled against the current date', async () => {
      getRecentActivity.mockResolvedValue([
        { id: 'a', actor: 'Mei Chen', role: 'Manager', description: 'Marked Taro Milk Tea as sold out', timestamp: at(2026, 10, 14, 9, 42) },
        { id: 'b', actor: 'System', description: 'Square sync completed · 208 orders', timestamp: at(2026, 10, 14, 9, 30) },
        { id: 'c', actor: 'Leo Park', role: 'Admin', description: 'Published poll “Winter seasonal vote”', timestamp: at(2026, 10, 13, 16, 20) },
        { id: 'd', actor: 'Mei Chen', role: 'Manager', description: 'Refunded order ord-1001 · $6.80', timestamp: at(2026, 10, 9, 11, 5) },
        { id: 'e', actor: 'Leo Park', role: 'Admin', description: 'Adjusted +50 leaves', timestamp: at(2025, 11, 30, 8, 0) },
      ])
      await renderLoadedPage()
      const items = await activityItems()
      expect(items.map((item) => item.textContent)).toEqual([
        'Mei Chen (Manager) — Marked Taro Milk Tea as sold out9:42 AM',
        'System — Square sync completed · 208 orders9:30 AM',
        'Leo Park (Admin) — Published poll “Winter seasonal vote”Yesterday',
        'Mei Chen (Manager) — Refunded order ord-1001 · $6.80Nov 9',
        'Leo Park (Admin) — Adjusted +50 leavesDec 30, 2025',
      ])
      expect(within(items[0]).getByText('9:42 AM')).toHaveAttribute('datetime', at(2026, 10, 14, 9, 42))
      expect(within(items[0]).getByText('Mei Chen (Manager)').tagName).toBe('STRONG')
      expect(within(items[1]).getByText('System').tagName).toBe('STRONG')
    })

    it('uses the clock at the time the page was opened', async () => {
      vi.setSystemTime(new Date(2026, 10, 15, 8, 0))
      await renderLoadedPage()
      const items = await activityItems()
      // The sample feed is built from the same clock: 18, 30, and 65 minutes ago, then yesterday.
      expect(items.map((item) => item.querySelector('time').textContent)).toEqual(['7:42 AM', '7:30 AM', '6:55 AM', 'Yesterday', 'Yesterday'])
    })

    it('lists the newest five, newest first', async () => {
      getRecentActivity.mockResolvedValue(Array.from({ length: 8 }, (_, index) => ({
        id: `item-${index}`,
        actor: 'System',
        description: `Event ${index}`,
        timestamp: at(2026, 10, 14, index + 1, 0),
      })))
      await renderLoadedPage()
      const items = await activityItems()
      expect(items.map((item) => item.querySelector('time').textContent)).toEqual(['8:00 AM', '7:00 AM', '6:00 AM', '5:00 AM', '4:00 AM'])
    })

    it('copes with an item that has no usable timestamp', async () => {
      getRecentActivity.mockResolvedValue([{ id: 'x', actor: 'System', description: 'Cache cleared', timestamp: 'garbage' }])
      await renderLoadedPage()
      const [item] = await activityItems()
      expect(item).toHaveTextContent('System — Cache clearedTime unavailable')
      expect(item.querySelector('time')).toBeNull()
    })

    it('shows an empty message', async () => {
      getRecentActivity.mockResolvedValue([])
      await renderLoadedPage()
      expect(await screen.findByText('No recent activity.')).toBeInTheDocument()
    })
  })

  describe('active poll', () => {
    it('shows the poll title, its votes, and the time left', async () => {
      vi.setSystemTime(new Date(2026, 11, 6, 11, 0))
      getCommunityOverview.mockResolvedValue(community({ polls: [{ ...mockPolls[0], voteCount: 2516 }] }))
      await renderLoadedPage()
      const widget = within(await screen.findByRole('region', { name: 'Active poll' }))
      expect(widget.getByRole('heading', { level: 3, name: 'Which blend should join the winter menu?' })).toBeInTheDocument()
      expect(widget.getByText('2,516 votes · Closes in 4 days')).toBeInTheDocument()
    })

    it('shows every open poll, reading the same saved data as the Community pages', async () => {
      getCommunityOverview.mockResolvedValue(community({
        polls: [
          { ...mockPolls[0], status: 'replaced' },
          { ...mockPolls[0], id: 'u1', title: 'Spring blend', question: 'Which spring blend?', voteCount: 1 },
          { ...mockPolls[1], id: 'u2', productId: 'prod-taro-milk-tea', voteCount: 12 },
        ],
      }))
      await renderLoadedPage()
      const widget = within(await screen.findByRole('region', { name: 'Active polls' }))
      expect(widget.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent))
        .toEqual(['Keep or retire: Taro Milk Tea', 'Which spring blend?'])
      expect(widget.getByText('12 votes · Closes in 31 days')).toBeInTheDocument()
      expect(widget.getByText('1 vote · Closes in 26 days')).toBeInTheDocument()
    })

    it('says there is no active poll when none is open', async () => {
      getCommunityOverview.mockResolvedValue(community({
        polls: [
          { ...mockPolls[0], status: 'replaced' },
          { ...mockPolls[1], status: 'deleted' },
          { ...mockPolls[0], id: 3, endsAt: '2026-11-14T10:59:59' },
        ],
      }))
      await renderLoadedPage()
      const widget = within(await screen.findByRole('region', { name: 'Active poll' }))
      expect(widget.getByText('No active poll right now.')).toBeInTheDocument()
      expect(widget.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
    })

    it('treats an ended poll as no active poll', async () => {
      vi.setSystemTime(new Date(2026, 11, 16, 9, 0))
      await renderLoadedPage()
      expect(await screen.findByText('No active poll right now.')).toBeInTheDocument()
    })
  })

  describe('upcoming events', () => {
    it('lists the next three events with their dates', async () => {
      await renderLoadedPage()
      const widget = within(await screen.findByRole('region', { name: 'Upcoming events' }))
      const items = widget.getAllByRole('listitem')
      expect(items.map((item) => item.textContent)).toEqual([
        'Tea Tasting — Example EventDec 6',
        'Tea Book Club — Example EventDec 10',
        'Game Night — Example EventDec 12',
      ])
      expect(within(items[0]).getByText('Dec 6')).toHaveAttribute('datetime', '2026-12-06')
    })

    it('moves on as events pass and includes an event happening today', async () => {
      vi.setSystemTime(new Date(2026, 11, 10, 20, 0))
      await renderLoadedPage()
      const widget = within(await screen.findByRole('region', { name: 'Upcoming events' }))
      expect(widget.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
        'Tea Book Club — Example EventDec 10',
        'Game Night — Example EventDec 12',
        'Seasonal Menu — Example EventDec 15',
      ])
    })

    it('says there are no upcoming events once they have all passed', async () => {
      vi.setSystemTime(new Date(2027, 0, 1, 9, 0))
      await renderLoadedPage()
      const widget = within(await screen.findByRole('region', { name: 'Upcoming events' }))
      expect(widget.getByText('No upcoming events.')).toBeInTheDocument()
      expect(widget.queryByRole('listitem')).not.toBeInTheDocument()
    })

    it('handles an empty event list', async () => {
      getCommunityOverview.mockResolvedValue(community({ events: [], polls: [] }))
      await renderLoadedPage()
      expect(await screen.findByText('No upcoming events.')).toBeInTheDocument()
      expect(screen.getByText('No active poll right now.')).toBeInTheDocument()
    })
  })

  describe('loading and error states', () => {
    it('shows a loading message for each part of the page while data is pending', () => {
      getDashboardAnalytics.mockReturnValue(new Promise(() => {}))
      getRecentActivity.mockReturnValue(new Promise(() => {}))
      getCommunityOverview.mockReturnValue(new Promise(() => {}))
      renderPage()
      expect(screen.getAllByRole('status').map((status) => status.textContent).filter(Boolean)).toEqual([
        'Loading revenue analytics…',
        'Loading recent activity…',
        'Loading community highlights…',
      ])
      expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '7 days' })).toBeEnabled()
    })

    it('recovers from a failed analytics request with Try again', async () => {
      getDashboardAnalytics.mockRejectedValueOnce(new Error('Network error'))
      renderPage()
      expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load revenue analytics. Please try again.')
      expect(exportButton()).toBeDisabled()
      fireEvent.click(screen.getByRole('button', { name: 'Try again: revenue analytics' }))
      expect(await screen.findByRole('region', { name: 'Revenue · 7 days' })).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(getDashboardAnalytics).toHaveBeenCalledTimes(2)
      expect(getRecentActivity).toHaveBeenCalledOnce()
    })

    it('lets the filter be used again after an error', async () => {
      getDashboardAnalytics.mockRejectedValueOnce(new Error('Network error'))
      renderPage()
      await screen.findByRole('alert')
      selectRange('Today')
      expect(await screen.findByRole('region', { name: 'Revenue · Today' })).toBeInTheDocument()
    })

    it('keeps the rest of the page when only the activity feed fails', async () => {
      getRecentActivity.mockRejectedValueOnce(new Error('Network error'))
      await renderLoadedPage()
      const feed = within(screen.getByRole('region', { name: 'Recent activity' }))
      expect(await feed.findByRole('alert')).toHaveTextContent('We couldn’t load recent activity.')
      expect(screen.getAllByRole('alert')).toHaveLength(1)
      expect(screen.getByText('$19,018', { selector: 'p' })).toBeInTheDocument()
      expect(await screen.findByRole('region', { name: 'Upcoming events' })).toBeInTheDocument()

      fireEvent.click(feed.getByRole('button', { name: 'Try again: recent activity' }))
      expect(await feed.findAllByRole('listitem')).toHaveLength(5)
    })

    it('keeps the rest of the page when only the community data fails', async () => {
      getCommunityOverview.mockRejectedValueOnce(new Error('Network error'))
      await renderLoadedPage()
      expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load community highlights.')
      expect(screen.getByText('$19,018', { selector: 'p' })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Recent activity' })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Try again: community highlights' }))
      expect(await screen.findByRole('region', { name: 'Upcoming events' })).toBeInTheDocument()
    })

    it.each([
      ['a negative amount', { buckets: [{ label: 'a', period: 'a', revenue: -5 }] }],
      ['an unexpected shape', ['not', 'an', 'object']],
    ])('shows the error state for %s in the analytics response', async (_, data) => {
      getDashboardAnalytics.mockResolvedValue(data)
      renderPage()
      expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load revenue analytics.')
    })

    it('shows the error state for a malformed community response', async () => {
      getCommunityOverview.mockResolvedValue({ polls: 'nope' })
      await renderLoadedPage()
      expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load community highlights.')
    })
  })

  describe('empty data', () => {
    it.each([[null], [{}]])('does not crash on empty analytics (%j)', async (data) => {
      getDashboardAnalytics.mockResolvedValue(data)
      getRecentActivity.mockResolvedValue(null)
      getCommunityOverview.mockResolvedValue(null)
      renderPage()
      expect(await screen.findByText('No revenue recorded for this period.')).toBeInTheDocument()
      expect(screen.getByText('No product sales recorded for this period.')).toBeInTheDocument()
      expect(screen.getByText('No recent activity.')).toBeInTheDocument()
      expect(screen.getByText('No active poll right now.')).toBeInTheDocument()
      expect(screen.getByText('No upcoming events.')).toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(revenueRegion().getAllByText('—')).toHaveLength(2)
      expect(revenueRegion().getByText('No comparison available')).toBeInTheDocument()
      expect(metric('Revenue').getByText('—')).toBeInTheDocument()
      expect(exportButton()).toBeDisabled()
    })

    it('draws every bar as empty when all revenue is zero', async () => {
      const data = createDashboardAnalytics('7d')
      data.buckets = data.buckets.map((bucket) => ({ ...bucket, revenue: 0 }))
      data.previousRevenue = 0
      getDashboardAnalytics.mockResolvedValue(data)
      await renderLoadedPage()
      expect(revenueRegion().getAllByText('$0')).not.toHaveLength(0)
      expect(revenueRegion().getByText('0%')).toBeInTheDocument()
      expect(revenueRegion().getByText('No change', { exact: false })).toBeInTheDocument()
      expect(screen.getAllByText('0', { selector: '.admin-dashboard-bar-value' })).toHaveLength(7)
      expect(exportButton()).toBeEnabled()
    })
  })
})
