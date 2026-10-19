/**
 * Mock INSTEA customers for account and order-history components.
 * Shape follows `Customer` in ../types/models.js.
 *
 * All records are fictional: emails use the reserved example.com domain and
 * phone numbers use the 555-01xx range reserved for fiction.
 */

/** @typedef {import('../types/models').Customer} Customer */

/** @type {Customer[]} */
export const customers = [
  {
    id: 'cust-alex-rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex.rivera@example.com',
    phone: '(916) 555-0101',
    memberNumber: 'INS-100001',
    membershipTier: 'gold',
    rewardLeaves: 820,
    accountStatus: 'active',
  },
  {
    id: 'cust-jordan-kim',
    firstName: 'Jordan',
    lastName: 'Kim',
    email: 'jordan.kim@example.com',
    phone: '(916) 555-0102',
    memberNumber: 'INS-100002',
    membershipTier: 'silver',
    rewardLeaves: 340,
    accountStatus: 'active',
  },
  {
    id: 'cust-sam-patel',
    firstName: 'Sam',
    lastName: 'Patel',
    email: 'sam.patel@example.com',
    phone: '(916) 555-0103',
    memberNumber: 'INS-100003',
    membershipTier: 'regular',
    rewardLeaves: 45,
    accountStatus: 'active',
  },
  {
    id: 'cust-taylor-brooks',
    firstName: 'Taylor',
    lastName: 'Brooks',
    email: 'taylor.brooks@example.com',
    memberNumber: 'INS-100004',
    membershipTier: 'regular',
    rewardLeaves: 0,
    accountStatus: 'deactivated',
  },
]
