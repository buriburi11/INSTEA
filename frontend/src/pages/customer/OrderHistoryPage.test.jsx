import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import AuthProvider from '../../auth/AuthProvider.jsx'
import { customers } from '../../data/customers.js'
import OrderHistoryPage from './OrderHistoryPage.jsx'

function renderOrderHistory() {
  localStorage.setItem(
    'instea.mockCustomer',
    JSON.stringify(customers[0]),
  )

  return render(
    <MemoryRouter>
      <AuthProvider>
        <OrderHistoryPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('OrderHistoryPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('displays the member orders', () => {
    renderOrderHistory()

    expect(screen.getByText('Order #1006')).toBeInTheDocument()
    expect(screen.getByText('Order #1003')).toBeInTheDocument()
  })

  test('filters in-store orders', async () => {
    const user = userEvent.setup()

    renderOrderHistory()

    await user.click(
      screen.getByRole('button', { name: 'In-store' }),
    )

    expect(screen.getByText('Order #1003')).toBeInTheDocument()
    expect(
      screen.queryByText('Order #1006'),
    ).not.toBeInTheDocument()
  })

  test('opens an order receipt', async () => {
    const user = userEvent.setup()

    renderOrderHistory()

    const receiptButtons = screen.getAllByRole('button', {
      name: 'View receipt',
    })

    await user.click(receiptButtons[0])

    expect(
      screen.getByRole('dialog'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('INSTEA receipt'),
    ).toBeInTheDocument()
  })

  test('displays mock issue-reporting feedback', async () => {
    const user = userEvent.setup()

    renderOrderHistory()

    const reportButtons = screen.getAllByRole('button', {
      name: 'Report an issue',
    })

    await user.click(reportButtons[0])

    expect(
      screen.getByText(/Customer support is not connected yet/),
    ).toBeInTheDocument()
  })
})