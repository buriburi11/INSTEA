import { useState } from 'react'
import {
  Flag,
  ReceiptText,
  RotateCcw,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import useAuth from '../../auth/useAuth.js'
import { orders } from '../../data/orders.js'
import { calculateTeaLeaves } from '../../data/rewards.js'
import './OrderHistoryPage.css'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const channelOverrides = {
  'ord-1006': 'online',
  'ord-1003': 'in-store',
}

const statusLabels = {
  new: 'Order received',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export default function OrderHistoryPage() {
  const { customer } = useAuth()
  const navigate = useNavigate()

  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [reportedOrderId, setReportedOrderId] = useState(null)

  const memberOrders = orders
    .filter((order) => order.customerId === customer.id)
    .map((order, index) => ({
      ...order,
      orderChannel:
        channelOverrides[order.id] ??
        (index % 2 === 0 ? 'online' : 'in-store'),
    }))

  const visibleOrders =
    activeFilter === 'all'
      ? memberOrders
      : memberOrders.filter(
          (order) => order.orderChannel === activeFilter,
        )

  function reorder(order) {
    const firstItem = order.items[0]

    if (firstItem) {
      navigate(`/menu/${firstItem.productId}`)
    }
  }

  return (
    <main className="order-history-page">
      <div
        className="order-history-filters"
        aria-label="Filter order history"
      >
        <button
          type="button"
          className={activeFilter === 'all' ? 'active' : ''}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>

        <button
          type="button"
          className={activeFilter === 'online' ? 'active' : ''}
          onClick={() => setActiveFilter('online')}
        >
          Online
        </button>

        <button
          type="button"
          className={activeFilter === 'in-store' ? 'active' : ''}
          onClick={() => setActiveFilter('in-store')}
        >
          In-store
        </button>
      </div>

      <section
        className="order-history-list"
        aria-label="Previous orders"
      >
        {visibleOrders.map((order) => {
          const orderNumber = order.id.replace('ord-', '')
          const leaves = calculateTeaLeaves(order.subtotal)
          const earnsLeaves = !['cancelled', 'refunded'].includes(
            order.status,
          )

          return (
            <article key={order.id} className="order-history-card">
              <div className="order-history-summary">
                <div>
                  <div className="order-history-title">
                    <h2>Order #{orderNumber}</h2>

                    <span
                      className={`order-status-label ${order.status}`}
                    >
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </div>

                  <p>
                    {formatDate(order.createdAt)} ·{' '}
                    {order.orderChannel === 'online'
                      ? 'Online'
                      : 'In-store'}{' '}
                    · {order.pickupLocation?.name ?? 'INSTEA'}
                  </p>

                  <strong className="order-history-items">
                    {order.items
                      .map((item) =>
                        item.quantity > 1
                          ? `${item.quantity}× ${item.productName}`
                          : item.productName,
                      )
                      .join(', ')}
                  </strong>
                </div>

                <div className="order-history-total">
                  <strong>{currency.format(order.total)}</strong>

                  <span
                    className={
                      earnsLeaves ? 'earned' : 'not-earned'
                    }
                  >
                    {earnsLeaves
                      ? `+${leaves} ${
                          order.status === 'completed'
                            ? 'leaves'
                            : 'pending leaves'
                        }`
                      : 'No leaves earned'}
                  </span>
                </div>
              </div>

              <div className="order-history-actions">
                <button
                  type="button"
                  className="order-outline-button"
                  onClick={() => setSelectedReceipt(order)}
                >
                  <ReceiptText size={17} aria-hidden="true" />
                  View receipt
                </button>

                <button
                  type="button"
                  className="order-primary-button"
                  onClick={() => reorder(order)}
                >
                  <RotateCcw size={17} aria-hidden="true" />
                  Reorder
                </button>

                <button
                  type="button"
                  className="order-report-button"
                  onClick={() => setReportedOrderId(order.id)}
                >
                  <Flag size={17} aria-hidden="true" />
                  Report an issue
                </button>
              </div>

              {reportedOrderId === order.id && (
                <div className="order-report-feedback" role="status">
                  Your mock issue request for Order #{orderNumber} has
                  been recorded. Customer support is not connected yet.

                  <button
                    type="button"
                    aria-label="Dismiss issue message"
                    onClick={() => setReportedOrderId(null)}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </article>
          )
        })}

        {visibleOrders.length === 0 && (
          <div className="order-history-empty">
            <ReceiptText size={34} aria-hidden="true" />
            <h2>No orders found</h2>
            <p>
              You do not have any {activeFilter.replace('-', ' ')}{' '}
              orders yet.
            </p>

            <button
              type="button"
              onClick={() => navigate('/menu')}
            >
              Browse the menu
            </button>
          </div>
        )}
      </section>

      {selectedReceipt && (
        <ReceiptModal
          order={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </main>
  )
}

function ReceiptModal({ order, onClose }) {
  const orderNumber = order.id.replace('ord-', '')

  return (
    <div
      className="receipt-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      onClick={onClose}
    >
      <section
        className="receipt-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="receipt-modal-close"
          aria-label="Close receipt"
          onClick={onClose}
        >
          <X size={21} />
        </button>

        <p className="receipt-eyebrow">INSTEA receipt</p>
        <h2 id="receipt-modal-title">Order #{orderNumber}</h2>

        <p className="receipt-order-information">
          {formatDate(order.createdAt)} ·{' '}
          {order.pickupLocation?.name ?? 'INSTEA'}
        </p>

        <div className="receipt-items">
          {order.items.map((item, index) => (
            <div
              key={`${item.productId}-${index}`}
              className="receipt-item"
            >
              <span>
                <strong>
                  {item.quantity}× {item.productName}
                </strong>

                {item.selectedOptions?.length > 0 && (
                  <small>
                    {item.selectedOptions
                      .map((option) => option.value)
                      .join(' · ')}
                  </small>
                )}
              </span>

              <strong>{currency.format(item.totalPrice)}</strong>
            </div>
          ))}
        </div>

        <dl className="receipt-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{currency.format(order.subtotal)}</dd>
          </div>

          <div>
            <dt>Estimated tax</dt>
            <dd>{currency.format(order.estimatedTax)}</dd>
          </div>

          <div className="receipt-total-row">
            <dt>Total</dt>
            <dd>{currency.format(order.total)}</dd>
          </div>
        </dl>

        <p className="receipt-payment-status">
          Payment status: {order.paymentStatus}
        </p>
      </section>
    </div>
  )
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue))
}