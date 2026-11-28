import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../App.jsx'
import { AuthContext } from '../../auth/AuthContext.js'
import { NotificationContext } from '../../notifications/NotificationContext.js'

it('renders the signed-in rewards route within a single main landmark', () => {
  const customer = {
    id: 'cust-alex-rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    memberNumber: 'INS-100001',
    membershipTier: 'gold',
    rewardLeaves: 820,
  }

  render(
    <MemoryRouter initialEntries={['/rewards']}>
      <AuthContext.Provider value={{ customer, isAuthenticated: true }}>
        <NotificationContext.Provider value={{ unreadCount: 0 }}>
          <App />
        </NotificationContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>,
  )

  const main = screen.getByRole('main')
  expect(main).toHaveAttribute('id', 'main-content')
  expect(main).toContainElement(screen.getByRole('heading', { name: 'Alex Rivera' }))
})
