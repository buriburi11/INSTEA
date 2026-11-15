import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthContext } from '../../auth/AuthContext.js'
import OrderDetailPage from './OrderDetailPage.jsx'

// Mock orders in src/data/orders.js:
// ord-1003: Alex, completed, in-store, Large Hibiscus Rose Tisane + Large Brown Sugar Milk Tea (almond)
// ord-1006: Alex, new, online
// ord-1005: Jordan, 2 × Brown Sugar Milk Tea with tapioca pearls and a note
const alex = { id: 'cust-alex-rivera', firstName: 'Alex' }
const jordan = { id: 'cust-jordan-kim', firstName: 'Jordan' }

function renderDetail(orderId, customer = alex) {
  return render(
    <AuthContext.Provider value={{ customer }}>
      <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

const receipt = async () => within(await screen.findByRole('complementary', { name: 'Receipt' }))

describe('OrderDetailPage', () => {
  it('shows the ordered products with quantities', async () => {
    renderDetail('ord-1003')
    const r = await receipt()
    expect(r.getByText('1 × Hibiscus Rose Tisane')).toBeInTheDocument()
    expect(r.getByText('1 × Brown Sugar Milk Tea')).toBeInTheDocument()
  })

  it('shows customizations for each product', async () => {
    renderDetail('ord-1003')
    const r = await receipt()
    expect(r.getByText('Large (16 oz) · 50% sweet · Almond milk')).toBeInTheDocument()
  })

  it('shows a quantity above one and special instructions', async () => {
    renderDetail('ord-1005', jordan)
    const r = await receipt()
    expect(r.getByText('2 × Brown Sugar Milk Tea')).toBeInTheDocument()
    expect(r.getByText('Note: Light ice, please.')).toBeInTheDocument()
  })

  it('shows the date and total', async () => {
    renderDetail('ord-1003')
    expect(await screen.findByText('Placed Oct 12, 2026 · 1:45 PM · In-store')).toBeInTheDocument()
    const r = await receipt()
    expect(r.getByText('Total paid')).toBeInTheDocument()
    expect(r.getByText('$13.32')).toBeInTheDocument()
  })

  it('shows the order status', async () => {
    renderDetail('ord-1003')
    expect(await screen.findByRole('heading', { name: 'Completed' })).toBeInTheDocument()
  })

  it('shows loyalty leaves earned for a completed order', async () => {
    renderDetail('ord-1003')
    expect(await screen.findByText('Tea Leaves earned')).toBeInTheDocument()
  })

  it('shows leaves as pending for an order in progress', async () => {
    renderDetail('ord-1006')
    expect(await screen.findByText('Tea Leaves pending')).toBeInTheDocument()
  })

  it("does not show another customer's order", async () => {
    renderDetail('ord-1005', alex)
    expect(await screen.findByText("We couldn't find that order.")).toBeInTheDocument()
  })

  it('shows not found for an unknown order', async () => {
    renderDetail('ord-9999')
    expect(await screen.findByText("We couldn't find that order.")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Back to order history/ })).toHaveAttribute('href', '/orders')
  })
})
