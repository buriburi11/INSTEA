// =============
//    IMPORTS
// =============
import { useLocation, Navigate, Link } from 'react-router';
import { Check, Navigation, Phone, Leaf, Stamp, Flame } from 'lucide-react';
import OrderStatus from '../../components/orders/OrderStatus';
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

    // ------- DISPLAY CONFIRMATION NUMBER -------

    const confirmationNumber = `#${order.id.slice(-8).toUpperCase()}`;                  // Shorten the demo reference for display only.

    // ------- STORE CONTACT LINKS -------

    const storeAddress = order.pickupLocation?.address || '';
    const storeName = order.pickupLocation?.name || 'INSTEA';
    const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${storeName}, ${storeAddress}`)}`;
    const storePhone = order.pickupLocation?.phone || '';

    // ------- CHECKOUT MODE -------

    const isMemberCheckout = order.checkoutMode === 'member';                           // Show member-only content only for member checkout.
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
                        Demo order {confirmationNumber} has been created.
                    </p>

                    {/* ------- ORDER STATUS ------- */}

                    <OrderStatus status={order.status ?? 'new'} isDemo={true} />
                    
                    {/* ------- MEMBER REWARDS ------- */}

                    {isMemberCheckout && (
                        <section
                            className="checkout-confirmation-rewards"
                            aria-label="Member rewards preview"
                        >
                            <div className="checkout-confirmation-reward-card">
                                <Leaf size={19} aria-hidden="true" />
                                <strong>Tea Leaves</strong>
                                <span>Member rewards</span>
                            </div>

                            <div className="checkout-confirmation-reward-card">
                                <Stamp size={19} aria-hidden="true" />
                                <strong>Milk Tea Ritual</strong>
                                <span>Stamp card</span>
                            </div>

                            <div className="checkout-confirmation-reward-card">
                                <Flame size={19} aria-hidden="true" />
                                <strong>Streak</strong>
                                <span>Member progress</span>
                            </div>

                            <p className="checkout-confirmation-rewards-note">
                                Rewards preview only. Demo orders do not earn Tea Leaves,
                                stamps, or streak progress.
                            </p>
                        </section>
                    )}
                    
                    {/* ------- ACTIONS ------- */}

                    <div className="checkout-confirmation-actions">

                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="checkout-confirmation-primary-action"
                        >
                            <Navigation size={16} aria-hidden="true" />
                            Directions
                        </a>

                        <a
                            href={`tel:${storePhone.replace(/[^\d+]/g, '')}`}
                            className="checkout-confirmation-secondary-action"
                        >
                            <Phone size={16} aria-hidden="true" />
                            Contact store
                        </a>

                    </div>

                    <p className="checkout-confirmation-action-note">
                        Demo store information only. Directions and contact details are fictional.
                    </p>


                </div>

                {/* =========================== */}
                {/*    ORDER RECEIPT            */}
                {/* =========================== */}

                <aside className="checkout-confirmation-receipt">

                    <h2>Receipt</h2>

                    <div className="checkout-confirmation-receipt-row">
                        <span>Confirmation</span>
                        <strong>{confirmationNumber}</strong>
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