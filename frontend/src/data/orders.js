/**
 * Mock INSTEA orders for order-history, order-status, and admin components.
 * Shapes follow `Order` and `OrderItem` in ../types/models.js.
 *
 * - `productId` / `productName` match ./products.js.
 * - `customerId` matches ./customers.js (omitted for guest orders).
 * - `unitPrice` includes option upcharges; `totalPrice` = unitPrice x quantity.
 * - `estimatedTax` = subtotal x ESTIMATED_TAX_RATE, rounded to the cent.
 * - There is one order for each status.
 */

import { locations } from './locations.js'

/** @typedef {import('../types/models').Order} Order */

/** Approximate Sacramento sales tax rate, for estimates only. */
export const ESTIMATED_TAX_RATE = 0.0875

const downtown = locations[0]

/** @type {Order[]} */
export const orders = [
  {
    id: 'ord-1006',
    customerId: 'cust-alex-rivera',
    customerName: 'Alex Rivera',
    items: [
      {
        productId: 'prod-earl-grey-espresso-latte',
        productName: 'Earl Grey Espresso Latte',
        quantity: 1,
        unitPrice: 7.75,
        totalPrice: 7.75,
        selectedOptions: [
          { name: 'Size', value: 'Large (16 oz)', additionalPrice: 0.75 },
          { name: 'Temperature', value: 'Iced', additionalPrice: 0 },
          { name: 'Sweetness', value: '50%', additionalPrice: 0 },
          { name: 'Milk', value: 'Oat', additionalPrice: 0.75 },
        ],
      },
      {
        productId: 'prod-jasmine-green-tea',
        productName: 'Jasmine Green Tea',
        quantity: 1,
        unitPrice: 4.25,
        totalPrice: 4.25,
        selectedOptions: [
          { name: 'Size', value: 'Regular (12 oz)', additionalPrice: 0 },
          { name: 'Temperature', value: 'Hot', additionalPrice: 0 },
          { name: 'Sweetness', value: '0%', additionalPrice: 0 },
        ],
      },
    ],
    subtotal: 12.0,
    estimatedTax: 1.05,
    total: 13.05,
    status: 'new',
    pickupLocation: downtown,
    pickupDate: '2026-10-18',
    pickupTime: '09:30',
    paymentStatus: 'paid',
    createdAt: '2026-10-18T16:15:00Z',
  },
  {
    id: 'ord-1005',
    customerId: 'cust-jordan-kim',
    customerName: 'Jordan Kim',
    items: [
      {
        productId: 'prod-brown-sugar-milk-tea',
        productName: 'Brown Sugar Milk Tea',
        quantity: 2,
        unitPrice: 6.5,
        totalPrice: 13.0,
        selectedOptions: [
          { name: 'Size', value: 'Regular (12 oz)', additionalPrice: 0 },
          { name: 'Sweetness', value: '100%', additionalPrice: 0 },
          { name: 'Milk', value: 'Whole', additionalPrice: 0 },
          { name: 'Add-on', value: 'Tapioca pearls', additionalPrice: 0.75 },
        ],
        specialInstructions: 'Light ice, please.',
      },
    ],
    subtotal: 13.0,
    estimatedTax: 1.14,
    total: 14.14,
    status: 'preparing',
    pickupLocation: downtown,
    pickupDate: '2026-10-18',
    pickupTime: '09:20',
    paymentStatus: 'paid',
    createdAt: '2026-10-18T16:05:00Z',
  },
  {
    id: 'ord-1004',
    customerName: 'Chris (guest)',
    items: [
      {
        productId: 'prod-vanilla-latte',
        productName: 'Vanilla Latte',
        quantity: 1,
        unitPrice: 5.75,
        totalPrice: 5.75,
        selectedOptions: [
          { name: 'Size', value: 'Regular (12 oz)', additionalPrice: 0 },
          { name: 'Temperature', value: 'Hot', additionalPrice: 0 },
          { name: 'Sweetness', value: '100%', additionalPrice: 0 },
          { name: 'Milk', value: 'Whole', additionalPrice: 0 },
        ],
      },
    ],
    subtotal: 5.75,
    estimatedTax: 0.5,
    total: 6.25,
    status: 'ready',
    pickupLocation: downtown,
    pickupDate: '2026-10-18',
    pickupTime: '09:10',
    paymentStatus: 'paid',
    createdAt: '2026-10-18T15:55:00Z',
  },
  {
    id: 'ord-1003',
    customerId: 'cust-alex-rivera',
    customerName: 'Alex Rivera',
    items: [
      {
        productId: 'prod-hibiscus-rose-tisane',
        productName: 'Hibiscus Rose Tisane',
        quantity: 1,
        unitPrice: 5.0,
        totalPrice: 5.0,
        selectedOptions: [
          { name: 'Size', value: 'Large (16 oz)', additionalPrice: 0.75 },
          { name: 'Temperature', value: 'Iced', additionalPrice: 0 },
          { name: 'Sweetness', value: '50%', additionalPrice: 0 },
        ],
      },
      {
        productId: 'prod-brown-sugar-milk-tea',
        productName: 'Brown Sugar Milk Tea',
        quantity: 1,
        unitPrice: 7.25,
        totalPrice: 7.25,
        selectedOptions: [
          { name: 'Size', value: 'Large (16 oz)', additionalPrice: 0.75 },
          { name: 'Sweetness', value: '50%', additionalPrice: 0 },
          { name: 'Milk', value: 'Almond', additionalPrice: 0.75 },
        ],
      },
    ],
    subtotal: 12.25,
    estimatedTax: 1.07,
    total: 13.32,
    status: 'completed',
    pickupLocation: downtown,
    pickupDate: '2026-10-12',
    pickupTime: '14:00',
    paymentStatus: 'paid',
    createdAt: '2026-10-12T20:45:00Z',
  },
  {
    id: 'ord-1002',
    customerId: 'cust-sam-patel',
    customerName: 'Sam Patel',
    items: [
      {
        productId: 'prod-vanilla-latte',
        productName: 'Vanilla Latte',
        quantity: 1,
        unitPrice: 7.25,
        totalPrice: 7.25,
        selectedOptions: [
          { name: 'Size', value: 'Large (16 oz)', additionalPrice: 0.75 },
          { name: 'Temperature', value: 'Iced', additionalPrice: 0 },
          { name: 'Sweetness', value: '100%', additionalPrice: 0 },
          { name: 'Milk', value: 'Oat', additionalPrice: 0.75 },
        ],
      },
    ],
    subtotal: 7.25,
    estimatedTax: 0.63,
    total: 7.88,
    status: 'cancelled',
    pickupLocation: downtown,
    pickupDate: '2026-10-10',
    pickupTime: '08:45',
    paymentStatus: 'refunded',
    specialInstructions: 'Cancelled by customer before preparation.',
    createdAt: '2026-10-10T15:30:00Z',
  },
  {
    id: 'ord-1001',
    customerId: 'cust-jordan-kim',
    customerName: 'Jordan Kim',
    items: [
      {
        productId: 'prod-earl-grey-espresso-latte',
        productName: 'Earl Grey Espresso Latte',
        quantity: 1,
        unitPrice: 6.25,
        totalPrice: 6.25,
        selectedOptions: [
          { name: 'Size', value: 'Regular (12 oz)', additionalPrice: 0 },
          { name: 'Temperature', value: 'Hot', additionalPrice: 0 },
          { name: 'Sweetness', value: '100%', additionalPrice: 0 },
          { name: 'Milk', value: 'Whole', additionalPrice: 0 },
        ],
        specialInstructions: 'Extra hot.',
      },
    ],
    subtotal: 6.25,
    estimatedTax: 0.55,
    total: 6.8,
    status: 'refunded',
    pickupLocation: downtown,
    pickupDate: '2026-10-05',
    pickupTime: '11:15',
    paymentStatus: 'refunded',
    createdAt: '2026-10-05T18:00:00Z',
  },
]
