import { Link } from 'react-router'
import logo from '../../assets/instea-logo.svg'
import authImage from '../../assets/INSTEA HOME PLACEHOLDER.jpg'
import './AuthPages.css'

export default function AuthLayout({ children }) {
  return (
    <main className="customer-auth-shell">
      <section
        className="customer-auth-image"
        style={{ backgroundImage: `url("${authImage}")` }}
        aria-label="INSTEA drinks"
      >
        <div className="customer-auth-image-overlay" />

        <blockquote>
          “Every cup begins with inspiration.”
          <cite>INSTEA — Inspiration of Tea</cite>
        </blockquote>
      </section>

      <section className="customer-auth-panel">
        <header className="customer-auth-header">
          <Link to="/" aria-label="Return to INSTEA home">
            <img src={logo} alt="INSTEA" />
          </Link>

          <Link to="/" className="customer-auth-guest">
            Continue as guest
          </Link>
        </header>

        <div className="customer-auth-content">{children}</div>
      </section>
    </main>
  )
}