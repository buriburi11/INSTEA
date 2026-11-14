import { ChevronLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import './OrderHistoryPage.css'

// Placeholder for the order detail view (INST-69). "View receipt" on /orders links here.

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const number = orderId.replace(/^ord-/, '')

  return (
    <main className="order-history-page">
      <div className="order-history-container">
        <Link to="/orders" className="order-action-link">
          <ChevronLeft size={16} aria-hidden="true" />
          Back to order history
        </Link>

        <div className="order-history-body">
          <div className="order-history-empty">
            <h1 className="order-card-title">Order #{number}</h1>
            <p>Order details are coming soon.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
