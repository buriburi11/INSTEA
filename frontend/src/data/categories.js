/**
 * Menu categories, in the order the menu should display them.
 * Each product's `category` field must match one of these ids.
 *
 * @typedef {Object} ProductCategory
 * @property {string} id
 * @property {string} name
 * @property {string} description
 */

/** @type {ProductCategory[]} */
export const categories = [
  {
    id: 'teas',
    name: 'Teas',
    description: 'Loose-leaf teas, slow-steeped and served hot or iced.',
  },
  {
    id: 'milk-teas',
    name: 'Milk Teas & Lattes',
    description: 'Creamy tea lattes made with your choice of milk.',
  },
  {
    id: 'coffee',
    name: 'Coffee',
    description: 'Espresso drinks and slow-brewed coffee.',
  },
]
