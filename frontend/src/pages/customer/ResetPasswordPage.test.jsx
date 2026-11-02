import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import ForgotPasswordPage from './ForgotPasswordPage.jsx'
import ResetPasswordPage from './ResetPasswordPage.jsx'

// Renders /reset-password with the state /forgot-password passes along (or none).
function renderReset({ sentTo = 'a***@example.com' } = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/reset-password', state: sentTo ? { sentTo } : null }]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<p>Forgot password page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function fill(newPassword, confirmPassword) {
  fireEvent.change(screen.getByLabelText(/^New password/), { target: { value: newPassword } })
  fireEvent.change(screen.getByLabelText(/^Confirm password/), { target: { value: confirmPassword } })
  fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))
}

describe('ResetPasswordPage', () => {
  it('shows new and confirm password fields', () => {
    renderReset()
    expect(screen.getByLabelText(/^New password/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Confirm password/)).toBeInTheDocument()
  })

  it('displays the password requirements', () => {
    renderReset()
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
    expect(screen.getByText('One uppercase letter')).toBeInTheDocument()
    expect(screen.getByText('One number')).toBeInTheDocument()
  })

  it('marks requirements as met while typing', () => {
    renderReset()
    fireEvent.change(screen.getByLabelText(/^New password/), { target: { value: 'Tea12345' } })
    expect(screen.getByText('At least 8 characters')).toHaveClass('valid')
  })

  it('requires both fields', () => {
    renderReset()
    fill('', '')
    expect(screen.getByText('New password is required.')).toBeInTheDocument()
    expect(screen.getByText('Please confirm your new password.')).toBeInTheDocument()
  })

  it('rejects a password that misses requirements', () => {
    renderReset()
    fill('short', 'short')
    expect(screen.getByText('Password does not meet all requirements.')).toBeInTheDocument()
  })

  it('shows an error when passwords do not match', () => {
    renderReset()
    fill('NewTea123', 'NewTea124')
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument()
  })

  it('shows mock success and a way back to login', () => {
    renderReset()
    fill('NewTea123', 'NewTea123')
    expect(screen.getByRole('heading', { name: 'Password updated' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '/login')
  })

  it('sends visitors to forgot password if they skipped it', () => {
    renderReset({ sentTo: null })
    expect(screen.getByText('Forgot password page')).toBeInTheDocument()
  })

  it('is reached from the forgot password confirmation', () => {
    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText(/Email or phone/), { target: { value: 'alex.rivera@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }))
    fireEvent.click(screen.getByRole('link', { name: 'Reset password' }))
    expect(screen.getByRole('heading', { name: 'Create a new password' })).toBeInTheDocument()
  })
})
