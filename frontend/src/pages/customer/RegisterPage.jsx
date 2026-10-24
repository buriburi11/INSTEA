import { useState } from 'react'
import { Check, CheckCircle2, Eye, EyeOff, X } from 'lucide-react'
import { Link } from 'react-router'
import useAuth from '../../auth/useAuth.js'
import AuthLayout from './AuthLayout.jsx'
import { identifierIsValid } from '../../utils/validation.js'


export default function RegisterPage() {
  const { register } = useAuth()

  const [fullName, setFullName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')
  const [registrationComplete, setRegistrationComplete] = useState(false)

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}

    if (!fullName.trim()) {
      nextErrors.fullName = 'Full name is required.'
    }

    if (!identifier.trim()) {
      nextErrors.identifier = 'Email or phone number is required.'
    } else if (!identifierIsValid(identifier)) {
      nextErrors.identifier = 'Enter a valid email address or phone number.'
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    } else if (!Object.values(passwordRules).every(Boolean)) {
      nextErrors.password = 'Password does not meet all requirements.'
    }

    setErrors(nextErrors)
    setFeedback('')

    if (Object.keys(nextErrors).length > 0) return

    const result = register({
      fullName,
      identifier,
      password,
    })

    if (!result.success) {
      setFeedback(result.message)
      return
    }

    setRegistrationComplete(true)
  }

  if (registrationComplete) {
    return (
      <AuthLayout>
        <div className="customer-auth-success">
          <CheckCircle2 size={48} aria-hidden="true" />
          <h1>Welcome to the society</h1>
          <p>
            Your mock account is ready, and 100 welcome leaves have been
            added to your wallet.
          </p>

          <Link to="/menu" className="customer-auth-submit">
            Continue to the menu
          </Link>

          <Link to="/" className="customer-auth-secondary">
            Return home
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="customer-auth-form-wrapper">
        <h1>Join INSTEA Rewards</h1>
        <p className="customer-auth-intro">
          Free to join. Get 100 welcome leaves instantly.
        </p>

        {feedback && (
          <div className="customer-auth-feedback error" role="alert">
            {feedback}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="customer-auth-field">
            <label htmlFor="register-name">
              Full name <span aria-hidden="true">*</span>
            </label>

            <input
              id="register-name"
              type="text"
              autoComplete="name"
              value={fullName}
              aria-invalid={Boolean(errors.fullName)}
              onChange={(event) => {
                setFullName(event.target.value)
                setErrors((current) => ({
                  ...current,
                  fullName: '',
                }))
              }}
            />

            {errors.fullName && (
              <p className="customer-auth-error">{errors.fullName}</p>
            )}
          </div>

          <div className="customer-auth-field">
            <label htmlFor="register-identifier">
              Email or phone <span aria-hidden="true">*</span>
            </label>

            <input
              id="register-identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              aria-invalid={Boolean(errors.identifier)}
              onChange={(event) => {
                setIdentifier(event.target.value)
                setErrors((current) => ({
                  ...current,
                  identifier: '',
                }))
              }}
              placeholder="your@email.com"
            />

            {errors.identifier && (
              <p className="customer-auth-error">{errors.identifier}</p>
            )}
          </div>

          <div className="customer-auth-field">
            <label htmlFor="register-password">
              Password <span aria-hidden="true">*</span>
            </label>

            <div className="customer-auth-password">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                aria-invalid={Boolean(errors.password)}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrors((current) => ({
                    ...current,
                    password: '',
                  }))
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

            <ul className="customer-auth-rules">
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

          <button type="submit" className="customer-auth-submit">
            Create account
          </button>
        </form>

        <p className="customer-auth-switch">
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  )
}