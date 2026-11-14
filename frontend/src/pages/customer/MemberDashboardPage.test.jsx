import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import AuthProvider from '../../auth/AuthProvider.jsx'
import { customers } from '../../data/customers.js'
import MemberDashboardPage from './MemberDashboardPage.jsx'

function renderDashboard() {
  localStorage.setItem(
    'instea.mockCustomer',
    JSON.stringify(customers[0]),
  )

  return render(
    <MemoryRouter>
      <AuthProvider>
        <MemberDashboardPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('MemberDashboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('displays the member loyalty overview', () => {
    renderDashboard()

    expect(screen.getByText('820')).toBeInTheDocument()
    expect(screen.getByText('Tea Leaves')).toBeInTheDocument()
    expect(screen.getByText('68% complete')).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'Show Member QR Code',
      }),
    ).toHaveAttribute('href', '/member-card')
  })

  test('displays usual order and loyalty activity', () => {
    renderDashboard()

    expect(
      screen.getAllByText('Earl Grey Espresso Latte').length,
    ).toBeGreaterThan(0)

    expect(
      screen.getByText('Weekly Tea Streak'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Milk Tea Ritual'),
    ).toBeInTheDocument()
  })

  test('displays community and recent-order widgets', () => {
    renderDashboard()

    expect(
      screen.getByText(
        'Which blend should join the winter menu?',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Tea Tasting/),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'All →' }),
    ).toHaveAttribute('href', '/orders')
  })
})