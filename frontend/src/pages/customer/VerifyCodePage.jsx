import { useRef, useState } from 'react'
import { CheckCircle2, ChevronLeft } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router'
import useAuth from '../../auth/useAuth.js'
import AuthLayout from './AuthLayout.jsx'

// INST-37: customer enters the 6-digit code "sent" on the /verify page.
// Mock only: no code is really sent, and DEMO_CODE is always the right answer.

const CODE_LENGTH = 6
const DEMO_CODE = '123456'

const emptyCode = () => Array(CODE_LENGTH).fill('')

export default function VerifyCodePage() {
  const { customer } = useAuth()
  const location = useLocation()
  // Set by the "Continue" button on /verify: { method: 'email' | 'sms', display: masked contact }
  const sentTo = location.state?.sentTo

  const [digits, setDigits] = useState(emptyCode)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [verified, setVerified] = useState(false)
  const inputs = useRef([])

  if (!customer) {
    return <Navigate to="/register" replace />
  }

  if (!sentTo) {
    return <Navigate to="/verify" replace />
  }

  const noun = sentTo.method === 'email' ? 'email' : 'phone'

  function focusBox(index) {
    inputs.current[Math.max(0, Math.min(index, CODE_LENGTH - 1))]?.focus()
  }

  function fillFrom(index, text) {
    const numbers = text.replace(/\D/g, '').slice(0, CODE_LENGTH - index)
    if (!numbers) return

    setDigits((current) => {
      const next = [...current]
      numbers.split('').forEach((digit, offset) => {
        next[index + offset] = digit
      })
      return next
    })
    setError('')
    setNotice('')
    focusBox(index + numbers.length)
  }

  function handleChange(index, value) {
    if (value === '') {
      setDigits((current) => current.map((digit, i) => (i === index ? '' : digit)))
      return
    }
    // Only numbers are accepted; typing a letter does nothing.
    fillFrom(index, value.slice(-1))
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      setDigits((current) => current.map((digit, i) => (i === index - 1 ? '' : digit)))
      focusBox(index - 1)
    }
  }

  function handlePaste(index, event) {
    event.preventDefault()
    fillFrom(index, event.clipboardData.getData('text'))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const code = digits.join('')
    setNotice('')

    if (code.length === 0) {
      setError('Enter your 6-digit code.')
      focusBox(0)
      return
    }

    if (code.length < CODE_LENGTH) {
      setError('Code must be 6 digits.')
      focusBox(code.length)
      return
    }

    // Mock check: no backend, so only the demo code succeeds.
    if (code !== DEMO_CODE) {
      setError('That code is incorrect. Try again.')
      setDigits(emptyCode())
      focusBox(0)
      return
    }

    setVerified(true)
  }

  function handleResend() {
    // Mock resend: nothing is actually sent.
    setDigits(emptyCode())
    setError('')
    setNotice(`A new code has been sent to ${sentTo.display}.`)
    focusBox(0)
  }

  if (verified) {
    return (
      <AuthLayout>
        <div className="customer-auth-success">
          <CheckCircle2 size={48} aria-hidden="true" />
          <h1>Account verified</h1>
          <p>Thanks, {customer.firstName}. Your {noun} has been verified.</p>

          <Link to="/menu" className="customer-auth-submit">
            Continue to the menu
          </Link>
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

        <h1>Verify your {noun}</h1>

        <p className="customer-auth-intro">
          We sent a 6-digit code to <strong>{sentTo.display}</strong>.
        </p>

        {error && (
          <div className="customer-auth-feedback error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="customer-auth-feedback success" role="status">
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="customer-code-fieldset">
            <legend className="customer-verify-legend">Verification code</legend>

            <div className="customer-code-boxes">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputs.current[index] = element
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={CODE_LENGTH}
                  aria-label={`Digit ${index + 1}`}
                  aria-invalid={Boolean(error)}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={(event) => handlePaste(index, event)}
                  onFocus={(event) => event.target.select()}
                />
              ))}
            </div>
          </fieldset>

          <button type="submit" className="customer-auth-submit">
            Verify
          </button>
        </form>

        <p className="customer-auth-switch">
          Didn&apos;t get it?{' '}
          <button
            type="button"
            className="customer-auth-text-button"
            onClick={handleResend}
          >
            Resend code
          </button>
        </p>

        <p className="customer-code-hint">Demo code: {DEMO_CODE}</p>
      </div>
    </AuthLayout>
  )
}
