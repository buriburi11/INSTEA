/**
 * Mock INSTEA pickup location. The address is made up.
 * Shape follows `Location` in ../types/models.js.
 */

/** @typedef {import('../types/models').Location} Location */

/** @type {Location[]} */
export const locations = [
  {
    id: 'loc-downtown',
    name: 'INSTEA Downtown',
    address: '123 Tea Leaf Way, Sacramento, CA 95814',
    isOpen: true,
    estimatedPickupTime: '10 min',
  },
]
