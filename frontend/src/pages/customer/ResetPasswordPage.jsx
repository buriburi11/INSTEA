import { useState } from 'react'
import { Check, CheckCircle2, ChevronLeft, Eye, EyeOff, X } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router'
import AuthLayout from './AuthLayout.jsx'

// INST-39: customer sets a new password after starting recovery on /forgot-password.
// Mock only: the password isn't actually changed (the demo login password still works).

export default function ResetPasswordPage() {
  const location = useLocation()
  // Set by the "Reset password" button on /forgot-password.
  const sentTo = location.state?.sentTo

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [resetComplete, setResetComplete] = useState(false)

  if (!sentTo) {
    return <Navigate to="/forgot-password" replace />
  }

  // Same rules as the register page.
  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}

    if (!password) {
      nextErrors.password = 'New password is required.'
    } else if (!Object.values(passwordRules).every(Boolean)) {
      nextErrors.password = 'Password does not meet all requirements.'
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password.'
    } else if (password && confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords don't match."
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    // Mock reset: no backend call.
    setResetComplete(true)
  }

  if (resetComplete) {
    return (
      <AuthLayout>
        <div className="customer-auth-success">
          <CheckCircle2 size={48} aria-hidden="true" />
          <h1>Password updated</h1>
          <p>You can now sign in with your new password.</p>

          <Link to="/login" className="customer-auth-submit">
            Back to sign in
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

        <h1>Create a new password</h1>

        <p className="customer-auth-intro">
          Choose a new password for the account linked to{' '}
          <strong>{sentTo}</strong>.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="customer-auth-field">
            <label htmlFor="reset-password">
              New password <span aria-hidden="true">*</span>
            </label>

            <div className="customer-auth-password">
              <input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                aria-invalid={Boolean(errors.password)}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrors((current) => ({ ...current, password: '' }))
                }}
              />

              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <ul className="customer-auth-rules" aria-label="Password requirements">
              <li className={passwordRules.length ? 'valid' : ''}>
                {passwordRules.length ? <Check /> : <X />}
                At least 8 characters
              </li>
              <li className={passwordRules.uppercase ? 'valid' : ''}>
                {passwordRules.uppercase ? <Check /> : <X />}
                One uppercase letter
              </li>
              <li className={passwordRules.number ? 'valid' : ''}>
                {passwordRules.number ? <Check /> : <X />}
                One number
              </li>
            </ul>

            {errors.password && (
              <p className="customer-auth-error">{errors.password}</p>
            )}
          </div>

          <div className="customer-auth-field">
            <label htmlFor="reset-confirm-password">
              Confirm password <span aria-hidden="true">*</span>
            </label>

            <input
              id="reset-confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              aria-invalid={Boolean(errors.confirmPassword)}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                setErrors((current) => ({ ...current, confirmPassword: '' }))
              }}
            />

            {errors.confirmPassword && (
              <p className="customer-auth-error">{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" className="customer-auth-submit">
            Reset password
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
