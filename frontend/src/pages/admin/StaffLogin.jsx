import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Info, ShieldCheck } from 'lucide-react'
import insteaLogo from '../../assets/instea-logo.svg'
import './StaffLogin.css'

export default function StaffLogin() {
  const navigate = useNavigate()
  const [showResetMessage, setShowResetMessage] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()

    // Sprint 1 demo only. No credentials are checked or stored.
    event.currentTarget.reset()
    navigate('/admin')
  }

  return (
    <main className="staff-login">
      <section
        className="staff-login__card"
        aria-labelledby="staff-login-title"
      >
        <div className="staff-login__brand">
          <img src={insteaLogo} alt="INSTEA" />
          <span>Staff console</span>
        </div>

        {/* Replace this demo notice when real authentication is added. */}
        <div className="staff-login__notice" id="staff-login-demo">
          <Info size={20} aria-hidden="true" />
          <p>
            Sprint 1 demo. Use sample details, not a real password.
            Sign in opens the admin preview without authentication.
          </p>
        </div>

        <h1 id="staff-login-title">Staff sign in</h1>
        <p className="staff-login__intro">
          Authorized INSTEA team members only.
        </p>

        <form
          onSubmit={handleSubmit}
          aria-describedby="staff-login-demo"
        >
          <div className="staff-login__field">
            <label htmlFor="staff-email">Work email</label>
            <input
              id="staff-email"
              name="email"
              type="email"
              autoComplete="off"
              placeholder="staff@example.com"
              required
            />
          </div>

          <div className="staff-login__field">
            <div className="staff-login__label-row">
              <label htmlFor="staff-password">Password</label>
              <button
                type="button"
                className="staff-login__forgot"
                onClick={() => setShowResetMessage(true)}
              >
                Forgot?
              </button>
            </div>

            <input
              id="staff-password"
              name="password"
              type="password"
              autoComplete="off"
              required
            />
          </div>

          <p className="staff-login__message" role="status">
            {showResetMessage
              ? 'Password reset will be available when authentication is implemented.'
              : ''}
          </p>

          <button type="submit" className="staff-login__submit">
            <ShieldCheck size={20} aria-hidden="true" />
            Sign in
          </button>
        </form>

        <Link to="/" className="staff-login__back">
          Back to customer site
        </Link>
      </section>
    </main>
  )
}