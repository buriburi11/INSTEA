import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { orders } from '../../data/orders.js'
import { getOrders } from '../../services/orderService.js'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import AdminOrders from './AdminOrders.jsx'

vi.mock('../../services/orderService.js', () => ({ getOrders: vi.fn() }))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/orders']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="orders" element={<AdminOrders />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getOrders.mockResolvedValue(orders)
})

describe('admin orders', () => {
  it('groups orders by status and displays identity, total, and pickup information', async () => {
    renderPage()
    await screen.findByRole('button', { name: 'View order ord-1006' })
    const newOrders = within(screen.getByRole('list', { name: 'New orders' }))
    expect(newOrders.getByText('Alex Rivera')).toBeInTheDocument()
    expect(newOrders.getByText('$13.05')).toBeInTheDocument()
    expect(newOrders.getByText('Pickup 2026-10-18 · 9:30 AM')).toBeInTheDocument()
    for (const [status, id] of [['Preparing', 'ord-1005'], ['Ready', 'ord-1004'], ['Completed', 'ord-1003']]) {
      expect(within(screen.getByRole('list', { name: `${status} orders` })).getByRole('button', { name: `View order ${id}` })).toBeInTheDocument()
    }
    const other = within(screen.getByRole('table', { name: 'Other orders' }))
    expect(other.getByText('Cancelled')).toBeInTheDocument()
    expect(other.getByText('Refunded')).toBeInTheDocument()
    expect(getOrders).toHaveBeenCalledOnce()
  })

  it('opens full order details including options, notes, and totals, and restores focus when closed', async () => {
    renderPage()
    const opener = await screen.findByRole('button', { name: 'View order ord-1005' })
    fireEvent.click(opener)
    const region = screen.getByRole('region', { name: 'Order ord-1005' })
    const detail = within(region)
    expect(region).toHaveFocus()
    expect(detail.getByText('2 × Brown Sugar Milk Tea')).toBeInTheDocument()
    expect(detail.getByText('Add-on: Tapioca pearls')).toBeInTheDocument()
    expect(detail.getByText('Item note: Light ice, please.')).toBeInTheDocument()
    expect(detail.getByText('Subtotal').nextElementSibling).toHaveTextContent('$13.00')
    expect(detail.getByText('$1.14')).toBeInTheDocument()
    expect(detail.getByText('$14.14')).toBeInTheDocument()
    expect(detail.getByRole('combobox', { name: 'Change order status' })).toBeDisabled()
    expect(detail.getByRole('combobox')).toHaveValue('preparing')
    fireEvent.click(detail.getByRole('button', { name: 'Close order details' }))
    expect(screen.queryByRole('region', { name: 'Order ord-1005' })).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  it('shows safe status-action placeholders for active orders', async () => {
    renderPage()
    expect(await screen.findByRole('button', { name: 'Accept' })).toBeDisabled()
    for (const name of ['Mark ready', 'Complete', 'Cancel order ord-1006']) {
      expect(screen.getByRole('button', { name })).toBeDisabled()
    }
    expect(screen.getByText(/Status changes are not available in this preview. Select an order/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }))
    expect(within(screen.getByRole('list', { name: 'New orders' })).getByText('ord-1006')).toBeInTheDocument()
  })

  it('searches by order number and customer name without keeping stale details', async () => {
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'View order ord-1006' }))
    const search = screen.getByRole('searchbox', { name: 'Search orders' })
    fireEvent.change(search, { target: { value: '  JORDAN KIM  ' } })
    expect(screen.getByRole('button', { name: 'View order ord-1005' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View order ord-1001' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View order ord-1006' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Order ord-1006' })).not.toBeInTheDocument()
    fireEvent.change(search, { target: { value: '1004' } })
    expect(screen.getByRole('button', { name: 'View order ord-1004' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View order ord-1005' })).not.toBeInTheDocument()
  })

  it('handles an empty search and lets the administrator clear it', async () => {
    renderPage()
    await screen.findByRole('button', { name: 'View order ord-1006' })
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'no-such-order' } })
    expect(screen.getByRole('status')).toHaveTextContent('No orders match your search.')
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.getByRole('button', { name: 'View order ord-1006' })).toBeInTheDocument()
  })

  it.each([{ data: [] }, { data: null }])('shows an empty-order state for $data', async ({ data }) => {
    getOrders.mockResolvedValue(data)
    renderPage()
    expect(await screen.findByText('No orders yet.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /View order/ })).not.toBeInTheDocument()
  })

  it('shows a loading state while order information is pending', () => {
    getOrders.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status')).toHaveTextContent('Loading orders…')
    expect(screen.getByRole('searchbox')).toBeDisabled()
  })

  it('recovers from a failed request with retry', async () => {
    getOrders.mockRejectedValueOnce(new Error('Network error'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load orders.')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('button', { name: 'View order ord-1006' })).toBeInTheDocument()
    expect(getOrders).toHaveBeenCalledTimes(2)
  })

  it('keeps unknown statuses visible and safely formats missing data and zero totals', async () => {
    getOrders.mockResolvedValue([{ id: 'ord-unknown', status: 'unknown', items: [], total: 0 }])
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'View order ord-unknown' }))
    const detail = within(screen.getByRole('region', { name: 'Order ord-unknown' }))
    expect(detail.getByText('$0.00')).toBeInTheDocument()
    expect(detail.getByText('Date unavailable · Time unavailable')).toBeInTheDocument()
    expect(detail.getByText('No item information available.')).toBeInTheDocument()
    expect(detail.getByRole('combobox')).toHaveValue('unknown')
  })

  it('shows an error for a malformed service response', async () => {
    getOrders.mockResolvedValue({ unexpected: true })
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load orders.')
  })
})
