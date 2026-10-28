// =============
//    IMPORTS
// =============

import { ESTIMATED_TAX_RATE } from '../data/orders';

// ==============
//    DUNCTIONS
// ==============

export function formatPrice(amount) {                                                                               // Format monetary values consistently throughout the website.
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export function calculateUnitPrice(basePrice, selectedOptions = []) {                                               // Calculate the unit price, including selected customization add-ons.
    return (
        basePrice + selectedOptions.reduce (
            (total, option) => total + (option.additionalPrice ?? 0), 0
        )
    ); 
}

export function calculateItemTotal(unitPrice, quantity) {                                                           // Calculate the total price of a single cart item.
  return unitPrice * quantity;
}

export function calculateCartSubtotal(cartItems) {                                                                  // Calculate the combined subtotal of all cart items.
  return cartItems.reduce(
    (total, item) => total + calculateItemTotal(item.unitPrice, item.quantity),
    0
  );
}

export function calculateEstimatedTax(subtotal) {                                                                   // Calculate estimated sales tax.
  return Math.round((subtotal * ESTIMATED_TAX_RATE + Number.EPSILON) * 100) / 100;
}

export function calculateCartTotals(cartItems) {                                                                    // Calculate the complete order totals.
  const subtotal = calculateCartSubtotal(cartItems);
  const estimatedTax = calculateEstimatedTax(subtotal);

  return {
    subtotal,
    estimatedTax,
    orderTotal: subtotal + estimatedTax,
  };
}