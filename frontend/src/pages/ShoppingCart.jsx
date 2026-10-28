// =============
//    IMPORTS
// =============

import {useState} from 'react';
import {Link} from 'react-router';
import { Pencil, Trash2, Leaf, Gift } from 'lucide-react';
import {formatPrice, calculateCartTotals, calculateItemTotal, } from '../utils/cartPricing'
import { locations } from '../data/locations';
import './ShoppingCart.css';

// ===========================
//    SHOPPING CART CONTENT
// ===========================

function ShoppingCart() {

    // ------- CART INITIALIZATION -------

    const [cartItems, setCartItems] = useState(() => {                                                                 // Initialize cart using saved localStorage data.
        try {
            const savedCart = JSON.parse(localStorage.getItem('instea-cart') || '[]');                                 // Retrieve and parse the saved cart.
            return Array.isArray(savedCart) ? savedCart : [];                                                          // Only accept an array of cart items.
        } catch {
            return [];                                                                                                 // Start with an empty cart if saved data is invalid.
        }
    });

    // ------- CART UPDATES -------

    function updateCart(updatedItems) {
        setCartItems(updatedItems);                                                                                    // Update cart state to refresh the page.
        localStorage.setItem('instea-cart', JSON.stringify(updatedItems));                                             // Save updated cart items for future visits.
        window.dispatchEvent(new Event('instea-cart-updated'));                                                        // Notify the header to update its cart badge.
    }

    // ------- QUANTITY SELECTION -------

    function changeQuantity(index, change) {
        const updatedItems = cartItems.map((item, i) => {                                                              // Find the selected item while preserving other items.
            if (i !== index) return item;

            const newQuantity = Math.max(1, Math.min(99, item.quantity + change));                                     // Restrict item quantity to a minimum of 1 and maximum of 99.

            return {
                ...item,
                quantity: newQuantity,
                totalPrice: calculateItemTotal(item.unitPrice, newQuantity)                                            // Recalculate the item total using its updated quantity.
            };
        });

        updateCart(updatedItems);                                                                                      // Save the new quantity and pricing.
    }

    // ------- REMOVE CART ITEM -------

    function removeItem(index) {
        updateCart(cartItems.filter((_, i) => i !== index));                                                           // Remove only the item at the selected index.
    }

    // ------- CART PRICING -------

    const { subtotal, estimatedTax, orderTotal } = calculateCartTotals(cartItems);                                     // Calculate preliminary subtotal, tax, and total using shared pricing utilities.

    const teaLeavesEarned = Math.floor(Math.round(subtotal * 100) / 10);                                               // Earn 1 Tea Leaf for every $0.10 spent, excluding tax.

    // ------- MOCK PICKUP LOCATION -------

    const pickupLocation = locations[0];                                                                               // Use the first location from the shared mock location data.

    const pickupDetails = {
        location: pickupLocation?.name ?? 'Location unavailable',                                                      // Display the mock store name or fallback text.
        readyTime: pickupLocation?.estimatedPickupTime ?? 'Time unavailable'                                           // Display the mock pickup estimate or fallback text.
    };

    // ------- CLEAR CART -------

    function clearCart() {
        updateCart([]);                                                                                                // Remove all items and reset the saved cart.
    }

    // ===========================
    //    SHOPPING CART DISPLAY
    // ===========================

    return (
        <main className="shopping-cart-page">

            {/* ------- EMPTY CART ------- */}

            {cartItems.length === 0 ? (
                <div>
                    <div className="cart-heading-row">
                        <div>
                            <h1>Your cart</h1>
                            <p className="cart-pickup-info">
                                Pickup at {pickupDetails.location} · Ready in {pickupDetails.readyTime}
                            </p>
                        </div>
                    </div>

                    <div className="cart-empty">
                        <p>Your cart is empty.</p>
                        <Link to="/menu">Browse menu</Link>
                    </div>
                </div>
            ) : (

                // ------- CART ITEM LAYOUT -------

                <div className="cart-layout">
                    <div className="cart-left-column">

                        {/* ------- CART HEADING ------- */}

                        <div className="cart-heading-row">
                            <div>
                                <h1>Your cart</h1>
                                <p className="cart-pickup-info">
                                    Pickup at {pickupDetails.location} · Ready in {pickupDetails.readyTime}
                                </p>
                            </div>

                            {cartItems.length > 0 && (
                                <button
                                    type="button"
                                    className="cart-clear-button"
                                    onClick={clearCart}
                                >
                                    Clear cart
                                </button>
                            )}
                        </div>

                        {/* ------- CART ITEMS ------- */}

                        <div className="cart-items">
                            {cartItems.map((item, index) => (
                                <div className="cart-item" key={index}>

                                    {/* ------- PRODUCT IMAGE ------- */}

                                    <img
                                        className="cart-item-image"
                                        src={item.imageUrl}
                                        alt={item.name}
                                        onError={(event) => {
                                            event.currentTarget.onerror = null;                                        // Prevent repeated image loading errors.
                                            event.currentTarget.src = '/images/products/placeholder.svg';              // Use a placeholder when the product image cannot load.
                                        }}
                                    />

                                    {/* ------- PRODUCT INFORMATION ------- */}

                                    <div className="cart-item-details">
                                        <h2>{item.name}</h2>

                                        {item.selectedOptions?.length > 0 && (
                                            <p className="cart-item-options">
                                                {item.selectedOptions.map(option => option.value).join(' · ')}         {/* Display selected product options separated by dots. */}
                                            </p>
                                        )}

                                        {item.specialInstructions && (
                                            <p className="cart-item-instructions">
                                                Note: {item.specialInstructions}
                                            </p>
                                        )}

                                        {/* ------- ITEM ACTIONS ------- */}

                                        <div className="cart-item-actions">

                                            {/* ------- QUANTITY CONTROLS ------- */}

                                            <div className="cart-quantity-control">
                                                <button
                                                    type="button"
                                                    onClick={() => changeQuantity(index, -1)}
                                                    disabled={item.quantity <= 1}
                                                    aria-label={`Decrease ${item.name} quantity`}
                                                >
                                                    −
                                                </button>

                                                <span>{item.quantity}</span>

                                                <button
                                                    type="button"
                                                    onClick={() => changeQuantity(index, 1)}
                                                    disabled={item.quantity >= 99}
                                                    aria-label={`Increase quantity of ${item.name}`}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* ------- EDIT ITEM ------- */}

                                            <Link
                                                to={`/menu/${item.productId}?edit=${index}`}
                                                className="cart-edit-button"
                                                aria-label={`Edit ${item.name}`}
                                            >
                                                <Pencil size={15} aria-hidden="true" />
                                                Edit
                                            </Link>

                                            {/* ------- REMOVE ITEM ------- */}

                                            <button
                                                type="button"
                                                className="cart-remove-button"
                                                onClick={() => removeItem(index)}
                                            >
                                                <Trash2 size={15} aria-hidden="true" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* ------- ITEM PRICE ------- */}

                                    <strong className="cart-item-price">
                                        {formatPrice(calculateItemTotal(item.unitPrice, item.quantity))}               {/* Format the calculated item total as USD. */}
                                    </strong>
                                </div>
                            ))}
                        </div>

                        {/* ===========================
                             PROMOTIONS AND REWARDS
                           =========================== */}

                        <div className="cart-benefits">

                            {/* ------- PROMO CODE ------- */}

                            <div className="cart-promo">
                                <h2>Promo code</h2>

                                <div className="cart-promo-controls">
                                    <input
                                        type="text"
                                        placeholder="Enter code"
                                        aria-label="Promo code"
                                        disabled
                                    />
                                    <button type="button" disabled>
                                        Apply
                                    </button>
                                </div>
                            </div>

                            {/* ------- REWARDS PLACEHOLDER ------- */}

                            <div className="cart-rewards">
                                <h2>
                                    <Gift size={20} strokeWidth={2.5} aria-hidden="true" />
                                    Rewards available
                                </h2>

                                {/* TODO: Replace with actual authentication status from backend. */}
                                {/* When not signed in, display:
                                    "Reward details will appear here when connected to your account."
                                */}

                                {/* TODO: Replace placeholder reward with backend rewards data. */}

                                <p>Placeholder reward · up to placeholder $amount</p>

                                <button type="button" disabled>
                                    Apply reward
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ===========================
                           ORDER SUMMARY
                       =========================== */}

                    <aside className="cart-order-summary">
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

                        <div className="cart-rewards-banner">
                            <Leaf size={16} strokeWidth={3} aria-hidden="true" />
                            <span>
                                You'll earn {teaLeavesEarned} Tea Leaves with this order
                            </span>
                        </div>

                        {/* ------- CHECKOUT PLACEHOLDER ------- */}

                        <button type="button" className="cart-checkout-button" disabled>
                            Continue to checkout
                        </button>

                        {/* ------- CONTINUE SHOPPING ------- */}

                        <Link to="/menu" className="cart-continue-shopping">
                            Add more items
                        </Link>

                        {/* ------- TAX DISCLAIMER ------- */}

                        <p className="cart-tax-note">
                            Tax is an estimate. Final taxes will be calculated at checkout.
                        </p>
                    </aside>

                </div>
            )}
        </main>
    );
}

export default ShoppingCart;