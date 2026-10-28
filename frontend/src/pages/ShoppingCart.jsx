// =============
//    IMPORTS
// =============

import {useState} from 'react';
import {Link} from 'react-router';
import { Pencil, Trash2, Leaf, Gift } from 'lucide-react';
import './ShoppingCart.css';

// ===========================
//    SHOPPING CART CONTENT
// ===========================

function ShoppingCart() {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = JSON.parse(localStorage.getItem('instea-cart') || '[]');
            return Array.isArray(savedCart) ? savedCart : [];
        } catch {
            return [];
        }
    });

    function updateCart(updatedItems) {
        setCartItems(updatedItems);
        localStorage.setItem('instea-cart', JSON.stringify(updatedItems));
        window.dispatchEvent(new Event('instea-cart-updated'));
    }

    function changeQuantity(index, change) {
        const updatedItems = cartItems.map((item, i) => {
            if (i !== index) return item;

            const newQuantity = Math.max(1, Math.min(99, item.quantity + change));

            return {
                ...item,
                quantity: newQuantity,
                totalPrice: item.unitPrice * newQuantity
            };
        });

        updateCart(updatedItems);
    }

    function removeItem(index) {
        updateCart(cartItems.filter((_, i) => i !== index));
    }

    const ESTIMATED_TAX_RATE = 0.08;                                                                                                                // TEMPORARY ESTIMATED TAX RATE (REPLACE WITH BACKEND CALCULATION LATER)

    const subtotal = cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

    const estimatedTax = subtotal * ESTIMATED_TAX_RATE;
    const orderTotal = subtotal + estimatedTax;

    const teaLeavesEarned = Math.floor(Math.round(subtotal * 100) / 10);                                                                            // Earn 1 Tea Leaf for every $0.10 spent, excluding tax.

    const formatPrice = (amount) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);

    const pickupDetails = {                                                                                                                         // REPLACE WITH PICKUP DETAILS FROM BACKEND
        location: 'location placeholder',
        readyTime: 'time placeholder'
    };

    function clearCart() {
        updateCart([]);
    }

    return (
        <main className="shopping-cart-page">
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

                <div className="cart-layout">
                    <div className="cart-left-column">
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

                        <div className="cart-items">
                            {cartItems.map((item, index) => (
                                <div className="cart-item" key={index}>
                                    <img
                                        className="cart-item-image"
                                        src={item.imageUrl}
                                        alt={item.name}
                                        onError={(event) => {
                                            event.currentTarget.onerror = null;
                                            event.currentTarget.src = '/images/products/placeholder.svg';
                                        }}
                                    />

                                    <div className="cart-item-details">
                                        <h2>{item.name}</h2>

                                        {item.selectedOptions?.length > 0 && (
                                            <p className="cart-item-options">
                                                {item.selectedOptions.map(option => option.value).join(' · ')}
                                            </p>
                                        )}

                                        {item.specialInstructions && (
                                            <p className="cart-item-instructions">
                                                Note: {item.specialInstructions}
                                            </p>
                                        )}

                                        <div className="cart-item-actions">
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

                                            <Link
                                                to={`/menu/${item.productId}?edit=${index}`}
                                                className="cart-edit-button"
                                                aria-label={`Edit ${item.name}`}
                                            >
                                                <Pencil size={15} aria-hidden="true" />
                                                Edit
                                            </Link>

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

                                    <strong className="cart-item-price">
                                        ${item.totalPrice.toFixed(2)}
                                    </strong>
                                </div>
                            ))}
                        </div>

                        <div className="cart-benefits">
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

                            <div className="cart-rewards">
                                <h2>
                                    <Gift size={20} strokeWidth={2.5} aria-hidden="true" />
                                    Rewards available
                                </h2>

                                {/* TODO: Replace with actual authentication status from backend */}                                                {/*REPLACE PLACEHOLDERS WITH BACKEND DATA */}
                                {/* When not signed in, display:
                                    "Reward details will appear here when connected to your account."
                                */}

                                {/* TODO: Replace placeholder reward with backend rewards data */}
                                <p>Placeholder reward · up to placeholder $amount</p>

                                <button type="button" disabled>
                                    Apply reward
                                </button>
                            </div>
                        </div>

                    </div>

                    <aside className="cart-order-summary">
                        <h2>Order summary</h2>

                        <div className="cart-summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>

                        <div className="cart-summary-row">
                            <span>Estimated tax</span>
                            <span>{formatPrice(estimatedTax)}</span>
                        </div>

                        <div className="cart-summary-total">
                            <strong>Estimated total</strong>
                            <strong>{formatPrice(orderTotal)}</strong>
                        </div>

                        <div className="cart-rewards-banner">
                            <Leaf size={16} strokeWidth={3} aria-hidden="true" />
                            <span>
                                You'll earn {teaLeavesEarned} Tea Leaves with this order
                            </span>
                        </div>

                        <button type="button" className="cart-checkout-button" disabled>
                            Continue to checkout
                        </button>

                        <Link to="/menu" className="cart-continue-shopping">
                            Add more items
                        </Link>

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