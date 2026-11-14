import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { customers } from '../../data/customers.js'
import { getCustomers } from '../../services/customerService.js'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import AdminCustomers from './AdminCustomers.jsx'

vi.mock('../../services/customerService.js', () => ({ getCustomers: vi.fn() }))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/customers']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="customers" element={<AdminCustomers />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getCustomers.mockResolvedValue(customers)
})

describe('admin customer accounts', () => {
  it('loads and displays customer identities, membership information, points, and status', async () => {
    renderPage()
    expect(await screen.findByRole('button', { name: 'View Alex Rivera' })).toBeInTheDocument()
    const table = within(screen.getByRole('table', { name: 'Customer accounts' }))
    for (const customer of customers) {
      expect(table.getByRole('button', { name: `View ${customer.firstName} ${customer.lastName}` })).toBeInTheDocument()
      expect(table.getByText(`${customer.memberNumber} · ${customer.email}`)).toBeInTheDocument()
    }
    expect(table.getAllByText('Active')).toHaveLength(3)
    expect(table.getByText('Deactivated')).toBeInTheDocument()
    expect(table.getByText('0')).toBeInTheDocument()
    expect(getCustomers).toHaveBeenCalledOnce()
  })

  it('opens the selected account details and exposes safe management placeholders', async () => {
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'View Jordan Kim' }))
    const detail = within(screen.getByRole('region', { name: 'Jordan Kim' }))
    expect(detail.getByText('cust-jordan-kim')).toBeInTheDocument()
    expect(detail.getByText('(916) 555-0102')).toBeInTheDocument()
    expect(detail.getByText('340')).toBeInTheDocument()
    expect(detail.getByText('Account management actions are not available in this preview.')).toBeInTheDocument()
    for (const name of ['Review adjustment', 'Issue reward', 'Reset access', 'Deactivate account']) {
      expect(detail.getByRole('button', { name })).toBeDisabled()
    }
    expect(detail.getByRole('spinbutton', { name: 'Adjustment amount' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'View Jordan Kim' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('finds accounts by name, email, membership number, phone, and customer ID', async () => {
    renderPage()
    await screen.findByRole('button', { name: 'View Jordan Kim' })
    const search = screen.getByRole('searchbox', { name: 'Search customer accounts' })
    const table = within(screen.getByRole('table', { name: 'Customer accounts' }))
    for (const query of ['  JORDAN KIM  ', 'jordan.kim@example.com', 'INS-100002', '(916) 555-0102', 'cust-jordan-kim']) {
      fireEvent.change(search, { target: { value: query } })
      expect(table.getByRole('button', { name: 'View Jordan Kim' })).toBeInTheDocument()
      expect(table.queryByRole('button', { name: 'View Alex Rivera' })).not.toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Jordan Kim' })).toBeInTheDocument()
    }
  })

  it('filters deactivated accounts and correctly shows zero points and missing contact details', async () => {
    renderPage()
    await screen.findByRole('button', { name: 'View Alex Rivera' })
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by account status' }), { target: { value: 'deactivated' } })
    expect(screen.queryByRole('button', { name: 'View Alex Rivera' })).not.toBeInTheDocument()
    const detail = within(screen.getByRole('region', { name: 'Taylor Brooks' }))
    expect(detail.getByText('0')).toBeInTheDocument()
    expect(detail.getByText('Not provided')).toBeInTheDocument()
    expect(detail.getByRole('button', { name: 'Reactivate account' })).toBeDisabled()
    expect(screen.queryByRole('region', { name: 'Alex Rivera' })).not.toBeInTheDocument()
  })

  it('shows no matches without stale details and lets the administrator clear filters', async () => {
    renderPage()
    await screen.findByRole('button', { name: 'View Alex Rivera' })
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'not-a-customer' } })
    expect(screen.getByRole('status')).toHaveTextContent('No customers match your search or filter.')
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByRole('button', { name: 'View Alex Rivera' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Alex Rivera' })).toBeInTheDocument()
  })

  it('provides a loading state and disables filters until the response arrives', () => {
    getCustomers.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status')).toHaveTextContent('Loading customer accounts…')
    expect(screen.getByRole('searchbox')).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Filter by account status' })).toBeDisabled()
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })

  it.each([{ data: [], label: 'empty list' }, { data: null, label: 'missing list' }])(
    'provides an empty state for an $label', async ({ data }) => {
      getCustomers.mockResolvedValue(data)
      renderPage()
      expect(await screen.findByText('No customer accounts yet.')).toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
    },
  )

  it('shows service errors and allows a successful retry', async () => {
    getCustomers.mockRejectedValueOnce(new Error('Network error'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load customer accounts.')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('button', { name: 'View Alex Rivera' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(getCustomers).toHaveBeenCalledTimes(2)
  })

  it('treats an invalid service response as an error instead of crashing', async () => {
    getCustomers.mockResolvedValue({ unexpected: true })
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load customer accounts.')
  })
})
