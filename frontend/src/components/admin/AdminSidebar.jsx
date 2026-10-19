import { Link, NavLink } from 'react-router'
import {
  LayoutDashboard,
  ClipboardList,
  Coffee,
  Users,
  Award,
  MessagesSquare,
  ShieldCheck,
  ExternalLink,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import './AdminSidebar.css'
import insteaLogo from '../../assets/instea-logo.svg'

const navigation = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Orders', path: '/admin/orders', icon: ClipboardList },
  { label: 'Menu', path: '/admin/products', icon: Coffee },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Loyalty', path: '/admin/loyalty', icon: Award },
  { label: 'Community', path: '/admin/community', icon: MessagesSquare },
  { label: 'Roles & access', path: '/admin/roles', icon: ShieldCheck },
]

export default function AdminSidebar({ collapsed, onToggle }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        {collapsed ? (
          <span className="admin-sidebar__brand-mark" aria-label="INSTEA">
            <Coffee size={25} aria-hidden="true" />
          </span>
        ) : (
          <div className="admin-sidebar__brand-text">
            <img
              src={insteaLogo}
              alt="INSTEA"
              className="admin-sidebar__logo"
            />
            <span className="admin-sidebar__subtitle">Staff console</span>
          </div>
        )}
      </div>

      <nav
        className="admin-sidebar__navigation"
        aria-label="Administrator navigation"
      >
        {navigation.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            title={collapsed ? label : undefined}
            aria-label={label}
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`
            }
          >
            <Icon size={22} aria-hidden="true" />
            <span className="admin-sidebar__label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__bottom">
        <Link
          to="/"
          className="admin-sidebar__control"
          aria-label="View customer site"
          title={collapsed ? 'View customer site' : undefined}
        >
          <ExternalLink size={21} aria-hidden="true" />
          <span className="admin-sidebar__label">View customer site</span>
        </Link>

        {/* Authentication will be implemented in a later sprint. */}
        <button
          type="button"
          className="admin-sidebar__control"
          disabled
          aria-label="Sign out — unavailable until authentication is added"
          title="Sign out will be available when authentication is added"
        >
          <LogOut size={21} aria-hidden="true" />
          <span className="admin-sidebar__label">Sign out</span>
        </button>

        <button
          type="button"
          className="admin-sidebar__control"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : undefined}
        >
          {collapsed ? (
            <ChevronsRight size={22} aria-hidden="true" />
          ) : (
            <ChevronsLeft size={22} aria-hidden="true" />
          )}

          <span className="admin-sidebar__label">Collapse</span>
        </button>
      </div>
    </aside>
  )
}