import { useState } from 'react'
import { useNavigate } from 'react-router'
import useAuth from '../../auth/useAuth.js'
import './ProfilePage.css'

const settingsTabs = [
  'Overview',
  'Member card',
  'Rewards',
  'Orders',
  'Notifications',
  'Settings',
]

export default function ProfilePage() {
  const { customer, logout } = useAuth()
  const navigate = useNavigate()

  const fullName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(' ')

  const [formData, setFormData] = useState({
    name: fullName,
    email: customer.email || '',
    phone: customer.phone || '',
    preferredLocation: 'Sacramento, CA',
  })

  const [preferences, setPreferences] = useState({
    reduceMotion: false,
    largerText: false,
    highContrast: false,
    leaderboards: true,
    recommendations: true,
  })

  const [feedback, setFeedback] = useState('')

  function updateField(event) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setFeedback('')
  }

  function togglePreference(name) {
    setPreferences((current) => ({
      ...current,
      [name]: !current[name],
    }))
  }

  function handleSave(event) {
    event.preventDefault()
    setFeedback('Your mock profile changes have been saved.')
  }

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <main className="profile-settings-page">
      <div className="profile-settings-container">
        <h1>Profile &amp; settings</h1>

        <nav className="profile-settings-tabs" aria-label="Customer account">
          {settingsTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={tab === 'Settings' ? 'active' : ''}
            >
              {tab}
            </button>
          ))}
        </nav>

        {feedback && (
          <div className="profile-settings-feedback" role="status">
            {feedback}
          </div>
        )}

        <section className="profile-settings-section">
          <div className="profile-settings-description">
            <h2>Profile</h2>
            <p>Used for pickup names and receipts.</p>
          </div>

          <form className="profile-settings-card" onSubmit={handleSave}>
            <label>
              Name
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={updateField}
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={updateField}
              />
            </label>

            <label>
              Phone
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={updateField}
              />
            </label>

            <label>
              Preferred location
              <input
                name="preferredLocation"
                type="text"
                value={formData.preferredLocation}
                onChange={updateField}
              />
            </label>

            <div className="profile-settings-actions">
              <button type="submit" className="profile-save-button">
                Save changes
              </button>

              <button
                type="button"
                className="profile-secondary-button"
                onClick={() =>
                  setFeedback(
                    'Password changes are unavailable in the frontend mockup.',
                  )
                }
              >
                Change password
              </button>
            </div>
          </form>
        </section>

        <section className="profile-settings-section">
          <div className="profile-settings-description">
            <h2>Accessibility</h2>
            <p>Tailor how INSTEA looks and moves.</p>
          </div>

          <div className="profile-settings-card profile-toggle-card">
            <Toggle
              title="Reduce motion"
              description="Minimize animations and transitions"
              checked={preferences.reduceMotion}
              onChange={() => togglePreference('reduceMotion')}
            />

            <Toggle
              title="Larger text"
              description="Increase base text size by 15%"
              checked={preferences.largerText}
              onChange={() => togglePreference('largerText')}
            />

            <Toggle
              title="High contrast"
              description="Stronger borders and text contrast"
              checked={preferences.highContrast}
              onChange={() => togglePreference('highContrast')}
            />
          </div>
        </section>

        <section className="profile-settings-section">
          <div className="profile-settings-description">
            <h2>Privacy</h2>
          </div>

          <div className="profile-settings-card profile-toggle-card">
            <Toggle
              title="Show me on leaderboards"
              description="Display your first name and initial in trivia rankings"
              checked={preferences.leaderboards}
              onChange={() => togglePreference('leaderboards')}
            />

            <Toggle
              title="Personalized recommendations"
              description="Use order history to suggest drinks"
              checked={preferences.recommendations}
              onChange={() => togglePreference('recommendations')}
            />
          </div>
        </section>

        <section className="profile-settings-section profile-account-section">
          <div className="profile-settings-description">
            <h2>Account</h2>
          </div>

          <div className="profile-account-actions">
            <button
              type="button"
              className="profile-secondary-button"
              onClick={handleLogout}
            >
              Sign out
            </button>

            <button
              type="button"
              className="profile-delete-button"
              onClick={() =>
                setFeedback(
                  'Account deletion is unavailable in the frontend mockup.',
                )
              }
            >
              Delete account
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

function Toggle({ title, description, checked, onChange }) {
  return (
    <label className="profile-toggle-row">
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <input type="checkbox" checked={checked} onChange={onChange} />

      <span className="profile-toggle-switch" aria-hidden="true">
        <span />
      </span>
    </label>
  )
}