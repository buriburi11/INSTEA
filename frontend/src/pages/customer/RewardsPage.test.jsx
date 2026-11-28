import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../App.jsx'
import { AuthContext } from '../../auth/AuthContext.js'
import { NotificationContext } from '../../notifications/NotificationContext.js'
import RewardsPage from './RewardsPage.jsx'
import { mockStreakSummary } from '../../data/checkIns.js'

function renderWithLeaves(rewardLeaves, children = <RewardsPage />) {
  const customer = {
    id: 'cust-alex-rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    memberNumber: 'INS-100001',
    membershipTier: 'gold',
    rewardLeaves,
  }

  return render(
    <AuthContext.Provider value={{ customer, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>,
  )
}

describe('RewardsPage', () => {
  it('renders the signed-in rewards route within a single main landmark', () => {
    renderWithLeaves(820, (
      <NotificationContext.Provider value={{ unreadCount: 0 }}>
        <MemoryRouter initialEntries={['/rewards']}>
          <App />
        </MemoryRouter>
      </NotificationContext.Provider>
    ))

    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-content')
    expect(main).toContainElement(screen.getByRole('heading', { name: 'Alex Rivera' }))
  })

  it.each([0, 1, 4])('displays the mock streak of %s weeks consistently across the dashboard', (streak) => {
    const originalStreak = mockStreakSummary.currentStreak
    mockStreakSummary.currentStreak = streak

    try {
      renderWithLeaves(820)
      expect(screen.getByText(`${streak}-week streak`)).toBeInTheDocument()
      expect(screen.getByText('Consecutive calendar weeks with a qualifying purchase or check-in.')).toBeInTheDocument()
      if (streak === 0) {
        expect(screen.getByText('No current streak. Make a qualifying purchase or check-in to start your first week.')).toBeInTheDocument()
        expect(screen.queryByText('Complete')).not.toBeInTheDocument()
      }

      fireEvent.click(screen.getByRole('button', { name: 'Check-ins & streaks' }))
      expect(screen.getByText('Current').parentElement).toHaveTextContent(`${streak} ${streak === 1 ? 'week' : 'weeks'}`)
      expect(screen.getByText(/Your current streak counts consecutive calendar weeks/)).toBeInTheDocument()
      if (streak === 0) {
        expect(screen.queryByText(/Your current streak started/)).not.toBeInTheDocument()
      }
    } finally {
      mockStreakSummary.currentStreak = originalStreak
    }
  })

  it('locks rewards that cost more than the balance', () => {
    renderWithLeaves(820)
    expect(screen.getByRole('button', { name: 'Redeem Any Handcrafted Drink' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Redeem Reserve Tasting Flight' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Redeem Ceremonial Kyusu Teapot' })).toBeDisabled()
    expect(screen.getByText('180 more leaves to unlock')).toBeInTheDocument()
  })

  it('shows progress toward the next milestone', () => {
    renderWithLeaves(820)
    expect(screen.getByRole('status', { name: 'Current Tea Leaves balance' })).toHaveTextContent('820 Tea Leaves')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '68')
    expect(screen.getByText('380 leaves away from your next complimentary drink')).toBeInTheDocument()
  })

  it('displays zero points without treating them as unavailable', () => {
    renderWithLeaves(0)
    expect(screen.getByRole('status', { name: 'Current Tea Leaves balance' })).toHaveTextContent('0 Tea Leaves')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByRole('button', { name: 'Redeem Plant Milk Upgrade' })).toBeDisabled()
  })

  it.each([undefined, null, '820', -1, NaN, Infinity, {}])(
    'handles an unavailable or invalid point balance: %s',
    (balance) => {
      renderWithLeaves(balance)
      expect(screen.getByRole('status', { name: 'Current Tea Leaves balance' })).toHaveTextContent('Unavailable')
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Redeem Plant Milk Upgrade' })).toBeDisabled()
    },
  )

  it('keeps leaves history usable when the point balance is unavailable', async () => {
    renderWithLeaves(null)
    fireEvent.click(screen.getByRole('button', { name: 'Leaves history' }))
    expect(await screen.findByText('Cloud Matcha Voucher')).toBeInTheDocument()
    expect(screen.getByText('Available').nextElementSibling).toHaveTextContent('Unavailable')
  })

  it('loads the customer leaves history from the service', async () => {
    renderWithLeaves(820)
    fireEvent.click(screen.getByRole('button', { name: 'Leaves history' }))
    expect(await screen.findByText('Cloud Matcha Voucher')).toBeInTheDocument()
  })

  it('loads the customer stamp cards and stamp history', async () => {
    renderWithLeaves(820)
    fireEvent.click(screen.getByRole('button', { name: 'Stamp cards' }))
    expect(await screen.findByText('Milk Tea Ritual')).toBeInTheDocument()
    expect(screen.getAllByText('+1 stamp')).toHaveLength(3)
  })
})
