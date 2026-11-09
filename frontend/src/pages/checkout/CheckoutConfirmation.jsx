// =============
//    IMPORTS
// =============
import { useLocation, Navigate, Link } from 'react-router';
import { Check, MapPin } from 'lucide-react';
import './CheckoutConfirmation.css';

// ===========================
//    CHECKOUT CONFIRMATION
// ===========================

function CheckoutConfirmation() {

    const location = useLocation();
    const order = location.state?.order;                                                // Retrieve the demo order passed from Checkout Review.

    if (!order) {
        return <Navigate to="/menu" replace />;                                         // Redirect when no matching order exists.
    }

    const firstName = order.customerName?.split(' ')[0] || 'Guest';

    const formattedTotal = Number(order.total || 0).toFixed(2);

    const formattedPickupDate = order.pickupDate
        ? new Date(`${order.pickupDate}T12:00:00`).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : 'Not specified';

    const formattedPickupTime = order.pickupTime
        ? new Date(`2000-01-01T${order.pickupTime}:00`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        })
        : 'Not specified';

    // ===========================
    //    PAGE CONTENT
    // ===========================

    return (
        <main className="checkout-confirmation-page">

            <div className="checkout-confirmation-layout">

                {/* =========================== */}
                {/*    CONFIRMATION DETAILS     */}
                {/* =========================== */}

                <div className="checkout-confirmation-main">

                    <div className="checkout-confirmation-icon">
                        <Check size={23} aria-hidden="true" />
                    </div>

                    <h1>Thank you, {firstName}.</h1>

                    <p className="checkout-confirmation-subtitle">
                        Demo order {order.id} has been created.
                    </p>

                    <p className="checkout-confirmation-demo-notice">
                        This is a simulated order. No payment was processed
                        and no order was sent to the store.
                    </p>

                    {/* ------- ORDER STATUS ------- */}

                    <section className="checkout-confirmation-status">

                        <span className="checkout-confirmation-eyebrow">
                            Current status
                        </span>

                        <h2>Received</h2>

                        <div className="checkout-confirmation-steps">
                            {['Received', 'Preparing', 'Ready', 'Completed'].map((step, index) => (
                                <div
                                    className={`checkout-confirmation-step ${index === 0 ? 'active' : ''}`}
                                    key={step}
                                >
                                    <span className="checkout-confirmation-step-line" />
                                    <span>{step}</span>
                                </div>
                            ))}
                        </div>

                        <p>
                            This demo order is not being prepared by the store.
                        </p>

                    </section>

                    {/* ------- PICKUP DETAILS ------- */}

                    <section className="checkout-confirmation-pickup">

                        <h2>Pickup details</h2>

                        <p>
                            <strong>{order.pickupLocation?.name || 'Selected location'}</strong>
                        </p>

                        <p>{order.pickupLocation?.address}</p>

                        <p>{formattedPickupDate} · {formattedPickupTime}</p>

                    </section>

                    {/* ------- ACTIONS ------- */}

                    <div className="checkout-confirmation-actions">

                        <Link to="/locations" className="checkout-confirmation-primary-action">
                            <MapPin size={16} aria-hidden="true" />
                            Store locations
                        </Link>

                        <Link to="/menu" className="checkout-confirmation-secondary-action">
                            Back to menu
                        </Link>

                    </div>

                </div>

                {/* =========================== */}
                {/*    ORDER RECEIPT            */}
                {/* =========================== */}

                <aside className="checkout-confirmation-receipt">

                    <h2>Receipt</h2>

                    <div className="checkout-confirmation-receipt-row">
                        <span>Confirmation</span>
                        <strong>{order.id}</strong>
                    </div>

                    <div className="checkout-confirmation-receipt-row">
                        <span>Store</span>
                        <strong>{order.pickupLocation?.name}</strong>
                    </div>

                    <div className="checkout-confirmation-receipt-row">
                        <span>Pickup</span>
                        <strong>{formattedPickupDate} · {formattedPickupTime}</strong>
                    </div>

                    <div className="checkout-confirmation-receipt-items">
                        {order.items.map((item, index) => (
                            <div className="checkout-confirmation-receipt-item" key={`${item.productId}-${index}`}>

                                <div>
                                    <span>
                                        {item.quantity} × {item.productName}
                                    </span>

                                    {item.selectedOptions?.length > 0 && (
                                        <small>
                                            {item.selectedOptions.map((option) => option.value).join(' · ')}
                                        </small>
                                    )}
                                </div>

                                <span>${Number(item.totalPrice).toFixed(2)}</span>

                            </div>
                        ))}
                    </div>

                    <div className="checkout-confirmation-receipt-row">
                        <span>Subtotal</span>
                        <strong>${Number(order.subtotal).toFixed(2)}</strong>
                    </div>

                    <div className="checkout-confirmation-receipt-row">
                        <span>Estimated tax</span>
                        <strong>${Number(order.estimatedTax).toFixed(2)}</strong>
                    </div>

                    <div className="checkout-confirmation-receipt-total">
                        <strong>Total</strong>
                        <strong>${formattedTotal}</strong>
                    </div>

                    <p className="checkout-confirmation-payment-note">
                        Demo only · Payment not processed
                    </p>

                </aside>

            </div>

        </main>
    );

}

export default CheckoutConfirmation;