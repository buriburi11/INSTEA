// ===========
//  IMPORTS
// ===========

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Lock } from 'lucide-react';

import useAuth from '../../auth/useAuth';
import CheckoutProgress from '../../components/checkout/CheckoutProgress';
import CheckoutOrderSummary from '../../components/checkout/CheckoutOrderSummary';
import { loadCheckoutData, clearCheckoutData } from '../../utils/checkoutStorage';
import { calculateCartTotals } from '../../utils/cartPricing';
import { locations } from '../../data/locations';
import { getPickupDates, getPickupTimes } from '../../utils/pickupScheduling';

import './CheckoutPickup.css';
import './CheckoutReview.css';

function CheckoutReview() {
    // ===========================
    //    CHECKOUT STATE
    // ===========================

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // ------- CART ITEMS -------

    const [cartItems] = useState(() => {
        try {
            const savedCart = JSON.parse(
                localStorage.getItem('instea-cart') || '[]'
            );

            return Array.isArray(savedCart) ? savedCart : [];
        } catch {
            return [];
        }
    });

    // ------- SAVED CHECKOUT INFORMATION -------

    const [checkoutData] = useState(() => loadCheckoutData());

    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // ------- MEMBER / GUEST MODE -------

    const isMemberCheckout =
        isAuthenticated && checkoutData.checkoutMode === 'member';

    // ===========================
    //    CHECKOUT VALIDATION
    // ===========================

    const hasPickupSelection = Boolean(
        checkoutData.pickupLocationId &&
        checkoutData.pickupDate &&
        checkoutData.pickupTime
    );

    const hasContactInformation = Boolean(
        checkoutData.contact?.firstName &&
        checkoutData.contact?.lastName &&
        checkoutData.contact?.email &&
        checkoutData.contact?.phone
    );

    const validPaymentMethods = ['card', 'apple-pay', 'google-pay'];

    const hasPaymentMethod = validPaymentMethods.includes(
        checkoutData.paymentMethod
    );

    // ===========================
    //    ORDER INFORMATION
    // ===========================

    const selectedLocation = locations.find(
        (location) =>
            String(location.id) === String(checkoutData.pickupLocationId)
    );
    
    // ------- FORMATTED PICKUP DATE -------

    const pickupDate = getPickupDates().find(
        (date) => date.value === checkoutData.pickupDate
    );

    const pickupDateLabel = pickupDate
        ? pickupDate.label
        : checkoutData.pickupDate;

    // ------- FORMATTED PICKUP TIME -------

    const pickupTime = getPickupTimes(
        checkoutData.pickupDate,
        selectedLocation?.pickupHours
    ).find(
        (time) => time.value === checkoutData.pickupTime
    );

    const pickupTimeLabel = pickupTime
        ? pickupTime.label
        : checkoutData.pickupTime;


    const contact = checkoutData.contact || {};

    const paymentLabels = {
        card: 'Card',
        'apple-pay': 'Apple Pay',
        'google-pay': 'Google Pay',
    };

    const paymentLabel =
        paymentLabels[checkoutData.paymentMethod] || 'Not selected';

    const { subtotal, estimatedTax, orderTotal } = calculateCartTotals(cartItems);

    // ===========================
    //    NAVIGATION GUARDS
    // ===========================

    if (cartItems.length === 0) {
        return <Navigate to="/cart" replace />;
    }

    if (!hasPickupSelection) {
        return <Navigate to="/checkout" replace />;
    }

    if (!hasContactInformation) {
        return <Navigate to="/checkout/contact" replace />;
    }

    if (!hasPaymentMethod) {
        return <Navigate to="/checkout/payment" replace />;
    }

    // ===========================
    //    PLACE ORDER HANDLER
    // ===========================

    
    const handlePlaceOrder = () => {

        if (!agreedToTerms || !hasPickupSelection || !hasContactInformation || !hasPaymentMethod || !selectedLocation || cartItems.length === 0) {
            return;                                                                                     // Prevent incomplete checkout submissions.
        }

        // ------- CREATE DEMO ORDER -------

        const orderId = `demo-${crypto.randomUUID()}`;                                                  // Generate a unique demo order identifier.

        const orderItems = cartItems.map((item) => ({
            productId: item.productId,
            productName: item.name,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.unitPrice) * Number(item.quantity),
            selectedOptions: item.selectedOptions || [],
            ...(item.specialInstructions && {
                specialInstructions: item.specialInstructions,
            }),
        }));

        const demoOrder = {
            id: orderId,
            customerName: `${contact.firstName} ${contact.lastName}`,
            items: orderItems,
            subtotal,
            estimatedTax,
            total: orderTotal,
            status: 'new',                                                                              // Demo orders begin in the Received stage.
            pickupLocation: selectedLocation,
            pickupDate: checkoutData.pickupDate,
            pickupTime: checkoutData.pickupTime,
            paymentStatus: 'pending',                                                                   // No real payment has been processed.
            createdAt: new Date().toISOString(),
        };

        // ------- NAVIGATE TO CONFIRMATION -------

        navigate(`/checkout/confirmation/${orderId}`, {
            replace: true,
            state: { order: demoOrder },                                                                // Pass demo order without saving it permanently.
        });

        // ------- CLEAR COMPLETED CHECKOUT -------

        localStorage.removeItem('instea-cart');                                                         // Clear cart after creating the demo order.
        window.dispatchEvent(new Event('instea-cart-updated'));                                         // Notify the header to refresh its cart count.
        clearCheckoutData();                                                                            // Clear pickup, contact, and payment selections.

    };

    return (
        <main className="checkout-page checkout-review-page">

            {/* =========================== */}
            {/*    CHECKOUT HEADING         */}
            {/* =========================== */}

            <h1 className="checkout-heading">Checkout</h1>

            <CheckoutProgress currentStep="Review" />

            {/* =========================== */}
            {/*    REVIEW PAGE LAYOUT       */}
            {/* =========================== */}

            <div className="checkout-layout">

                <div className="checkout-main-content">

                    {/* ------- CHECKOUT DETAILS ------- */}

                    <section
                        className="checkout-review-details"
                        aria-label="Review checkout details"
                    >
                        <div className="checkout-review-detail-row">
                            <strong>Pickup</strong>

                            <span>
                                {selectedLocation?.name || 'Selected location'}
                                {' · '}
                                {pickupDateLabel}
                                {' · '}
                                {pickupTimeLabel}
                            </span>

                            <button
                                type="button"
                                onClick={() => navigate('/checkout')}
                            >
                                Edit
                            </button>
                        </div>

                        <div className="checkout-review-detail-row">
                            <strong>Contact</strong>

                            <span>
                                {contact.firstName} {contact.lastName}
                                {' · '}
                                {isMemberCheckout ? 'member' : 'guest'}
                            </span>

                            <button
                                type="button"
                                onClick={() => navigate('/checkout/contact')}
                            >
                                Edit
                            </button>
                        </div>

                        <div className="checkout-review-detail-row">
                            <strong>Payment</strong>

                            <span>{paymentLabel}</span>

                            <button
                                type="button"
                                onClick={() => navigate('/checkout/payment')}
                            >
                                Edit
                            </button>
                        </div>
                    </section>

                    {/* =========================== */}
                    {/*    ORDER ITEMS              */}
                    {/* =========================== */}

                    <section
                        className="checkout-review-items"
                        aria-label="Order items"
                    >
                        {cartItems.map((item, index) => (
                            <div
                                className="checkout-review-item"
                                key={item.id || index}
                            >
                                <span>
                                    {item.quantity || 1} × {item.name}
                                </span>

                                <span>
                                    ${(
                                        Number(item.unitPrice) *
                                        Number(item.quantity)
                                    ).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </section>

                    {/* =========================== */}
                    {/*    PICKUP INSTRUCTIONS      */}
                    {/* =========================== */}

                    <section className="checkout-review-instructions">
                        <h2>Pickup instructions</h2>

                        <p>
                            Head to the gold pickup shelf by the entrance.
                            Your name and order number will be on the cup
                            sleeve. Orders are held for 30 minutes.
                        </p>
                    </section>

                    {/* =========================== */}
                    {/*    TERMS AGREEMENT          */}
                    {/* =========================== */}

                    <label className="checkout-review-terms">
                        <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(event) =>
                                setAgreedToTerms(event.target.checked)
                            }
                        />

                        <span>
                            I agree to the <strong>Terms of Service</strong>
                        </span>
                    </label>

                    {/* =========================== */}
                    {/*    PLACE ORDER BUTTON       */}
                    {/* =========================== */}

                    <button
                        type="button"
                        className="checkout-review-place-order"
                        disabled={!agreedToTerms}
                        onClick={handlePlaceOrder}
                    >
                        <Lock size={15} aria-hidden="true" />

                        <span>
                            Place order · ${orderTotal.toFixed(2)}
                        </span>
                    </button>

                </div>

                {/* =========================== */}
                {/*    ORDER SUMMARY            */}
                {/* =========================== */}

                <CheckoutOrderSummary
                    cartItems={cartItems}
                    showRewards={isMemberCheckout}
                />

            </div>
        </main>
    );
}

export default CheckoutReview;