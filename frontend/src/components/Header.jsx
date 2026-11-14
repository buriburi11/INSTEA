import { useEffect, useState } from 'react'
import { Bell, Menu, ShoppingBag, X } from 'lucide-react'
import { NavLink } from 'react-router'
import instealogo from '../assets/instea-logo.svg'
import useAuth from '../auth/useAuth.js'
import useNotifications from '../notifications/useNotifications.js'
import './Header.css'

function Header() {
  const { customer, isAuthenticated } = useAuth()
  const { unreadCount } = useNotifications()
  const [menuOpen, setMenuOpen] = useState(false)

  const userInitials = customer
    ? `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`
        .toUpperCase()
    : 'IN'

  const accountPath = isAuthenticated ? '/member' : '/login'

  const getCartCount = () => {
    try {
      const cart = JSON.parse(
        localStorage.getItem('instea-cart') || '[]',
      )

      return Array.isArray(cart)
        ? cart.reduce(
            (total, item) =>
              total + (Number(item.quantity) || 0),
            0,
          )
        : 0
    } catch {
      return 0
    }
  }

  const [cartCount, setCartCount] = useState(getCartCount)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const updateCartCount = () => setCartCount(getCartCount())

    window.addEventListener('storage', updateCartCount)
    window.addEventListener(
      'instea-cart-updated',
      updateCartCount,
    )

    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener(
        'instea-cart-updated',
        updateCartCount,
      )
    }
  }, [])

  return (
    <header className="header">
      <NavLink to="/">
        <img
          src={instealogo}
          alt="INSTEA"
          className="logo"
        />
      </NavLink>

      <nav className="header-nav" aria-label="Primary navigation">
        <NavLink to="/menu">Menu</NavLink>
        <NavLink to="/rewards">Rewards</NavLink>
        <NavLink to="/community">Community</NavLink>
        <NavLink to="/events">Events</NavLink>
        <NavLink to="/locations">Locations</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>

      <div className="header-icons">
        <NavLink
          to="/notifications"
          className="header-notification-link"
          aria-label={`Notifications: ${unreadCount} unread`}
        >
          <Bell
            className="header-side-icons"
            color="#1F3B2E"
            size={26}
          />

          {unreadCount > 0 && (
            <span className="header-notification-count">
              {unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/cart"
          className="header-cart-link"
          aria-label={`Cart with ${cartCount} items`}
        >
          <ShoppingBag
            className="header-side-icons"
            color="#1F3B2E"
            size={26}
          />

          {cartCount > 0 && (
            <span className="header-cart-count">
              {cartCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to={accountPath}
          className="user-initials-icon"
          aria-label={
            isAuthenticated ? 'Customer profile' : 'Customer login'
          }
        >
          {userInitials}
        </NavLink>

        <NavLink to="/menu" className="order-button">
          Order Now
        </NavLink>
      </div>

      <button
        type="button"
        className="mobile-menu-toggle"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <nav
        id="mobile-navigation"
        className="mobile-nav"
        aria-label="Mobile navigation"
        hidden={!menuOpen}
      >
        <NavLink to="/menu" onClick={closeMenu}>
          Menu
        </NavLink>
        <NavLink to="/rewards" onClick={closeMenu}>
          Rewards
        </NavLink>
        <NavLink to="/community" onClick={closeMenu}>
          Community
        </NavLink>
        <NavLink to="/events" onClick={closeMenu}>
          Events
        </NavLink>
        <NavLink to="/locations" onClick={closeMenu}>
          Locations
        </NavLink>
        <NavLink to="/about" onClick={closeMenu}>
          About
        </NavLink>
        <NavLink to={accountPath} onClick={closeMenu}>
          {isAuthenticated ? 'My account' : 'Sign in'}
        </NavLink>
        <NavLink
          to="/menu"
          className="mobile-order-button"
          onClick={closeMenu}
        >
          Order Now
        </NavLink>
      </nav>
    </header>
  )
}

export default Header