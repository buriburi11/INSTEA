/**
 * Mock Tea Leaves history for the Rewards page.
 * Shape follows `LeavesTransaction` in ../types/models.js.
 *
 * Only Alex Rivera has history, so other demo customers show the empty state.
 */

/** @typedef {import('../types/models').LeavesTransaction} LeavesTransaction */

/** @type {LeavesTransaction[]} */
export const leavesTransactions = [
  { id: 'lt-108', customerId: 'cust-alex-rivera', type: 'earned', amount: 68, reason: 'SoHo Tea House', detail: 'Mobile order #4931', pending: true, createdAt: '2026-10-27T10:15:00-07:00' },
  { id: 'lt-107', customerId: 'cust-alex-rivera', type: 'earned', amount: 35, reason: 'SoHo Tea House', detail: 'In-store order #4921', createdAt: '2026-10-25T09:40:00-07:00' },
  { id: 'lt-106', customerId: 'cust-alex-rivera', type: 'earned', amount: 50, reason: '4-Week Streak Bonus', detail: 'Weekly ritual milestone', createdAt: '2026-10-25T09:41:00-07:00' },
  { id: 'lt-105', customerId: 'cust-alex-rivera', type: 'redeemed', amount: -400, reason: 'Cloud Matcha Voucher', detail: 'Mobile redemption', createdAt: '2026-10-21T14:05:00-07:00' },
  { id: 'lt-104', customerId: 'cust-alex-rivera', type: 'adjusted', amount: -42, reason: 'Refund adjustment', detail: 'Order #4870 refunded', createdAt: '2026-10-15T16:30:00-07:00' },
  { id: 'lt-103', customerId: 'cust-alex-rivera', type: 'earned', amount: 10, reason: 'Trivia — 5 correct', detail: 'Daily Mastery Trivia', createdAt: '2026-10-13T12:00:00-07:00' },
  { id: 'lt-102', customerId: 'cust-alex-rivera', type: 'expired', amount: -25, reason: 'Unused leaves expired', detail: 'Leaves older than 12 months', createdAt: '2026-10-04T00:00:00-07:00' },
  { id: 'lt-101', customerId: 'cust-alex-rivera', type: 'earned', amount: 89, reason: 'West Village Atelier', detail: 'In-store order #4802', createdAt: '2026-09-30T08:20:00-07:00' },
]
