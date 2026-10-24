import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import useAuth from '../../auth/useAuth.js'
import AuthLayout from './AuthLayout.jsx'
import { identifierIsValid } from '../../utils/validation.js'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}

    if (!identifier.trim()) {
      nextErrors.identifier = 'Email or phone number is required.'
    } else if (!identifierIsValid(identifier)) {
      nextErrors.identifier = 'Enter a valid email address or phone number.'
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    }

    setErrors(nextErrors)
    setFeedback('')

    if (Object.keys(nextErrors).length > 0) return

    const result = login({
      identifier,
      password,
      remember,
    })

    if (!result.success) {
      setFeedback(result.message)
      return
    }

    navigate('/menu')
  }

  return (
    <AuthLayout>
      <div className="customer-auth-form-wrapper">
        <h1>Welcome back</h1>

        <p className="customer-auth-intro">
          Sign in to access your INSTEA account and rewards.
        </p>

        {feedback && (
          <div className="customer-auth-feedback error" role="alert">
            {feedback}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="customer-auth-field">
            <label htmlFor="login-identifier">
              Email or phone <span aria-hidden="true">*</span>
            </label>

            <input
              id="login-identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              placeholder="your@email.com"
              aria-invalid={Boolean(errors.identifier)}
              onChange={(event) => {
                setIdentifier(event.target.value)
                setErrors((current) => ({
                  ...current,
                  identifier: '',
                }))
                setFeedback('')
              }}
            />

            {errors.identifier && (
              <p className="customer-auth-error">{errors.identifier}</p>
            )}
          </div>

          <div className="customer-auth-field">
            <label htmlFor="login-password">
              Password <span aria-hidden="true">*</span>
            </label>

            <div className="customer-auth-password">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                aria-invalid={Boolean(errors.password)}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrors((current) => ({
                    ...current,
                    password: '',
                  }))
                  setFeedback('')
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

            {errors.password && (
              <p className="customer-auth-error">{errors.password}</p>
            )}
          </div>

          <label className="customer-auth-checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember me
          </label>

          <button type="submit" className="customer-auth-submit">
            Sign in
          </button>
        </form>

        <p className="customer-auth-switch">
          Not a member? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </AuthLayout>
  )
}