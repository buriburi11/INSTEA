import { useEffect, useState } from 'react'
import { ChevronLeft, Leaf } from 'lucide-react'
import { Link, useParams } from 'react-router'
import useAuth from '../../auth/useAuth.js'
import { getOrderById } from '../../services/orderService.js'
import OrderStatus from '../../components/orders/OrderStatus.jsx'
import { formatPrice } from '../../utils/cartPricing.js'
import {
  ORDER_CHANNEL_LABELS,
  formatOrderDate,
  orderLeaves,
  orderNumber,
} from '../../utils/orderDisplay.js'
import './OrderHistoryPage.css'
import './OrderDetailPage.css'

// INST-69: one past order's products and details ("View receipt" on /orders),
// styled after the receipt and status cards on the Figma "Order confirmation" screen.

// Turns an item's chosen options into short text, e.g. "Large (16 oz) · Iced · 50% sweet · Oat milk".
function describeOptions(selectedOptions = []) {
  return selectedOptions
    .map(({ name, value }) => {
      if (name === 'Sweetness') return `${value} sweet`
      if (name === 'Milk') return `${value} milk`
      return value
    })
    .join(' · ')
}

// "2026-10-18" + "09:30" -> "Oct 18, 2026 · 9:30 AM"
function formatPickup(date, time) {
  if (!date) return 'Not specified'
  const day = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  if (!time) return day
  const clock = new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${day} · ${clock}`
}

function LeavesTile({ order }) {
  const { amount, state } = orderLeaves(order)

  const text = {
    earned: { value: `+${amount}`, label: 'Tea Leaves earned' },
    pending: { value: `+${amount}`, label: 'Tea Leaves pending' },
    none: { value: '0', label: 'No Tea Leaves earned for this order' },
  }[state]

  return (
    <div className="order-detail-leaves">
      <Leaf size={20} aria-hidden="true" />
      <strong>{text.value}</strong>
      <span>{text.label}</span>
    </div>
  )
}

function BackLink() {
  return (
    <Link to="/orders" className="order-action-link order-detail-back">
      <ChevronLeft size={16} aria-hidden="true" />
      Back to order history
    </Link>
  )
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const { customer } = useAuth()
  // undefined while loading; null if not found
  const [order, setOrder] = useState(undefined)
  const [error, setError] = useState('')

  // `ignore` stops a slow response from updating state after the page unmounts or the order changes.
  useEffect(() => {
    let ignore = false

    getOrderById(orderId)
      .then((data) => {
        if (ignore) return
        // Customers can only see their own orders.
        setOrder(data && data.customerId === customer.id ? data : null)
      })
      .catch(() => !ignore && setError("We couldn't load this order. Please try again later."))

    return () => {
      ignore = true
    }
  }, [orderId, customer.id])

  if (error || order === null || order === undefined) {
    let message = 'Loading your order…'
    if (error) message = error
    else if (order === null) message = "We couldn't find that order."

    return (
      <main className="order-history-page">
        <div className="order-history-container">
          <BackLink />
          <div className="order-history-body">
            <p className="order-history-message" role={error ? 'alert' : undefined}>
              {message}
            </p>
          </div>
        </div>
      </main>
    )
  }

  const number = orderNumber(order.id)
  const placedDetails = [
    formatOrderDate(order.createdAt),
    ORDER_CHANNEL_LABELS[order.channel],
  ].filter(Boolean)
  const totalLabel =
    { paid: 'Total paid', refunded: 'Total refunded' }[order.paymentStatus] ?? 'Total'

  return (
    <main className="order-history-page">
      <div className="order-history-container">
        <BackLink />

        <div className="order-detail-layout">
          <div className="order-detail-main">
            <h1>Order #{number}</h1>
            <p className="order-detail-placed">Placed {placedDetails.join(' · ')}</p>

            <OrderStatus status={order.status} />

            <LeavesTile order={order} />
          </div>

          <aside className="order-detail-receipt" aria-label="Receipt">
            <h2>Receipt</h2>

            <dl className="order-detail-rows">
              <div>
                <dt>Order</dt>
                <dd>#{number}</dd>
              </div>
              <div>
                <dt>Store</dt>
                <dd>{order.pickupLocation?.name ?? 'INSTEA'}</dd>
              </div>
              <div>
                <dt>Pickup</dt>
                <dd>{formatPickup(order.pickupDate, order.pickupTime)}</dd>
              </div>
            </dl>

            <ul className="order-detail-items">
              {order.items.map((item, index) => (
                <li key={`${item.productId}-${index}`}>
                  <div className="order-detail-item-line">
                    <span>
                      {item.quantity} × {item.productName}
                    </span>
                    <span>{formatPrice(item.totalPrice)}</span>
                  </div>

                  {item.selectedOptions?.length > 0 && (
                    <p className="order-detail-item-options">
                      {describeOptions(item.selectedOptions)}
                    </p>
                  )}

                  {item.specialInstructions && (
                    <p className="order-detail-item-note">
                      Note: {item.specialInstructions}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            {order.specialInstructions && (
              <p className="order-detail-item-note">Note: {order.specialInstructions}</p>
            )}

            <dl className="order-detail-rows order-detail-subtotals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div>
                <dt>Estimated tax</dt>
                <dd>{formatPrice(order.estimatedTax)}</dd>
              </div>
            </dl>

            <div className="order-detail-total">
              <span>{totalLabel}</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
