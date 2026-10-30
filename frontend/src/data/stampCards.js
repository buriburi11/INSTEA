/**
 * Mock stamp cards and stamp history for the Rewards page.
 * Shapes follow `StampCard` and `StampHistoryEntry` in ../types/models.js.
 *
 * Only Alex Rivera has cards, so other demo customers show the empty state.
 * There is one card in each state: active, completed and expired.
 */

/** @typedef {import('../types/models').StampCard} StampCard */
/** @typedef {import('../types/models').StampHistoryEntry} StampHistoryEntry */

/** @type {StampCard[]} */
export const stampCards = [
  { id: 'sc-milk-tea', customerId: 'cust-alex-rivera', name: 'Milk Tea Ritual', reward: 'Free Regular Milk Tea', stampsRequired: 10, stampsEarned: 7, status: 'active', expiresAt: '2027-02-28T23:59:00-08:00' },
  { id: 'sc-matcha', customerId: 'cust-alex-rivera', name: 'Matcha Society', reward: 'Free Ceremonial Matcha', stampsRequired: 8, stampsEarned: 3, status: 'active', expiresAt: '2027-01-31T23:59:00-08:00' },
  { id: 'sc-summer-fruit', customerId: 'cust-alex-rivera', name: 'Summer Fruit Club', reward: 'Free Fruit Tea', stampsRequired: 8, stampsEarned: 8, status: 'completed', expiresAt: '2026-09-30T23:59:00-07:00', completedAt: '2026-08-14T15:10:00-07:00' },
  { id: 'sc-pastry', customerId: 'cust-alex-rivera', name: 'Pastry Pairing', reward: 'Free Croissant', stampsRequired: 6, stampsEarned: 2, status: 'expired', expiresAt: '2026-09-30T23:59:00-07:00' },
]

/** @type {StampHistoryEntry[]} */
export const stampHistory = [
  { id: 'sh-3', customerId: 'cust-alex-rivera', stampCardId: 'sc-milk-tea', cardName: 'Milk Tea Ritual', detail: 'Mobile order #4931', createdAt: '2026-10-27T10:15:00-07:00' },
  { id: 'sh-2', customerId: 'cust-alex-rivera', stampCardId: 'sc-milk-tea', cardName: 'Milk Tea Ritual', detail: 'In-store order #4921', createdAt: '2026-10-25T09:40:00-07:00' },
  { id: 'sh-1', customerId: 'cust-alex-rivera', stampCardId: 'sc-matcha', cardName: 'Matcha Society', detail: 'Mobile order #4890', createdAt: '2026-10-21T14:05:00-07:00' },
]
