// ===========
//    IMPORTS
// ===========

import { useState } from 'react';
import { Navigate } from 'react-router';
import { CreditCard, Smartphone, Wallet, Lock } from 'lucide-react';
import useAuth from '../../auth/useAuth';
import CheckoutProgress from '../../components/checkout/CheckoutProgress';
import CheckoutOrderSummary from '../../components/checkout/CheckoutOrderSummary';
import { loadCheckoutData, saveCheckoutData } from '../../utils/checkoutStorage';
import './CheckoutPickup.css';
import './CheckoutPayment.css';

// ===========================
//    CHECKOUT PAYMENT PAGE
// ===========================

function CheckoutPayment() {

    // ===========================
    //    CUSTOMER AUTHENTICATION
    // ===========================

    const { isAuthenticated } = useAuth();                                      // Determine whether the customer is signed in.

    // ===========================
    //    SHOPPING CART DATA
    // ===========================

    const [cartItems] = useState(() => {
        try {
            const savedCart = JSON.parse(localStorage.getItem('instea-cart') || '[]');
            return Array.isArray(savedCart) ? savedCart : [];
        } catch {
            return [];
        }
    });

    // ===========================
    //    SAVED CHECKOUT DATA
    // ===========================

    const [checkoutData] = useState(() => loadCheckoutData());                   // Restore pickup and contact information.

    // ===========================
    //    PAYMENT METHOD STATE
    // ===========================

    // ------- RESTORE SAVED PAYMENT METHOD -------

    const [paymentMethod, setPaymentMethod] = useState(() => {
        const savedCheckout = loadCheckoutData();

        const allowedMethods = ['card', 'apple-pay', 'google-pay'];

        return allowedMethods.includes(savedCheckout.paymentMethod)
            ? savedCheckout.paymentMethod
            : 'card';
    });

    // ------- UPDATE AND SAVE PAYMENT METHOD -------

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);

        saveCheckoutData({
            ...loadCheckoutData(),
            paymentMethod: method,
        });
    };

    const paymentMethods = [
        { id: 'card', label: 'Card', icon: CreditCard },
        { id: 'apple-pay', label: 'Apple Pay', icon: Smartphone },
        { id: 'google-pay', label: 'Google Pay', icon: Wallet },
    ];

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

    // ------- PREVENT INVALID CHECKOUT ACCESS -------

    if (cartItems.length === 0) {
        return <Navigate to="/cart" replace />;                                // Prevent payment with an empty cart.
    }

    if (!hasPickupSelection) {
        return <Navigate to="/checkout" replace />;                            // Require pickup information first.
    }

    if (!hasContactInformation) {
        return <Navigate to="/checkout/contact" replace />;                    // Require contact information first.
    }

    // ===========================
    //    PAYMENT PAGE DISPLAY
    // ===========================

    return (
        <main className="checkout-page">

            {/* ------- CHECKOUT HEADING ------- */}

            <h1 className="checkout-heading">Checkout</h1>

            {/* ------- CHECKOUT PROGRESS ------- */}

            <CheckoutProgress currentStep="Payment" />

            {/* =========================== */}
            {/*    TWO-COLUMN LAYOUT        */}
            {/* =========================== */}

            <div className="checkout-layout">

                <div className="checkout-main-content">

                    {/* =========================== */}
                    {/*    PAYMENT METHOD OPTIONS   */}
                    {/* =========================== */}

                    <div className="checkout-payment-methods">

                        {paymentMethods.map(method => {

                            const PaymentIcon = method.icon;

                            return (
                                <button
                                    key={method.id}
                                    type="button"
                                    className={`checkout-payment-method ${paymentMethod === method.id ? 'checkout-payment-selected' : ''}`}
                                    aria-pressed={paymentMethod === method.id}
                                    onClick={() => handlePaymentMethodChange(method.id)}
                                >
                                    <PaymentIcon size={19} aria-hidden="true" />
                                    <span>{method.label}</span>
                                </button>
                            );
                        })}

                    </div>

                    {/* =========================== */}
                    {/*    SQUARE PAYMENT AREA      */}
                    {/* =========================== */}

                    <section className="checkout-payment-details">

                        {paymentMethod === 'card' ? (

                            <>
                                {/* ------- CARD DETAILS HEADER ------- */}

                                <div className="checkout-payment-details-header">
                                    <h2>Card details</h2>
                                    <span><Lock size={13} /> Secure field hosted by Square</span>
                                </div>

                                {/* ------- CARD FIELD PLACEHOLDERS ------- */}

                                <div className="checkout-payment-fields">

                                    <div className="checkout-payment-field">
                                        <label>Card number</label>
                                        <div className="checkout-payment-placeholder">1234 5678 9012 3456</div>
                                    </div>

                                    <div className="checkout-payment-field">
                                        <label>Expiry</label>
                                        <div className="checkout-payment-placeholder">MM/YY</div>
                                    </div>

                                    <div className="checkout-payment-field">
                                        <label>CVC</label>
                                        <div className="checkout-payment-placeholder">123</div>
                                    </div>

                                </div>

                                {/* ------- SECURITY MESSAGE ------- */}

                                <p className="checkout-payment-security">
                                    INSTEA never stores your card number. Payment is tokenized and processed by Square.
                                </p>
                            </>

                        ) : (

                            // ------- DIGITAL WALLET PLACEHOLDER -------

                            <div className="checkout-wallet-placeholder">
                                <Lock size={20} aria-hidden="true" />
                                <p>{paymentMethod === 'apple-pay' ? 'Apple Pay' : 'Google Pay'} will be available when Square payments are integrated.</p>
                            </div>

                        )}

                    </section>

                    {/* ------- REVIEW ORDER BUTTON ------- */}

                    <button
                        type="button"
                        className="checkout-continue-button checkout-payment-review-button"
                        disabled
                        title="Payment processing will be available when Square is integrated."
                    >
                        Review order
                    </button>

                </div>

                {/* =========================== */}
                {/*    SHARED ORDER SUMMARY     */}
                {/* =========================== */}

                <CheckoutOrderSummary
                    cartItems={cartItems}
                    showRewards={isAuthenticated && checkoutData.checkoutMode === 'member'}
                />

            </div>
        </main>
    );
}

export default CheckoutPayment;