import { useState } from 'react'
import { ChevronLeft, MailCheck } from 'lucide-react'
import { Link } from 'react-router'
import AuthLayout from './AuthLayout.jsx'
import { identifierIsValid } from '../../utils/validation.js'
import { maskContact } from '../../utils/maskContact.js'

// INST-38: customer starts account recovery with their email or phone.
// "Reset password" on the confirmation leads to /reset-password (INST-39).
// Mock only: nothing is sent, and the message is the same whether or not an
// account exists, so the page doesn't reveal who has an account.

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (!identifier.trim()) {
      setError('Email or phone number is required.')
      return
    }

    if (!identifierIsValid(identifier)) {
      setError('Enter a valid email address or phone number.')
      return
    }

    setSentTo(maskContact(identifier))
  }

  if (sentTo) {
    return (
      <AuthLayout>
        <div className="customer-auth-success">
          <MailCheck size={48} aria-hidden="true" />
          <h1>Check your messages</h1>
          <p>
            If an account exists for <strong>{sentTo}</strong>, we sent a code
            to reset your password.
          </p>

          <Link
            to="/reset-password"
            state={{ sentTo }}
            className="customer-auth-submit"
          >
            Reset password
          </Link>

          <button
            type="button"
            className="customer-auth-secondary"
            onClick={() => setSentTo('')}
          >
            Try a different email or phone
          </button>

          <div className="customer-auth-switch">
            <Link to="/login">Back to sign in</Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="customer-auth-form-wrapper">
        <Link to="/login" className="customer-auth-back">
          <ChevronLeft size={16} aria-hidden="true" />
          Back to sign in
        </Link>

        <h1>Reset your password</h1>

        <p className="customer-auth-intro">
          Enter your email or phone and we&apos;ll send you a reset code.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="customer-auth-field">
            <label htmlFor="forgot-identifier">
              Email or phone <span aria-hidden="true">*</span>
            </label>

            <input
              id="forgot-identifier"
              type="text"
              autoComplete="username"
              placeholder="your@email.com"
              value={identifier}
              aria-invalid={Boolean(error)}
              onChange={(event) => {
                setIdentifier(event.target.value)
                setError('')
              }}
            />

            {error && <p className="customer-auth-error">{error}</p>}
          </div>

          <button type="submit" className="customer-auth-submit">
            Send reset code
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
