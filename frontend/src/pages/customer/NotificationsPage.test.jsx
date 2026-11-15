import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import NotificationProvider from '../../notifications/NotificationProvider.jsx'
import NotificationsPage from './NotificationsPage.jsx'

function renderNotifications() {
  return render(
    <MemoryRouter>
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    </MemoryRouter>,
  )
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('filters unread notifications', async () => {
    const user = userEvent.setup()

    renderNotifications()

    expect(
      screen.getByRole('button', { name: 'Unread (3)' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Unread (3)' }),
    )

    expect(
      screen.getByText('Your order is ready'),
    ).toBeInTheDocument()

    expect(
      screen.queryByText('Double Leaf Weekend'),
    ).not.toBeInTheDocument()
  })

  test('marks an individual notification as read', async () => {
    const user = userEvent.setup()

    renderNotifications()

    await user.click(
      screen.getByRole('button', {
        name: /Your order is ready.*Unread/i,
      }),
    )

    expect(
      screen.getByRole('button', { name: 'Unread (2)' }),
    ).toBeInTheDocument()
  })

  test('marks every notification as read', async () => {
    const user = userEvent.setup()

    renderNotifications()

    await user.click(
      screen.getByRole('button', {
        name: 'Mark all as read',
      }),
    )

    expect(
      screen.getByRole('button', { name: 'Unread (0)' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Mark all as read',
      }),
    ).toBeDisabled()
  })
})