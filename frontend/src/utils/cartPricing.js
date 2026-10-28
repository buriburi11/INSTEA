 // =============
 //    IMPORTS
 // =============

 import { ESTIMATED_TAX_RATE } from '../data/orders';                                                                   // Use the shared mock tax rate instead of hardcoding it.

 // ===========================
 //    CART PRICING FUNCTIONS
 // ===========================

 // ------- CURRENCY FORMATTING -------

 export function formatPrice(amount) {                                                                                  // Format monetary values consistently throughout the website.
     return new Intl.NumberFormat('en-US', {
         style: 'currency',                                                                                             // Display values as currency.
         currency: 'USD',                                                                                               // Use US dollars.
     }).format(amount);
 }

 // ------- UNIT PRICE CALCULATION -------

 export function calculateUnitPrice(basePrice, selectedOptions = []) {                                                  // Calculate the product's base price plus selected add-ons.
     return (
         basePrice + selectedOptions.reduce(
             (total, option) => total + (option.additionalPrice ?? 0), 0                                                // Add customization prices, treating missing prices as zero.
         )
     );
 }

 // ------- ITEM TOTAL CALCULATION -------

 export function calculateItemTotal(unitPrice, quantity) {                                                              // Calculate the total price for an item based on its quantity.
     return unitPrice * quantity;
 }

 // ------- CART SUBTOTAL CALCULATION -------

 export function calculateCartSubtotal(cartItems) {                                                                     // Calculate the combined subtotal of all items before tax.
     return cartItems.reduce(
         (total, item) => total + calculateItemTotal(item.unitPrice, item.quantity),                                    // Add each item's total to the cart subtotal.
         0
     );
 }

 // ------- ESTIMATED TAX CALCULATION -------

 export function calculateEstimatedTax(subtotal) {                                                                      // Calculate estimated tax using the shared mock tax rate.
     return Math.round((subtotal * ESTIMATED_TAX_RATE + Number.EPSILON) * 100) / 100;                                   // Round estimated tax to two decimal places.
 }

 // ------- ORDER TOTAL CALCULATION -------

 export function calculateCartTotals(cartItems) {                                                                       // Calculate all preliminary totals for the shopping cart.
     const subtotal = calculateCartSubtotal(cartItems);                                                                 // Calculate the subtotal before tax.
     const estimatedTax = calculateEstimatedTax(subtotal);                                                              // Calculate estimated tax from the subtotal.

     return {
         subtotal,
         estimatedTax,
         orderTotal: subtotal + estimatedTax,                                                                           // Combine subtotal and estimated tax for the final displayed estimate.
     };
 }
