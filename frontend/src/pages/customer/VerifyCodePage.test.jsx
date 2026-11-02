import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthContext } from '../../auth/AuthContext.js'
import VerifyCodePage from './VerifyCodePage.jsx'

const customer = { id: 'cust-1', firstName: 'Alex', email: 'alex.rivera@example.com', phone: '' }
const sentToEmail = { method: 'email', display: 'a***@example.com' }

// Renders /verify/code with a fake signed-in customer and the navigation state /verify passes along.
function renderCode({ signedIn = true, sentTo = sentToEmail } = {}) {
  return render(
    <AuthContext.Provider value={{ customer: signedIn ? customer : null }}>
      <MemoryRouter initialEntries={[{ pathname: '/verify/code', state: sentTo ? { sentTo } : null }]}>
        <Routes>
          <Route path="/verify/code" element={<VerifyCodePage />} />
          <Route path="/verify" element={<p>Choose method page</p>} />
          <Route path="/register" element={<p>Register page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

function typeCode(code) {
  code.split('').forEach((digit, index) => {
    fireEvent.change(screen.getByLabelText(`Digit ${index + 1}`), { target: { value: digit } })
  })
}

const verifyButton = () => screen.getByRole('button', { name: 'Verify' })

describe('VerifyCodePage', () => {
  it('shows six code boxes for the chosen method', () => {
    renderCode()
    expect(screen.getByRole('heading', { name: 'Verify your email' })).toBeInTheDocument()
    expect(screen.getByText('a***@example.com')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/^Digit \d$/)).toHaveLength(6)
  })

  it('says phone when text was chosen', () => {
    renderCode({ sentTo: { method: 'sms', display: '(***) ***-0102' } })
    expect(screen.getByRole('heading', { name: 'Verify your phone' })).toBeInTheDocument()
  })

  it('shows an error for an empty code', () => {
    renderCode()
    fireEvent.click(verifyButton())
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your 6-digit code.')
  })

  it('shows an error for an incomplete code', () => {
    renderCode()
    typeCode('123')
    fireEvent.click(verifyButton())
    expect(screen.getByRole('alert')).toHaveTextContent('Code must be 6 digits.')
  })

  it('ignores letters', () => {
    renderCode()
    fireEvent.change(screen.getByLabelText('Digit 1'), { target: { value: 'a' } })
    expect(screen.getByLabelText('Digit 1')).toHaveValue('')
  })

  it('fills every box when a full code is pasted', () => {
    renderCode()
    fireEvent.paste(screen.getByLabelText('Digit 1'), { clipboardData: { getData: () => '123456' } })
    expect(screen.getByLabelText('Digit 6')).toHaveValue('6')
  })

  it('shows failure feedback for a wrong code', () => {
    renderCode()
    typeCode('654321')
    fireEvent.click(verifyButton())
    expect(screen.getByRole('alert')).toHaveTextContent('That code is incorrect. Try again.')
  })

  it('shows success feedback for the demo code', () => {
    renderCode()
    typeCode('123456')
    fireEvent.click(verifyButton())
    expect(screen.getByRole('heading', { name: 'Account verified' })).toBeInTheDocument()
  })

  it('confirms when a code is resent', () => {
    renderCode()
    fireEvent.click(screen.getByRole('button', { name: 'Resend code' }))
    expect(screen.getByRole('status')).toHaveTextContent('A new code has been sent to a***@example.com.')
  })

  it('sends visitors back to /verify if no method was chosen', () => {
    renderCode({ sentTo: null })
    expect(screen.getByText('Choose method page')).toBeInTheDocument()
  })

  it('sends signed-out visitors to register', () => {
    renderCode({ signedIn: false })
    expect(screen.getByText('Register page')).toBeInTheDocument()
  })
})
