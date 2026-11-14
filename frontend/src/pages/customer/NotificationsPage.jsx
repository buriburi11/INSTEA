import {
  Award,
  CalendarDays,
  Coffee,
  Megaphone,
  ShieldAlert,
  Vote,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import useNotifications from '../../notifications/useNotifications.js'
import './NotificationsPage.css'

const notificationIcons = {
  order: Coffee,
  reward: Award,
  community: Vote,
  event: CalendarDays,
  promotion: Megaphone,
  security: ShieldAlert,
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  const [activeFilter, setActiveFilter] = useState('all')

  const visibleNotifications =
    activeFilter === 'unread'
      ? notifications.filter((notification) => !notification.isRead)
      : notifications

  return (
    <main className="notifications-page">
      <div className="notifications-toolbar">
        <div className="notifications-filters">
          <button
            type="button"
            className={activeFilter === 'all' ? 'active' : ''}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>

          <button
            type="button"
            className={activeFilter === 'unread' ? 'active' : ''}
            onClick={() => setActiveFilter('unread')}
          >
            Unread ({unreadCount})
          </button>

          <Link
            to="/notifications/preferences"
            className="notifications-preferences-link"
          >
            Preferences
          </Link>
        </div>

        <button
          type="button"
          className="notifications-mark-all"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      <section
        className="notifications-list"
        aria-label="Member notifications"
      >
        {visibleNotifications.length === 0 ? (
          <div className="notifications-empty">
            <BellEmptyState />
            <h2>You’re all caught up</h2>
            <p>There are no unread notifications.</p>
          </div>
        ) : (
          visibleNotifications.map((notification) => {
            const Icon =
              notificationIcons[notification.category] ?? Megaphone

            return (
              <button
                key={notification.id}
                type="button"
                className={`notification-row ${
                  notification.isRead ? 'read' : 'unread'
                }`}
                onClick={() => markAsRead(notification.id)}
                aria-label={`${notification.title}. ${
                  notification.isRead ? 'Read' : 'Unread'
                }`}
              >
                <span
                  className={`notification-icon ${notification.category}`}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>

                <span className="notification-content">
                  <span className="notification-title-line">
                    <strong>{notification.title}</strong>

                    {!notification.isRead && (
                      <span
                        className="notification-unread-dot"
                        aria-label="Unread"
                      />
                    )}
                  </span>

                  <span className="notification-description">
                    {notification.description}
                  </span>

                  <span className="notification-time">
                    {notification.timestamp}
                  </span>
                </span>
              </button>
            )
          })
        )}
      </section>
    </main>
  )
}

function BellEmptyState() {
  return (
    <span className="notifications-empty-icon" aria-hidden="true">
      ✓
    </span>
  )
}