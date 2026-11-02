import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthContext } from '../../auth/AuthContext.js'
import VerifyPage from './VerifyPage.jsx'

// Renders /verify with a fake signed-in customer (or none) instead of going through AuthProvider.
function renderVerify(customer, state) {
  return render(
    <AuthContext.Provider value={{ customer }}>
      <MemoryRouter initialEntries={[{ pathname: '/verify', state }]}>
        <Routes>
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/register" element={<p>Register page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

const emailCustomer = { id: 'cust-1', firstName: 'Alex', email: 'alex.rivera@example.com', phone: '' }
const phoneCustomer = { id: 'cust-2', firstName: 'Jordan', email: '', phone: '(916) 555-0102' }

describe('VerifyPage', () => {
  it('shows both email and text options', () => {
    renderVerify(emailCustomer)
    expect(screen.getByRole('radio', { name: /Email/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Text message/ })).toBeInTheDocument()
  })

  it('preselects the method the customer signed up with and masks it', () => {
    renderVerify(phoneCustomer)
    expect(screen.getByRole('radio', { name: /Text message/ })).toBeChecked()
    expect(screen.getByText('(***) ***-0102')).toBeInTheDocument()
  })

  it('reflects a new selection in the UI', () => {
    renderVerify(emailCustomer)
    fireEvent.click(screen.getByRole('radio', { name: /Text message/ }))
    expect(screen.getByRole('radio', { name: /Text message/ })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Send code by text' })).toBeInTheDocument()
    // No phone on file, so the customer is asked for one.
    expect(screen.getByLabelText(/Phone number/)).toBeInTheDocument()
  })

  it('rejects an invalid phone number', () => {
    renderVerify(emailCustomer)
    fireEvent.click(screen.getByRole('radio', { name: /Text message/ }))
    fireEvent.change(screen.getByLabelText(/Phone number/), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send code by text' }))
    expect(screen.getByText('Enter a valid phone number.')).toBeInTheDocument()
  })

  it('confirms a mock code was sent to the chosen method', () => {
    renderVerify(emailCustomer)
    fireEvent.click(screen.getByRole('button', { name: 'Send code by email' }))
    expect(screen.getByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    expect(screen.getByText('a***@example.com')).toBeInTheDocument()
  })

  it('shows the welcome message right after registering', () => {
    renderVerify(emailCustomer, { justRegistered: true })
    expect(screen.getByText(/100 welcome leaves/)).toBeInTheDocument()
  })

  it('sends signed-out visitors to register', () => {
    renderVerify(null)
    expect(screen.getByText('Register page')).toBeInTheDocument()
  })
})
