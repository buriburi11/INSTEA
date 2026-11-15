/**
 * Mock INSTEA rewards catalog (INST-81), managed on the admin Loyalty page.
 * Rewards match the customer Rewards page and the Figma "Admin loyalty" screen.
 *
 * @typedef {Object} Reward
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} leavesRequired Tea Leaves a customer spends to redeem it
 * @property {number} value what the reward is worth, in USD
 * @property {boolean} active false once deactivated (the record is kept)
 */

/** @type {Reward[]} */
export const rewardsCatalog = [
  {
    id: 'reward-plant-milk-upgrade',
    name: 'Plant Milk Upgrade',
    description: 'Oat or almond milk on any drink.',
    leavesRequired: 100,
    value: 0.75,
    active: true,
  },
  {
    id: 'reward-hojicha-madeleine',
    name: 'Hojicha Butter Madeleine',
    description: 'Baked fresh daily in our atelier kitchen.',
    leavesRequired: 300,
    value: 4.25,
    active: true,
  },
  {
    id: 'reward-any-handcrafted-drink',
    name: 'Any Handcrafted Drink',
    description: 'Any size, any drink on the menu.',
    leavesRequired: 600,
    value: 7.5,
    active: true,
  },
  {
    id: 'reward-reserve-tasting-flight',
    name: 'Reserve Tasting Flight',
    description: 'Curated three-pour flight with tea sommelier notes.',
    leavesRequired: 1000,
    value: 15,
    active: true,
  },
  {
    id: 'reward-ceremonial-kyusu-teapot',
    name: 'Ceremonial Kyusu Teapot',
    description: 'Hand-thrown clay teapot for brewing at home.',
    leavesRequired: 2000,
    value: 48,
    active: true,
  },
  {
    // Seasonal reward that ended Sep 30, so it starts out deactivated.
    id: 'reward-summer-fruit-tea-upgrade',
    name: 'Summer Fruit Tea Upgrade',
    description: 'Seasonal fruit tea upgrade on any drink.',
    leavesRequired: 150,
    value: 1,
    active: false,
  },
]
