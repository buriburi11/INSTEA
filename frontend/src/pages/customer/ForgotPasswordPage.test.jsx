import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ForgotPasswordPage from './ForgotPasswordPage.jsx'

function renderPage() {
  return render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>,
  )
}

function submit(value) {
  if (value !== undefined) {
    fireEvent.change(screen.getByLabelText(/Email or phone/), { target: { value } })
  }
  fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }))
}

describe('ForgotPasswordPage', () => {
  it('shows an email or phone field', () => {
    renderPage()
    expect(screen.getByLabelText(/Email or phone/)).toBeInTheDocument()
  })

  it('requires an email or phone', () => {
    renderPage()
    submit()
    expect(screen.getByText('Email or phone number is required.')).toBeInTheDocument()
  })

  it('rejects an invalid format', () => {
    renderPage()
    submit('not-an-email')
    expect(screen.getByText('Enter a valid email address or phone number.')).toBeInTheDocument()
  })

  it('shows mock confirmation for an email', () => {
    renderPage()
    submit('alex.rivera@example.com')
    expect(screen.getByRole('heading', { name: 'Check your messages' })).toBeInTheDocument()
    expect(screen.getByText('a***@example.com')).toBeInTheDocument()
  })

  it('shows mock confirmation for a phone number', () => {
    renderPage()
    submit('(916) 555-0102')
    expect(screen.getByText('(***) ***-0102')).toBeInTheDocument()
  })

  it('links back to sign in', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /Back to sign in/ })).toHaveAttribute('href', '/login')
  })
})
