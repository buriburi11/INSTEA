import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import './NotificationsPage.css'

const STORAGE_KEY = 'instea.notificationPreferences'

const defaultPreferences = {
  orderEmail: true,
  orderPush: true,
  rewardEmail: true,
  rewardPush: true,
  eventEmail: true,
  eventPush: false,
  communityEmail: false,
  communityPush: true,
  promotionEmail: true,
  promotionPush: false,
}

const preferenceRows = [
  {
    id: 'order',
    title: 'Order updates',
    description: 'Status changes for your pickup orders',
  },
  {
    id: 'reward',
    title: 'Rewards & milestones',
    description: 'New rewards, streaks and expiring leaves',
  },
  {
    id: 'event',
    title: 'Event reminders',
    description: 'RSVPs and upcoming gatherings',
  },
  {
    id: 'community',
    title: 'Polls & trivia',
    description: 'New votes and daily questions',
  },
  {
    id: 'promotion',
    title: 'Promotions',
    description: 'Seasonal offers and member pricing',
  },
]

function readPreferences() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : defaultPreferences
  } catch {
    return defaultPreferences
  }
}

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState(readPreferences)

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(preferences),
    )
  }, [preferences])

  function togglePreference(name) {
    setPreferences((current) => ({
      ...current,
      [name]: !current[name],
    }))
  }

  return (
    <main className="notification-preferences-page">
      <div className="notification-preferences-actions">
        <Link to="/notifications">← Back to notifications</Link>
        <span>Changes save automatically</span>
      </div>

      <section className="notification-preferences-table">
        <div className="notification-preferences-heading">
          <span>Type</span>
          <span>Email</span>
          <span>Push</span>
        </div>

        {preferenceRows.map((row) => (
          <div
            key={row.id}
            className="notification-preference-row"
          >
            <span className="notification-preference-description">
              <strong>{row.title}</strong>
              <small>{row.description}</small>
            </span>

            <label>
              <span className="sr-only">
                Email notifications for {row.title}
              </span>
              <input
                type="checkbox"
                checked={preferences[`${row.id}Email`]}
                onChange={() =>
                  togglePreference(`${row.id}Email`)
                }
              />
            </label>

            <label>
              <span className="sr-only">
                Push notifications for {row.title}
              </span>
              <input
                type="checkbox"
                checked={preferences[`${row.id}Push`]}
                onChange={() =>
                  togglePreference(`${row.id}Push`)
                }
              />
            </label>
          </div>
        ))}
      </section>
    </main>
  )
}