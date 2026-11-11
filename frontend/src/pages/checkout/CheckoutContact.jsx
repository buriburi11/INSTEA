import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import useAuth from '../../auth/useAuth';
import CheckoutOrderSummary from '../../components/checkout/CheckoutOrderSummary';
import { loadCheckoutData, saveCheckoutData } from '../../utils/checkoutStorage';
import CheckoutProgress from '../../components/checkout/CheckoutProgress';
import './CheckoutPickup.css';
import './CheckoutContact.css';

// ===========================
//    CHECKOUT CONTACT PAGE
// ===========================

function CheckoutContact() {

    // ===========================
    //    AUTHENTICATION
    // ===========================

    const { customer, isAuthenticated } = useAuth();                                  // Retrieve the signed-in customer, if available.
    const navigate = useNavigate();                                                   // Navigate between checkout steps.

    // ===========================
    //    SHOPPING CART DATA
    // ===========================

    const [cartItems] = useState(() => {
        try {
            const savedCart = JSON.parse(localStorage.getItem('instea-cart') || '[]'); // Reuse the existing Shopping Cart.
            return Array.isArray(savedCart) ? savedCart : [];
        } catch {
            return [];                                                                // Handle invalid cart data safely.
        }
    });

    // ===========================
    //    SAVED CHECKOUT DATA
    // ===========================

    const [savedCheckout] = useState(() => loadCheckoutData());                       // Restore checkout information from sessionStorage.

    // ------- CHECKOUT MODE -------

    const [checkoutMode, setCheckoutMode] = useState(
        isAuthenticated ? 'member' : 'guest'
    );                                                                                // Signed-in customers default to member checkout; signed-out customers use guest checkout.

    // ------- SYNC CHECKOUT MODE WITH AUTHENTICATION -------

    useEffect(() => {
        setCheckoutMode(isAuthenticated ? 'member' : 'guest');                        // Reset checkout mode whenever authentication changes.
    }, [isAuthenticated]);

    // ------- GUEST CONTACT DETAILS -------

    const [guestContact, setGuestContact] = useState(() => ({
        firstName: savedCheckout.contact?.firstName ?? '',
        lastName: savedCheckout.contact?.lastName ?? '',
        email: savedCheckout.contact?.email ?? '',
        phone: savedCheckout.contact?.phone ?? '',
    }));

    const [errors, setErrors] = useState({});                                         // Store guest form validation errors.

    // ===========================
    //    CONTACT VALIDATION
    // ===========================

    function validateContact(contact) {

        const nextErrors = {};

        if (!contact.firstName.trim()) nextErrors.firstName = 'First name is required.';
        if (!contact.lastName.trim()) nextErrors.lastName = 'Last name is required.';

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
            nextErrors.email = 'Enter a valid email address.';
        }

        const phoneDigits = contact.phone.replace(/\D/g, '');

        if (phoneDigits.length !== 10) {
            nextErrors.phone = 'Enter a valid 10-digit phone number.';
        }

        return nextErrors;
    }

    // ===========================
    //    CONTINUE TO PAYMENT
    // ===========================

    function handleContinue() {

        const contact = checkoutMode === 'member' && isAuthenticated
            ? {
                firstName: customer.firstName ?? '',
                lastName: customer.lastName ?? '',
                email: customer.email ?? '',
                phone: customer.phone ?? '',
            }
            : guestContact;                                                          // Choose saved member details or guest-entered details.

        const validationErrors = validateContact(contact);                           // Validate the contact details before continuing.

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;                       // Prevent navigation when required information is missing.

        saveCheckoutData({
            checkoutMode,
            contact: {
                firstName: contact.firstName.trim(),
                lastName: contact.lastName.trim(),
                email: contact.email.trim(),
                phone: contact.phone.trim(),
            },
        });                                                                          // Preserve pickup selections while saving contact information.

        navigate('/checkout/payment');                                               // Continue to the Payment step.
    }

    // ===========================
    //    EMPTY CART PROTECTION
    // ===========================

    if (cartItems.length === 0) {
        return <Navigate to="/cart" replace />;                                      // Prevent checkout with an empty cart.
    }

    // ===========================
    //    CHECKOUT CONTACT DISPLAY
    // ===========================

    return (
        <main className="checkout-page">

            {/* ------- CHECKOUT HEADING ------- */}

            <h1 className="checkout-heading">Checkout</h1>

            {/* ------- CHECKOUT PROGRESS ------- */}

            <CheckoutProgress currentStep="Contact" />                               {/* Display Contact as active and Pickup as completed. */}

            {/* =========================== */}
            {/*    TWO-COLUMN LAYOUT        */}
            {/* =========================== */}

            <div className="checkout-layout">

                {/* ------- CONTACT INFORMATION ------- */}

                <div className="checkout-main-content">

                    {/* ------- MEMBER / GUEST SELECTION ------- */}

                    {isAuthenticated && (
                        <div className="checkout-contact-options">

                            <button
                                type="button"
                                className={`checkout-contact-option ${checkoutMode === 'member' ? 'checkout-contact-option-selected' : ''}`}
                                onClick={() => {
                                    setCheckoutMode('member');
                                    setErrors({});
                                }}
                                aria-pressed={checkoutMode === 'member'}
                            >
                                <strong>Signed in as {customer.firstName}</strong>
                                <span>Earn leaves and use your rewards.</span>
                            </button>

                            <button
                                type="button"
                                className={`checkout-contact-option ${checkoutMode === 'guest' ? 'checkout-contact-option-selected' : ''}`}
                                onClick={() => {
                                    setCheckoutMode('guest');
                                    setErrors({});
                                }}
                                aria-pressed={checkoutMode === 'guest'}
                            >
                                <strong>Continue as guest</strong>
                                <span>No account needed. You won't earn leaves.</span>
                            </button>

                        </div>
                    )}

                    {/* ------- MEMBER CONTACT CARD ------- */}

                    {checkoutMode === 'member' && isAuthenticated ? (

                        <div className="checkout-member-contact">
                            <CheckCircle2 size={20} aria-hidden="true" />
                            <div>
                                <strong>{customer.firstName} {customer.lastName}</strong>
                                <p>{customer.email} · {customer.phone}</p>
                            </div>
                        </div>

                    ) : (

                        // ------- GUEST CONTACT FORM -------

                        <div className="checkout-guest-contact">

                            <h2>Contact information</h2>

                            <p>Enter your details so we can contact you about your order.</p>

                            <div className="checkout-contact-fields">

                                {[
                                    { name: 'firstName', label: 'First name', type: 'text' },
                                    { name: 'lastName', label: 'Last name', type: 'text' },
                                    { name: 'email', label: 'Email address', type: 'email' },
                                    { name: 'phone', label: 'Phone number', type: 'tel' },
                                ].map(field => (
                                    <label key={field.name} className="checkout-contact-field">
                                        <span>{field.label}</span>

                                        <input
                                            type={field.type}
                                            value={guestContact[field.name]}
                                            onChange={event => {
                                                setGuestContact(previous => ({
                                                    ...previous,
                                                    [field.name]: event.target.value,
                                                }));
                                                setErrors(previous => ({
                                                    ...previous,
                                                    [field.name]: undefined,
                                                }));
                                            }}
                                            aria-invalid={Boolean(errors[field.name])}
                                            required
                                        />

                                        {errors[field.name] && (
                                            <small className="checkout-contact-error">
                                                {errors[field.name]}
                                            </small>
                                        )}
                                    </label>
                                ))}

                            </div>
                        </div>
                    )}

                    {/* ------- CHECKOUT NAVIGATION ------- */}

                    <div className="checkout-contact-actions">
                        <Link to="/checkout" className="checkout-contact-back">
                            Back to pickup
                        </Link>

                        <button
                            type="button"
                            className="checkout-continue-button"
                            onClick={handleContinue}
                        >
                            Continue to payment
                        </button>
                    </div>

                </div>

                {/* ------- SHARED ORDER SUMMARY ------- */}

                <CheckoutOrderSummary
                    cartItems={cartItems}
                    showRewards={isAuthenticated && checkoutMode === 'member'}       // Only member checkout earns Tea Leaves.
                />

            </div>
        </main>
    );
}

export default CheckoutContact;