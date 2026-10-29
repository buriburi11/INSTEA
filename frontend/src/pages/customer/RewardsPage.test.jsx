import { fireEvent, render, screen } from '@testing-library/react'
import { AuthContext } from '../../auth/AuthContext.js'
import RewardsPage from './RewardsPage.jsx'

// Renders the page with a fake logged-in customer instead of going through AuthProvider.
// Note: the balance shown comes from PLACEHOLDER_LEAVES_BALANCE, not `rewardLeaves`.
function renderWithLeaves(rewardLeaves) {
  const customer = {
    id: 'cust-alex-rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    memberNumber: 'INS-100001',
    membershipTier: 'gold',
    rewardLeaves,
  }

  return render(
    <AuthContext.Provider value={{ customer }}>
      <RewardsPage />
    </AuthContext.Provider>,
  )
}

describe('RewardsPage', () => {
  // Balance is the 1,125 placeholder in RewardsPage.jsx until the real balance lands.
  it('locks rewards that cost more than the balance', () => {
    renderWithLeaves(820)
    expect(screen.getByRole('button', { name: 'Redeem Reserve Tasting Flight' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Redeem Ceremonial Kyusu Teapot' })).toBeDisabled()
    expect(screen.getByText('875 more leaves to unlock')).toBeInTheDocument()
  })

  it('shows progress toward the next milestone', () => {
    renderWithLeaves(820)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '94')
    expect(screen.getByText('75 leaves away from your next complimentary drink')).toBeInTheDocument()
  })

  it('loads the customer leaves history from the service', async () => {
    renderWithLeaves(820)
    fireEvent.click(screen.getByRole('button', { name: 'Leaves history' }))
    expect(await screen.findByText('Cloud Matcha Voucher')).toBeInTheDocument()
  })
})
