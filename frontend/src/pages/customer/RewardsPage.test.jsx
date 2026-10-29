import { render, screen } from '@testing-library/react'
import { AuthContext } from '../../auth/AuthContext.js'
import RewardsPage from './RewardsPage.jsx'

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

})
