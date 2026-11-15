import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthContext } from '../../auth/AuthContext.js'
import ShoppingCart from '../ShoppingCart.jsx'
import OrderHistoryPage from './OrderHistoryPage.jsx'

// INST-70: Reorder on the order history list, through to the cart page.
const alex = { id: 'cust-alex-rivera', firstName: 'Alex' }

function renderApp() {
  return render(
    <AuthContext.Provider value={{ customer: alex, isAuthenticated: true }}>
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/cart" element={<ShoppingCart />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

const savedCart = () => JSON.parse(localStorage.getItem('instea-cart') || '[]')

beforeEach(() => localStorage.clear())

describe('Reorder', () => {
  it('fills the cart with the order and opens the cart page', async () => {
    renderApp()
    fireEvent.click(await screen.findByRole('button', { name: 'Reorder order #1006' }))

    expect(await screen.findByRole('heading', { name: 'Your cart' })).toBeInTheDocument()
    expect(screen.getByText(/Items from order #1006 were added to your cart/)).toBeInTheDocument()
    expect(savedCart().map((item) => item.name)).toEqual(['Earl Grey Espresso Latte', 'Jasmine Green Tea'])
  })

  it('shows unavailable items on the cart page', async () => {
    renderApp()
    fireEvent.click(await screen.findByRole('button', { name: 'Reorder order #1000' }))

    expect(await screen.findByText('Taro Milk Tea')).toBeInTheDocument()
    expect(screen.getByText(/Currently unavailable and not added/)).toBeInTheDocument()
    expect(savedCart().map((item) => item.name)).toEqual(['Jasmine Green Tea'])
  })

  it('asks before replacing items already in the cart', async () => {
    localStorage.setItem('instea-cart', JSON.stringify([{ name: 'Vanilla Latte', quantity: 2 }]))
    renderApp()
    fireEvent.click(await screen.findByRole('button', { name: 'Reorder order #1003' }))

    expect(await screen.findByText('Your cart has 2 items. Replace them with this order?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Replace cart' }))

    expect(await screen.findByRole('heading', { name: 'Your cart' })).toBeInTheDocument()
    expect(savedCart().map((item) => item.name)).toEqual(['Hibiscus Rose Tisane', 'Brown Sugar Milk Tea'])
  })

  it('keeps the existing cart if the customer cancels', async () => {
    localStorage.setItem('instea-cart', JSON.stringify([{ name: 'Vanilla Latte', quantity: 1 }]))
    renderApp()
    fireEvent.click(await screen.findByRole('button', { name: 'Reorder order #1003' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Keep my cart' }))

    expect(screen.queryByText(/Replace it with this order/)).not.toBeInTheDocument()
    expect(savedCart()).toEqual([{ name: 'Vanilla Latte', quantity: 1 }])
  })

  it('lets the customer edit the reordered cart', async () => {
    renderApp()
    fireEvent.click(await screen.findByRole('button', { name: 'Reorder order #1006' }))
    await screen.findByRole('heading', { name: 'Your cart' })

    // The cart page's own controls work on reordered items.
    fireEvent.click(screen.getAllByRole('button', { name: /remove/i })[0])
    expect(savedCart().map((item) => item.name)).toEqual(['Jasmine Green Tea'])
  })
})
