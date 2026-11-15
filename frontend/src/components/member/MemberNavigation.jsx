import { NavLink } from 'react-router'
import './MemberNavigation.css'

const memberTabs = [
  { label: 'Overview', path: '/member', end: true },
  { label: 'Member card', path: '/member-card' },
  { label: 'Rewards', path: '/rewards' },
  { label: 'Orders', path: '/orders' },
  { label: 'Notifications', path: '/notifications' },
  { label: 'Settings', path: '/profile' },
]

export default function MemberNavigation() {
  return (
    <nav
      className="member-navigation"
      aria-label="Member account navigation"
    >
      {memberTabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.end}
          className={({ isActive }) =>
            isActive ? 'member-navigation-link active' : 'member-navigation-link'
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}