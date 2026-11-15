import { Bell } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router'
import MemberNavigation from '../components/member/MemberNavigation.jsx'
import useAuth from '../auth/useAuth.js'
import useNotifications from '../notifications/useNotifications.js'
import './MemberLayout.css'

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function MemberLayout() {
  const { customer } = useAuth()
  const { unreadCount } = useNotifications()
  const location = useLocation()

  const pageInformation = {
    '/member': {
      eyebrow: 'Welcome back!',
      title: `${getGreeting()}, ${customer.firstName}.`,
      showNotificationButton: true,
    },
    '/member-card': {
      title: 'Member card',
    },
    '/orders': {
      title: 'Order history',
    },
    '/notifications': {
      title: 'Notifications',
    },
    '/notifications/preferences': {
      title: 'Notification preferences',
    },
    '/profile': {
      title: 'Profile & settings',
    },
  }

  const currentPage = pageInformation[location.pathname]
  const rewardsUsesOwnHeading = location.pathname === '/rewards'

  return (
    <div className="member-layout">
      {!rewardsUsesOwnHeading && currentPage && (
        <header className="member-layout-header">
          <div className="member-layout-title-group">
            {currentPage.eyebrow && (
              <p className="member-layout-eyebrow">
                {currentPage.eyebrow}
              </p>
            )}

            <h1>{currentPage.title}</h1>
          </div>

          {currentPage.showNotificationButton && (
            <Link
              to="/notifications"
              className="member-layout-notification-button"
            >
              <Bell size={18} aria-hidden="true" />
              {unreadCount === 0
                ? 'No new notifications'
                : `${unreadCount} new notification${
                    unreadCount === 1 ? '' : 's'
                  }`}
            </Link>
          )}
        </header>
      )}

      <MemberNavigation />

      <Outlet />
    </div>
  )
}