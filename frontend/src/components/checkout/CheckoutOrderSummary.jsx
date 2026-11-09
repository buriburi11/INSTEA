 // =============
 //    IMPORTS
 // =============

 import { Leaf } from 'lucide-react';
 import { formatPrice, calculateCartTotals } from '../../utils/cartPricing';
 import { calculateTeaLeaves } from '../../data/rewards';                                                               // Import the shared Tea Leaves earning calculation.
 import './CheckoutOrderSummary.css';                                                                                   // Load shared Order Summary styling for both Shopping Cart and Checkout pages.

 // ===========================
 //    CHECKOUT ORDER SUMMARY
 // ===========================

function CheckoutOrderSummary({ cartItems = [], children, showRewards = true }) {

    // ------- CART PRICING -------

    const { subtotal, estimatedTax, orderTotal } = calculateCartTotals(cartItems);                                      // Reuse the shared pricing calculations already used by the Shopping Cart.

    const teaLeavesEarned = calculateTeaLeaves(subtotal);                                                               // Calculate earned Tea Leaves using the global rewards configuration.

    // ===========================
    //    ORDER SUMMARY DISPLAY
    // ===========================

    return (
        <aside className="cart-order-summary">

            {/* ------- SUMMARY HEADING ------- */}

            <h2>Order summary</h2>

            {/* ------- CART SUBTOTAL ------- */}

            <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
            </div>

            {/* ------- ESTIMATED TAX ------- */}

            <div className="cart-summary-row">
                <span>Estimated tax</span>
                <span>{formatPrice(estimatedTax)}</span>
            </div>

            {/* ------- ESTIMATED TOTAL ------- */}

            <div className="cart-summary-total">
                <strong>Estimated total</strong>
                <strong>{formatPrice(orderTotal)}</strong>
            </div>

            {/* ------- TEA LEAVES REWARDS ------- */}

            {showRewards && (
                <div className="cart-rewards-banner">
                    <Leaf size={16} strokeWidth={3} aria-hidden="true" />
                    <span>
                        You'll earn {teaLeavesEarned} Tea Leaves with this order
                    </span>
                </div>
            )}

            {/* ------- OPTIONAL PAGE ACTIONS ------- */}

            {children}                                                                                                  {/* Allow the Shopping Cart and Checkout pages to display their own buttons. */}

        </aside>
    );
}

export default CheckoutOrderSummary;
