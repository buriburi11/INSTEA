import { useEffect, useState } from 'react'
import { Flag, ReceiptText, RotateCcw } from 'lucide-react'
import { Link } from 'react-router'
import useAuth from '../../auth/useAuth.js'
import { getOrdersByCustomer } from '../../services/orderService.js'
import { calculateTeaLeaves } from '../../data/rewards.js'
import { formatPrice } from '../../utils/cartPricing.js'
import AccountTabs from './AccountTabs.jsx'
import './OrderHistoryPage.css'

// INST-68: the signed-in customer's past orders, newest first, based on the Figma "Order history" screen.

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'online', label: 'Online' },
  { id: 'in-store', label: 'In-store' },
]

const STATUS_LABELS = {
  new: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const CHANNEL_LABELS = { online: 'Online', 'in-store': 'In-store' }

// Times are shown in the store's time zone so every customer sees the same pickup time.
const STORE_TIME_ZONE = 'America/Los_Angeles'

// "ord-1006" -> "1006"
function orderNumber(orderId) {
  return orderId.replace(/^ord-/, '')
}

function formatOrderDate(isoDate) {
  const date = new Date(isoDate)
  const day = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: STORE_TIME_ZONE,
  })
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: STORE_TIME_ZONE,
  })
  return `${day} · ${time}`
}

function leavesLabel(order) {
  if (order.status === 'cancelled' || order.status === 'refunded') {
    return 'No leaves earned'
  }
  const leaves = calculateTeaLeaves(order.subtotal)
  // Leaves post after pickup, so orders still in progress show them as pending.
  return order.status === 'completed' ? `+${leaves} leaves` : `+${leaves} leaves pending`
}

function OrderCard({ order }) {
  const [notice, setNotice] = useState('')
  const number = orderNumber(order.id)

  const details = [
    formatOrderDate(order.createdAt),
    CHANNEL_LABELS[order.channel],
    order.pickupLocation?.name,
  ].filter(Boolean)

  return (
    <li className="order-card">
      <div className="order-card-top">
        <div>
          <h2 className="order-card-title">
            Order #{number}
            <span className={`order-status-badge ${order.status}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </h2>
          <p className="order-card-meta">{details.join(' · ')}</p>
        </div>

        <div className="order-card-total">
          <p className="order-card-price">{formatPrice(order.total)}</p>
          <p className="order-card-leaves">{leavesLabel(order)}</p>
        </div>
      </div>

      <p className="order-card-items">
        {order.items.map((item) => item.productName).join(', ')}
      </p>

      <div className="order-card-actions">
        <Link
          to={`/orders/${order.id}`}
          className="order-action-button secondary"
          aria-label={`View receipt for order #${number}`}
        >
          <ReceiptText size={16} aria-hidden="true" />
          View receipt
        </Link>

        {/* Placeholder: reorder is INST-70. */}
        <button
          type="button"
          className="order-action-button primary"
          aria-label={`Reorder order #${number}`}
          onClick={() => setNotice('Reorder is coming soon.')}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reorder
        </button>

        {/* Placeholder: issue reporting isn't built yet. */}
        <button
          type="button"
          className="order-action-link"
          aria-label={`Report an issue with order #${number}`}
          onClick={() => setNotice('Issue reporting is coming soon.')}
        >
          <Flag size={16} aria-hidden="true" />
          Report an issue
        </button>
      </div>

      {notice && (
        <p className="order-card-notice" role="status">
          {notice}
        </p>
      )}
    </li>
  )
}

export default function OrderHistoryPage() {
  const { customer } = useAuth()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  // `ignore` stops a slow response from updating state after the page unmounts.
  useEffect(() => {
    let ignore = false

    getOrdersByCustomer(customer.id)
      .then((data) => !ignore && setOrders(data))
      .catch(() => !ignore && setError("We couldn't load your orders. Please try again later."))

    return () => {
      ignore = true
    }
  }, [customer.id])

  const visibleOrders = (orders ?? []).filter(
    (order) => filter === 'all' || order.channel === filter,
  )

  function renderContent() {
    if (error) {
      return (
        <p className="order-history-message" role="alert">
          {error}
        </p>
      )
    }

    if (orders === null) {
      return <p className="order-history-message">Loading your orders…</p>
    }

    if (orders.length === 0) {
      return (
        <div className="order-history-empty">
          <h2>No orders yet</h2>
          <p>When you place an order, it will show up here.</p>
          <Link to="/menu" className="order-action-button primary">
            Browse the menu
          </Link>
        </div>
      )
    }

    if (visibleOrders.length === 0) {
      return (
        <p className="order-history-message">
          No {filter === 'online' ? 'online' : 'in-store'} orders yet.
        </p>
      )
    }

    return (
      <ul className="order-list">
        {visibleOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ul>
    )
  }

  return (
    <main className="order-history-page">
      <div className="order-history-container">
        <h1>
          Order <em>history</em>
        </h1>

        <AccountTabs active="Orders" />

        <div className="order-history-body">
          {orders?.length > 0 && (
            <div className="order-filters" role="group" aria-label="Filter orders">
              {FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`order-filter${filter === id ? ' active' : ''}`}
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </main>
  )
}
