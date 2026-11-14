import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthContext } from '../../auth/AuthContext.js'
import { getOrdersByCustomer } from '../../services/orderService.js'
import OrderHistoryPage from './OrderHistoryPage.jsx'

// Alex has two mock orders in src/data/orders.js: ord-1006 (online, new) and ord-1003 (in-store, completed).
const alex = { id: 'cust-alex-rivera', firstName: 'Alex' }
const newCustomer = { id: 'cust-brand-new', firstName: 'Casey' }

function renderHistory(customer = alex) {
  return render(
    <AuthContext.Provider value={{ customer }}>
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:orderId" element={<p>Order detail page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

const cards = () => screen.getAllByRole('listitem')

describe('getOrdersByCustomer', () => {
  it("returns only that customer's orders, newest first", async () => {
    const orders = await getOrdersByCustomer('cust-alex-rivera')
    expect(orders.map((o) => o.id)).toEqual(['ord-1006', 'ord-1003'])
  })

  it('returns an empty list for a customer with no orders', async () => {
    expect(await getOrdersByCustomer('cust-brand-new')).toEqual([])
  })
})

describe('OrderHistoryPage', () => {
  it('shows multiple orders, newest first', async () => {
    renderHistory()
    expect(await screen.findByText('Order #1006')).toBeInTheDocument()
    expect(cards()).toHaveLength(2)
    expect(within(cards()[0]).getByText('Order #1006')).toBeInTheDocument()
    expect(within(cards()[1]).getByText('Order #1003')).toBeInTheDocument()
  })

  it('shows the date, total, and status for each order', async () => {
    renderHistory()
    const completed = within((await screen.findAllByRole('listitem'))[1])
    expect(completed.getByText('Oct 12, 2026 · 1:45 PM · In-store · INSTEA Downtown')).toBeInTheDocument()
    expect(completed.getByText('$13.32')).toBeInTheDocument()
    expect(completed.getByText('Completed')).toBeInTheDocument()
  })

  it('shows leaves earned for completed orders', async () => {
    renderHistory()
    const completed = within((await screen.findAllByRole('listitem'))[1])
    expect(completed.getByText(/^\+\d+ leaves$/)).toBeInTheDocument()
  })

  it('links each order to its details', async () => {
    renderHistory()
    fireEvent.click(await screen.findByRole('link', { name: 'View receipt for order #1006' }))
    expect(screen.getByText('Order detail page')).toBeInTheDocument()
  })

  it('filters online and in-store orders', async () => {
    renderHistory()
    await screen.findByText('Order #1006')

    fireEvent.click(screen.getByRole('button', { name: 'In-store' }))
    expect(cards()).toHaveLength(1)
    expect(screen.getByText('Order #1003')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Online' }))
    expect(cards()).toHaveLength(1)
    expect(screen.getByText('Order #1006')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(cards()).toHaveLength(2)
  })

  it('shows placeholders for reorder and report an issue', async () => {
    renderHistory()
    fireEvent.click(await screen.findByRole('button', { name: 'Reorder order #1006' }))
    expect(screen.getByRole('status')).toHaveTextContent('Reorder is coming soon.')
  })

  it('shows an empty state when there are no orders', async () => {
    renderHistory(newCustomer)
    expect(await screen.findByRole('heading', { name: 'No orders yet' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse the menu' })).toHaveAttribute('href', '/menu')
  })
})
