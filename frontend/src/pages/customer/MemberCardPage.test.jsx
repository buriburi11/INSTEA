import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import AuthProvider from '../../auth/AuthProvider.jsx'
import { customers } from '../../data/customers.js'
import MemberCardPage from './MemberCardPage.jsx'

function renderMemberCard() {
  localStorage.setItem(
    'instea.mockCustomer',
    JSON.stringify(customers[0]),
  )

  return render(
    <MemoryRouter>
      <AuthProvider>
        <MemberCardPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('MemberCardPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('displays member information', () => {
    renderMemberCard()

    expect(screen.getByText('Alex Rivera')).toBeInTheDocument()
    expect(screen.getByText(/Member #/)).toHaveTextContent(
    'Member #INS-100001',
    )
    expect(screen.getByText('Gold')).toBeInTheDocument()
  })

  test('shows and hides membership details', async () => {
    const user = userEvent.setup()

    renderMemberCard()

    await user.click(
      screen.getByRole('button', { name: /Details/i }),
    )

    expect(
      screen.getByText('Membership details'),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /Details/i }),
    )

    expect(
      screen.queryByText('Membership details'),
    ).not.toBeInTheDocument()
  })

  test('opens the enlarged member card', async () => {
    const user = userEvent.setup()

    renderMemberCard()

    await user.click(
      screen.getByRole('button', { name: /Enlarge/i }),
    )

    expect(
      screen.getByRole('dialog', {
        name: 'Enlarged member card',
      }),
    ).toBeInTheDocument()
  })

  test('displays wallet feedback', async () => {
    const user = userEvent.setup()

    renderMemberCard()

    await user.click(
      screen.getByRole('button', { name: /Wallet/i }),
    )

    expect(
      screen.getByText(/Digital wallet support/),
    ).toBeInTheDocument()
  })
})