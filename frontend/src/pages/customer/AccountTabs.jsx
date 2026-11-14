import { Link } from 'react-router'
import './ProfilePage.css'
import './AccountTabs.css'

// The account tab bar shared by the Profile and Order history pages.
// Tabs with a `to` are links; the rest aren't built yet and ignore clicks.
const ACCOUNT_TABS = [
  { label: 'Overview' },
  { label: 'Member card' },
  { label: 'Rewards', to: '/rewards' },
  { label: 'Orders', to: '/orders' },
  { label: 'Notifications' },
  { label: 'Settings', to: '/profile' },
]

export default function AccountTabs({ active }) {
  return (
    <nav className="profile-settings-tabs" aria-label="Customer account">
      {ACCOUNT_TABS.map(({ label, to }) => {
        const className = label === active ? 'active' : ''

        return to ? (
          <Link
            key={label}
            to={to}
            className={className}
            aria-current={label === active ? 'page' : undefined}
          >
            {label}
          </Link>
        ) : (
          <button key={label} type="button" className={className}>
            {label}
          </button>
        )
      })}
    </nav>
  )
}
