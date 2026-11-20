import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import StaffLogin from './StaffLogin.jsx'

// jsdom has no native dialog methods. Stub only the open/close lifecycle;
// modal focus containment and native Escape dismissal require a browser check.
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: vi.fn(function () { this.setAttribute('open', '') }),
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: vi.fn(function () {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }),
  })
})

afterEach(() => {
  delete HTMLDialogElement.prototype.showModal
  delete HTMLDialogElement.prototype.close
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/staff-portal']}>
      <Routes>
        <Route path="/staff-portal" element={<StaffLogin />} />
        <Route path="/admin" element={<h1>Admin preview</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('staff password contact help', () => {
  it('opens an accessible contact dialog without submitting the sign-in form or claiming a reset was sent', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }))
    const dialog = screen.getByRole('dialog', { name: 'Trouble signing in?' })
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce()
    expect(dialog).toHaveAccessibleDescription(/please contact an Admin or Manager for help/)
    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(dialog).not.toHaveTextContent(/email|reset link|sent/i)
    expect(screen.getByRole('heading', { name: 'Staff sign in' })).toBeInTheDocument()
  })

  it('allows keyboard activation and returns focus to Forgot password when closed', async () => {
    const user = userEvent.setup()
    renderPage()
    const trigger = screen.getByRole('button', { name: 'Forgot password?' })
    trigger.focus()
    await user.keyboard('{Enter}')
    const dialog = screen.getByRole('dialog', { name: 'Trouble signing in?' })
    await user.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    await user.keyboard(' ')
    expect(screen.getByRole('dialog', { name: 'Trouble signing in?' })).toBeInTheDocument()
  })

  it('preserves entered credentials and the existing demo sign-in behavior', async () => {
    const user = userEvent.setup()
    renderPage()
    const email = screen.getByRole('textbox', { name: 'Work email' })
    const password = screen.getByLabelText('Password')
    fireEvent.change(email, { target: { value: 'staff@example.com' } })
    fireEvent.change(password, { target: { value: 'Example123' } })
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }))
    expect(email).toHaveValue('staff@example.com')
    expect(password).toHaveValue('Example123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('heading', { name: 'Admin preview' })).toBeInTheDocument()
  })
})
