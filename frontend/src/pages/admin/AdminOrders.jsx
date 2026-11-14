import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton.jsx'
import AdminFormField from '../../components/admin/AdminFormField.jsx'
import AdminTable from '../../components/admin/AdminTable.jsx'
import { getOrders } from '../../services/orderService.js'
import './AdminOrders.css'

const boardStatuses = [
  { value: 'new', label: 'New', action: 'Accept' },
  { value: 'preparing', label: 'Preparing', action: 'Mark ready' },
  { value: 'ready', label: 'Ready', action: 'Complete' },
  { value: 'completed', label: 'Completed' },
]
const statusLabels = { new: 'New', preparing: 'Preparing', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled', refunded: 'Refunded' }
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function money(value) {
  return Number.isFinite(value) && value >= 0 ? currency.format(value) : 'Unavailable'
}

function pickup(order) {
  const match = typeof order.pickupTime === 'string' && /^(\d{2}):(\d{2})$/.exec(order.pickupTime)
  const hour = match ? Number(match[1]) : -1
  const minute = match ? Number(match[2]) : -1
  const time = hour >= 0 && hour < 24 && minute >= 0 && minute < 60
    ? `${hour % 12 || 12}:${match[2]} ${hour < 12 ? 'AM' : 'PM'}`
    : 'Time unavailable'
  return `${order.pickupDate || 'Date unavailable'} · ${time}`
}

function OrderCard({ order, action, selected, onView }) {
  return (
    <article className={`admin-order-card${selected ? ' admin-order-card--selected' : ''}`} aria-label={`Order ${order.id}`}>
      <div className="admin-order-card-top">
        <button
          type="button"
          className="admin-order-open"
          id={`admin-order-open-${order.id}`}
          onClick={() => onView(order.id)}
          aria-label={`View order ${order.id}`}
          aria-pressed={selected}
          aria-controls="admin-order-details"
        >
          {order.id}
        </button>
        <strong className="admin-order-total">{money(order.total)}</strong>
      </div>
      <p className="admin-order-customer">{order.customerName || 'Guest customer'}</p>
      <p className="admin-order-pickup">Pickup {pickup(order)}</p>
      <ul className="admin-order-preview-items">
        {(order.items ?? []).map((item, index) => (
          <li key={`${item.productId}-${index}`}>{item.quantity} × {item.productName}</li>
        ))}
      </ul>
      {order.specialInstructions && <p className="admin-order-note">{order.specialInstructions}</p>}
      {action && (
        <div className="admin-order-card-actions" aria-describedby="admin-order-actions-note">
          <AdminButton size="compact" disabled>{action}</AdminButton>
          {order.status === 'new' && (
            <AdminButton size="compact" variant="secondary" iconOnly aria-label={`Cancel order ${order.id}`} disabled>
              <X size={16} aria-hidden="true" />
            </AdminButton>
          )}
        </div>
      )}
    </article>
  )
}

function OrderDetails({ order, onClose }) {
  const detailsRef = useRef(null)
  useEffect(() => { detailsRef.current?.focus() }, [order.id])
  const items = order.items ?? []
  return (
    <section ref={detailsRef} tabIndex={-1} className="admin-order-details" id="admin-order-details" aria-labelledby="admin-order-details-heading">
      <header className="admin-order-details-header">
        <div>
          <h2 id="admin-order-details-heading">Order {order.id}</h2>
          <p>{order.customerName || 'Guest customer'} · {order.customerId ? 'Customer account' : 'Guest order'}</p>
        </div>
        <AdminButton variant="secondary" size="compact" iconOnly aria-label="Close order details" onClick={onClose}>
          <X size={16} aria-hidden="true" />
        </AdminButton>
      </header>

      <dl className="admin-order-summary">
        <div><dt>Status</dt><dd>{statusLabels[order.status] || 'Status unavailable'}</dd></div>
        <div><dt>Pickup</dt><dd>{pickup(order)}</dd></div>
        <div><dt>Location</dt><dd>{order.pickupLocation?.name || 'Not provided'}</dd></div>
        <div><dt>Payment status</dt><dd>{order.paymentStatus || 'Not provided'}</dd></div>
      </dl>
      <h3>Items</h3>
      {items.length ? (
        <ul className="admin-order-detail-items">
          {items.map((item, index) => (
            <li key={`${item.productId}-${index}`}>
              <div className="admin-order-item-heading">
                <strong>{item.quantity} × {item.productName}</strong>
                <span>{money(item.totalPrice)}</span>
              </div>
              <p className="admin-order-unit-price">{money(item.unitPrice)} each</p>
              {item.selectedOptions?.length > 0 && (
                <ul className="admin-order-options">
                  {item.selectedOptions.map((option, optionIndex) => (
                    <li key={`${option.name}-${optionIndex}`}>{option.name}: {option.value}</li>
                  ))}
                </ul>
              )}
              {item.specialInstructions && <p className="admin-order-note">Item note: {item.specialInstructions}</p>}
            </li>
          ))}
        </ul>
      ) : <p>No item information available.</p>}
      {order.specialInstructions && <p className="admin-order-note">Order note: {order.specialInstructions}</p>}
      <dl className="admin-order-totals">
        <div><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
        <div><dt>Estimated tax</dt><dd>{money(order.estimatedTax)}</dd></div>
        <div><dt>Total</dt><dd>{money(order.total)}</dd></div>
      </dl>
      <AdminFormField as="select" label="Change order status" value={order.status || ''} disabled hint="Status changes are not available in this preview.">
        {!Object.hasOwn(statusLabels, order.status) && <option value={order.status || ''}>Status unavailable</option>}
        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </AdminFormField>
    </section>
  )
}

export default function AdminOrders() {
  const [request, setRequest] = useState({ status: 'loading', orders: [], error: '' })
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let ignore = false
    getOrders()
      .then((data) => {
        if (data !== null && !Array.isArray(data)) throw new Error('Invalid orders response')
        if (!ignore) setRequest({ status: 'ready', orders: data ?? [], error: '' })
      })
      .catch(() => {
        if (!ignore) setRequest({ status: 'error', orders: [], error: 'We couldn’t load orders. Please try again.' })
      })
    return () => { ignore = true }
  }, [attempt])

  const search = query.trim().toLowerCase()
  const visibleOrders = request.orders.filter((order) =>
    [order.id, order.customerName].some((value) => String(value ?? '').toLowerCase().includes(search)),
  )
  const otherOrders = visibleOrders.filter((order) => !boardStatuses.some((status) => status.value === order.status))
  const selectedOrder = visibleOrders.find((order) => order.id === selectedId)
  const otherColumns = [
    { key: 'id', label: 'Order', render: (order) => (
      <AdminButton id={`admin-order-open-${order.id}`} variant="secondary" size="compact" aria-label={`View order ${order.id}`} onClick={() => setSelectedId(order.id)}>{order.id}</AdminButton>
    ) },
    { key: 'customerName', label: 'Customer', render: (order) => order.customerName || 'Guest customer' },
    { key: 'pickup', label: 'Pickup', render: pickup },
    { key: 'total', label: 'Total', align: 'right', render: (order) => money(order.total) },
    { key: 'status', label: 'Status', render: (order) => statusLabels[order.status] || 'Status unavailable' },
  ]

  function retry() {
    setSelectedId(null)
    setRequest({ status: 'loading', orders: [], error: '' })
    setAttempt((previous) => previous + 1)
  }

  return (
    <section className="admin-orders" aria-labelledby="admin-orders-heading">
      <header className="admin-orders-header">
        <h1 id="admin-orders-heading">Orders</h1>
        <AdminFormField
          type="search"
          label="Search orders"
          hideLabel
          placeholder="Search order # or customer"
          value={query}
          disabled={request.status !== 'ready'}
          onChange={(event) => { setQuery(event.target.value); setSelectedId(null) }}
        />
      </header>
      <p className="admin-orders-preview-note" id="admin-order-actions-note">Status changes are not available in this preview. Select an order number to view its details.</p>

      {request.status === 'loading' && <p className="admin-orders-message" role="status">Loading orders…</p>}
      {request.status === 'error' && (
        <div className="admin-orders-message">
          <p role="alert">{request.error}</p>
          <AdminButton variant="secondary" onClick={retry}>Try again</AdminButton>
        </div>
      )}
      {request.status === 'ready' && visibleOrders.length === 0 && (
        <div className="admin-orders-message">
          <p role="status">{request.orders.length ? 'No orders match your search.' : 'No orders yet.'}</p>
          {query && <AdminButton variant="secondary" size="compact" onClick={() => setQuery('')}>Clear search</AdminButton>}
        </div>
      )}
      {request.status === 'ready' && visibleOrders.length > 0 && (
        <>
          <div className="admin-orders-board">
            {boardStatuses.map((status) => {
              const statusOrders = visibleOrders.filter((order) => order.status === status.value)
              return (
                <section className="admin-orders-column" key={status.value} aria-labelledby={`orders-${status.value}-heading`}>
                  <header>
                    <h2 id={`orders-${status.value}-heading`}>{status.label}</h2>
                    <span className="admin-orders-count" aria-label={`${statusOrders.length} ${status.label.toLowerCase()} orders`}>{statusOrders.length}</span>
                  </header>
                  <ul className="admin-orders-list" aria-label={`${status.label} orders`}>
                    {statusOrders.map((order) => (
                      <li key={order.id}>
                        <OrderCard order={order} action={status.action} selected={selectedId === order.id} onView={setSelectedId} />
                      </li>
                    ))}
                    {statusOrders.length === 0 && <li className="admin-orders-column-empty">No {status.label.toLowerCase()} orders.</li>}
                  </ul>
                </section>
              )
            })}
          </div>
          {otherOrders.length > 0 && <AdminTable caption="Other orders" columns={otherColumns} rows={otherOrders} />}
        </>
      )}
      {selectedOrder && <OrderDetails order={selectedOrder} onClose={() => {
        setSelectedId(null)
        document.getElementById(`admin-order-open-${selectedId}`)?.focus()
      }} />}
    </section>
  )
}
