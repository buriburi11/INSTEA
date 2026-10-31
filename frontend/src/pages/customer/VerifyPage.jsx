import { useState } from 'react'
import { ChevronLeft, Mail, MailCheck, MessageSquare, Smartphone } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router'
import useAuth from '../../auth/useAuth.js'
import AuthLayout from './AuthLayout.jsx'
import { identifierIsValid } from '../../utils/validation.js'

// INST-36: lets a customer choose email or text (SMS) for account verification.
// Mock only: nothing is actually sent. "Continue" leads to the code screen (INST-37).

const METHODS = {
  email: {
    label: 'Email',
    noun: 'email',
    Icon: Mail,
    inputLabel: 'Email address',
    inputType: 'email',
    autoComplete: 'email',
    placeholder: 'your@email.com',
    invalidMessage: 'Enter a valid email address.',
  },
  sms: {
    label: 'Text message',
    noun: 'phone',
    Icon: MessageSquare,
    inputLabel: 'Phone number',
    inputType: 'tel',
    autoComplete: 'tel',
    placeholder: '(916) 555-0100',
    invalidMessage: 'Enter a valid phone number.',
  },
}

// Shows enough of the contact to recognize it without exposing all of it,
// e.g. "a***@example.com" or "(***) ***-0101".
function maskEmail(email) {
  const [name, domain] = email.split('@')
  return `${name.charAt(0)}***@${domain}`
}

function maskPhone(phone) {
  const lastFour = phone.replace(/\D/g, '').slice(-4)
  return `(***) ***-${lastFour}`
}

function contactIsValid(method, value) {
  const isEmail = value.includes('@')
  if (method === 'email' && !isEmail) return false
  if (method === 'sms' && isEmail) return false
  return identifierIsValid(value)
}

export default function VerifyPage() {
  const { customer } = useAuth()
  const location = useLocation()
  const justRegistered = Boolean(location.state?.justRegistered)

  const savedContacts = {
    email: customer?.email ?? '',
    sms: customer?.phone ?? '',
  }

  // Default to whichever contact the customer signed up with.
  const [method, setMethod] = useState(savedContacts.email ? 'email' : 'sms')
  const [enteredContacts, setEnteredContacts] = useState({ email: '', sms: '' })
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState(null)

  if (!customer) {
    return <Navigate to="/register" replace />
  }

  const selected = METHODS[method]
  const needsContact = !savedContacts[method]

  function describeContact(key) {
    if (savedContacts[key]) {
      return key === 'email'
        ? maskEmail(savedContacts[key])
        : maskPhone(savedContacts[key])
    }
    return `Add a ${METHODS[key].noun} ${key === 'email' ? 'address' : 'number'}`
  }

  function handleSubmit(event) {
    event.preventDefault()

    const contact = needsContact
      ? enteredContacts[method].trim()
      : savedContacts[method]

    if (needsContact && !contact) {
      setError(`${selected.inputLabel} is required.`)
      return
    }

    if (needsContact && !contactIsValid(method, contact)) {
      setError(selected.invalidMessage)
      return
    }

    // Mock "send": no real email or SMS service is called.
    setSentTo({
      method,
      display: method === 'email' ? maskEmail(contact) : maskPhone(contact),
    })
  }

  if (sentTo) {
    return (
      <AuthLayout>
        <div className="customer-auth-success">
          {sentTo.method === 'email' ? (
            <MailCheck size={48} aria-hidden="true" />
          ) : (
            <Smartphone size={48} aria-hidden="true" />
          )}
          <h1>Check your {METHODS[sentTo.method].noun}</h1>
          <p>
            We sent a 6-digit code to <strong>{sentTo.display}</strong>.
          </p>

          <Link
            to="/verify/code"
            state={{ sentTo }}
            className="customer-auth-submit"
          >
            Continue
          </Link>

          <button
            type="button"
            className="customer-auth-secondary"
            onClick={() => setSentTo(null)}
          >
            Use a different method
          </button>
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

        <h1>Verify your account</h1>

        {justRegistered && (
          <div className="customer-auth-feedback success" role="status">
            Account created. 100 welcome leaves have been added to your wallet.
          </div>
        )}

        <p className="customer-auth-intro">
          Choose how you&apos;d like to receive your verification code.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="customer-verify-options">
            <legend className="customer-verify-legend">Verification method</legend>

            {Object.entries(METHODS).map(([key, { label, Icon }]) => (
              <label
                key={key}
                className={`customer-verify-option${method === key ? ' selected' : ''}`}
              >
                <input
                  type="radio"
                  name="verification-method"
                  value={key}
                  checked={method === key}
                  onChange={() => {
                    setMethod(key)
                    setError('')
                  }}
                />
                <Icon size={22} aria-hidden="true" />
                <span className="customer-verify-option-text">
                  <span className="customer-verify-option-label">{label}</span>
                  <span className="customer-verify-option-detail">
                    {describeContact(key)}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          {needsContact && (
            <div className="customer-auth-field">
              <label htmlFor="verify-contact">
                {selected.inputLabel} <span aria-hidden="true">*</span>
              </label>

              <input
                id="verify-contact"
                type={selected.inputType}
                autoComplete={selected.autoComplete}
                placeholder={selected.placeholder}
                value={enteredContacts[method]}
                aria-invalid={Boolean(error)}
                onChange={(event) => {
                  const value = event.target.value
                  setEnteredContacts((current) => ({ ...current, [method]: value }))
                  setError('')
                }}
              />

              {error && <p className="customer-auth-error">{error}</p>}
            </div>
          )}

          <button type="submit" className="customer-auth-submit">
            Send code by {selected.noun === 'email' ? 'email' : 'text'}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
