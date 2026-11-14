import { useEffect, useState } from 'react'
import { Flag, ReceiptText, RotateCcw } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import useAuth from '../../auth/useAuth.js'
import { getOrdersByCustomer } from '../../services/orderService.js'
import { getProducts } from '../../services/productService.js'
import { formatPrice } from '../../utils/cartPricing.js'
import {
  ORDER_CHANNEL_LABELS,
  ORDER_STATUS_LABELS,
  formatOrderDate,
  orderLeaves,
  orderNumber,
} from '../../utils/orderDisplay.js'
import { buildReorderCart, readCart, replaceCart } from '../../utils/reorder.js'
import AccountTabs from './AccountTabs.jsx'
import './OrderHistoryPage.css'

// INST-68: the signed-in customer's past orders, newest first, based on the Figma "Order history" screen.

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'online', label: 'Online' },
  { id: 'in-store', label: 'In-store' },
]

function leavesLabel(order) {
  const { amount, state } = orderLeaves(order)
  if (state === 'none') return 'No leaves earned'
  // Leaves post after pickup, so orders still in progress show them as pending.
  return state === 'earned' ? `+${amount} leaves` : `+${amount} leaves pending`
}

function OrderCard({ order }) {
  const navigate = useNavigate()
  const [notice, setNotice] = useState('')
  const [isReordering, setIsReordering] = useState(false)
  // Set when the cart already has items, so the customer can confirm replacing them.
  const [pendingReorder, setPendingReorder] = useState(null)
  const number = orderNumber(order.id)

  // INST-70: builds a new cart from this order using today's menu.
  async function handleReorder() {
    setNotice('')
    setIsReordering(true)

    try {
      const reorder = buildReorderCart(order, await getProducts())

      if (reorder.cartItems.length === 0) {
        setNotice('None of the items in this order are available right now.')
        return
      }

      const itemsInCart = readCart().reduce((total, item) => total + (Number(item.quantity) || 0), 0)

      if (itemsInCart > 0) {
        setPendingReorder({ ...reorder, itemsInCart })
        return
      }

      finishReorder(reorder)
    } catch {
      setNotice("We couldn't reorder right now. Please try again.")
    } finally {
      setIsReordering(false)
    }
  }

  function finishReorder({ cartItems, unavailableItems, changedOptions }) {
    replaceCart(cartItems)
    // The cart page reads this to explain anything that couldn't be reordered exactly.
    navigate('/cart', {
      state: { reorder: { orderNumber: number, unavailableItems, changedOptions } },
    })
  }

  const details = [
    formatOrderDate(order.createdAt),
    ORDER_CHANNEL_LABELS[order.channel],
    order.pickupLocation?.name,
  ].filter(Boolean)

  return (
    <li className="order-card">
      <div className="order-card-top">
        <div>
          <h2 className="order-card-title">
            Order #{number}
            <span className={`order-status-badge ${order.status}`}>
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
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

        <button
          type="button"
          className="order-action-button primary"
          aria-label={`Reorder order #${number}`}
          disabled={isReordering}
          onClick={handleReorder}
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

      {pendingReorder && (
        <div className="order-card-confirm" role="alertdialog" aria-label="Replace cart">
          <p>
            Your cart has {pendingReorder.itemsInCart}{' '}
            {pendingReorder.itemsInCart === 1 ? 'item' : 'items'}. Replace{' '}
            {pendingReorder.itemsInCart === 1 ? 'it' : 'them'} with this order?
          </p>
          <div>
            <button
              type="button"
              className="order-action-button primary"
              onClick={() => finishReorder(pendingReorder)}
            >
              Replace cart
            </button>
            <button
              type="button"
              className="order-action-button secondary"
              onClick={() => setPendingReorder(null)}
            >
              Keep my cart
            </button>
          </div>
        </div>
      )}

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
