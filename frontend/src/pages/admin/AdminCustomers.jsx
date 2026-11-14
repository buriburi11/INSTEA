import { useEffect, useState } from 'react'
import { Gift, KeyRound, UserRoundCheck, UserRoundX } from 'lucide-react'
import AdminTable from '../../components/admin/AdminTable.jsx'
import AdminFormField from '../../components/admin/AdminFormField.jsx'
import AdminButton from '../../components/admin/AdminButton.jsx'
import { getCustomers } from '../../services/customerService.js'
import useAdminPermissions from '../../auth/useAdminPermissions.js'
import './AdminCustomers.css'

function customerName(customer) {
  return [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Unnamed customer'
}

function formatPoints(value) {
  return Number.isFinite(value) && value >= 0 ? value.toLocaleString() : 'Unavailable'
}

function tierLabel(tier) {
  return typeof tier === 'string' && tier ? tier[0].toUpperCase() + tier.slice(1) : 'Not available'
}

function CustomerStatus({ status }) {
  const label = status === 'active' ? 'Active' : status === 'deactivated' ? 'Deactivated' : 'Unknown'
  return <span className={`admin-customer-status admin-customer-status--${label.toLowerCase()}`}>{label}</span>
}

export default function AdminCustomers() {
  const { can } = useAdminPermissions()
  const [request, setRequest] = useState({ status: 'loading', customers: [], error: '' })
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let ignore = false

    getCustomers()
      .then((data) => {
        if (data !== null && !Array.isArray(data)) throw new Error('Invalid customer response')
        if (!ignore) setRequest({ status: 'ready', customers: data ?? [], error: '' })
      })
      .catch(() => {
        if (!ignore) setRequest({ status: 'error', customers: [], error: 'We couldn’t load customer accounts. Please try again.' })
      })

    return () => { ignore = true }
  }, [attempt])

  const search = query.trim().toLowerCase()
  const visibleCustomers = request.customers.filter((customer) => {
    const matchesStatus = statusFilter === 'all' || customer.accountStatus === statusFilter
    const matchesQuery = [customerName(customer), customer.email, customer.phone, customer.memberNumber, customer.id]
      .some((value) => String(value ?? '').toLowerCase().includes(search))
    return matchesStatus && matchesQuery
  })
  // Keep details tied to a visible account when searching or changing the filter.
  const selectedCustomer = visibleCustomers.find((customer) => customer.id === selectedId) ?? visibleCustomers[0] ?? null

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (customer) => (
        <button
          type="button"
          className="admin-customer-select"
          onClick={() => setSelectedId(customer.id)}
          aria-label={`View ${customerName(customer)}`}
          aria-pressed={selectedCustomer?.id === customer.id}
          aria-controls="admin-customer-details"
        >
          <span className="admin-customer-avatar" aria-hidden="true">
            {[customer.firstName?.[0], customer.lastName?.[0]].filter(Boolean).join('') || '?'}
          </span>
          <span className="admin-customer-identity">
            <strong>{customerName(customer)}</strong>
            <span>{customer.memberNumber || customer.id}{customer.email ? ` · ${customer.email}` : ''}</span>
          </span>
        </button>
      ),
    },
    {
      key: 'rewardLeaves',
      label: 'Tea Leaves / tier',
      align: 'right',
      render: (customer) => (
        <div className="admin-customer-balance">
          <strong>{formatPoints(customer.rewardLeaves)}</strong>
          <span>{tierLabel(customer.membershipTier)}</span>
        </div>
      ),
    },
    { key: 'accountStatus', label: 'Status', align: 'right', render: (customer) => <CustomerStatus status={customer.accountStatus} /> },
  ]

  function retry() {
    setRequest({ status: 'loading', customers: [], error: '' })
    setAttempt((previous) => previous + 1)
  }

  return (
    <section className="admin-customers" aria-labelledby="admin-customers-title">
      <h1 id="admin-customers-title">Customers</h1>
      <div className="admin-customers-toolbar">
        <AdminFormField
          type="search"
          label="Search customer accounts"
          hideLabel
          placeholder="Search by name, email, phone or member #"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={request.status !== 'ready'}
        />
        <AdminFormField
          as="select"
          label="Filter by account status"
          hideLabel
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          disabled={request.status !== 'ready'}
        >
          <option value="all">All account statuses</option>
          <option value="active">Active</option>
          <option value="deactivated">Deactivated</option>
        </AdminFormField>
      </div>

      {request.status === 'ready' && (
        <div className="admin-customers-results">
          <p aria-live="polite">{visibleCustomers.length} {visibleCustomers.length === 1 ? 'account' : 'accounts'}</p>
          {(query || statusFilter !== 'all') && (
            <AdminButton variant="secondary" size="compact" onClick={() => { setQuery(''); setStatusFilter('all') }}>
              Clear filters
            </AdminButton>
          )}
        </div>
      )}

      <div className="admin-customers-list">
        <AdminTable
          caption="Customer accounts"
          hideCaption
          columns={columns}
          rows={visibleCustomers}
          loading={request.status === 'loading'}
          loadingMessage="Loading customer accounts…"
          error={request.error}
          emptyMessage={request.customers.length ? 'No customers match your search or filter.' : 'No customer accounts yet.'}
        />
      </div>
      {request.status === 'error' && <AdminButton variant="secondary" onClick={retry}>Try again</AdminButton>}

      {selectedCustomer && (
        <section className="admin-customer-details" id="admin-customer-details" aria-labelledby="customer-details-heading">
          <header className="admin-customer-details-header">
            <div>
              <h2 id="customer-details-heading">{customerName(selectedCustomer)}</h2>
              <p>{selectedCustomer.memberNumber || 'No membership number'} · {selectedCustomer.email || 'No email provided'}</p>
            </div>
            <CustomerStatus status={selectedCustomer.accountStatus} />
          </header>

          <dl className="admin-customer-summary">
            <div><dt>Tea Leaves</dt><dd>{formatPoints(selectedCustomer.rewardLeaves)}</dd></div>
            <div><dt>Membership tier</dt><dd>{tierLabel(selectedCustomer.membershipTier)}</dd></div>
            <div><dt>Phone</dt><dd>{selectedCustomer.phone || 'Not provided'}</dd></div>
          </dl>
          <dl className="admin-customer-account-info">
            <div><dt>Customer ID</dt><dd>{selectedCustomer.id}</dd></div>
            <div><dt>Email</dt><dd>{selectedCustomer.email || 'Not provided'}</dd></div>
          </dl>

          <div className="admin-customer-management">
            <h3>Account management</h3>
            <p id="customer-management-note">Account management actions are not available in this preview.</p>
            {can('loyalty.adjust') && <fieldset disabled aria-describedby="customer-management-note">
              <legend>Adjust Tea Leaves</legend>
              <div className="admin-customer-adjustment">
                <AdminFormField label="Adjustment amount" type="number" placeholder="+50" />
                <AdminFormField label="Adjustment reason" placeholder="Reason for adjustment" required />
              </div>
              <AdminButton className="admin-customer-review" disabled>Review adjustment</AdminButton>
            </fieldset>}
            <div className="admin-customer-actions" aria-describedby="customer-management-note">
              {can('loyalty.manage') && <AdminButton variant="secondary" size="compact" disabled><Gift size={16} aria-hidden="true" /> Issue reward</AdminButton>}
              <AdminButton variant="secondary" size="compact" disabled><KeyRound size={16} aria-hidden="true" /> Reset access</AdminButton>
              <AdminButton variant="danger" size="compact" disabled>
                {selectedCustomer.accountStatus === 'deactivated'
                  ? <><UserRoundCheck size={16} aria-hidden="true" /> Reactivate account</>
                  : <><UserRoundX size={16} aria-hidden="true" /> Deactivate account</>}
              </AdminButton>
            </div>
          </div>
        </section>
      )}
    </section>
  )
}
