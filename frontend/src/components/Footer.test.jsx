import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Footer from './Footer.jsx'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  it('renders the section headings', () => {
    renderFooter()
    expect(screen.getByRole('heading', { name: 'Visit' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Members' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Policies' })).toBeInTheDocument()
  })

  it('links navigation items to their routes', () => {
    renderFooter()
    expect(screen.getByRole('link', { name: 'Menu' })).toHaveAttribute('href', '/menu')
    expect(screen.getByRole('link', { name: 'Staff Portal' })).toHaveAttribute('href', '/staff_portal')
  })

  it('opens social links in a new tab safely', () => {
    renderFooter()
    const instagram = screen.getByRole('link', { name: 'Instagram' })
    expect(instagram).toHaveAttribute('href', 'https://www.instagram.com/instea_official/')
    expect(instagram).toHaveAttribute('target', '_blank')
    expect(instagram).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows the app name from the environment config', () => {
    renderFooter()
    expect(screen.getByText(/© 2026 INSTEA\. All rights reserved\./)).toBeInTheDocument()
  })
})
