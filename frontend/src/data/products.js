/**
 * Mock INSTEA menu until backend is ready.
 * Shapes follow `Product` and `ProductOption` in ../types/models.js.
 * `category` must match an id in ./categories.js.
 *
 * Images: `imageUrl` points to /public/images/products/<product id>.jpg.
 * Until real photos are added, components can fall back to
 * PRODUCT_IMAGE_PLACEHOLDER.
 */

/** @typedef {import('../types/models').Product} Product */
/** @typedef {import('../types/models').ProductOption} ProductOption */

export const PRODUCT_IMAGE_PLACEHOLDER = '/images/products/placeholder.svg'

const image = (id) => `/images/products/${id}.jpg`

// Shared option sets. Each entry is one selectable choice; `name` groups the
// choices (e.g. all "Size" entries form one picker).

/** @type {ProductOption[]} */
const drinkSizes = [
  { name: 'Size', value: 'Regular (12 oz)', additionalPrice: 0 },
  { name: 'Size', value: 'Large (16 oz)', additionalPrice: 0.75 },
]

/** @type {ProductOption[]} */
const temperatures = [
  { name: 'Temperature', value: 'Hot', additionalPrice: 0 },
  { name: 'Temperature', value: 'Iced', additionalPrice: 0 },
]

/** @type {ProductOption[]} */
const sweetness = [
  { name: 'Sweetness', value: '100%', additionalPrice: 0 },
  { name: 'Sweetness', value: '50%', additionalPrice: 0 },
  { name: 'Sweetness', value: '0%', additionalPrice: 0 },
]

/** @type {ProductOption[]} */
const milks = [
  { name: 'Milk', value: 'Whole', additionalPrice: 0 },
  { name: 'Milk', value: 'Oat', additionalPrice: 0.75 },
  { name: 'Milk', value: 'Almond', additionalPrice: 0.75 },
]

/** @type {ProductOption[]} */
const boba = [{ name: 'Add-on', value: 'Tapioca pearls', additionalPrice: 0.75 }]

/** @type {Product[]} */
export const products = [
  // ----- Teas -----
  {
    id: 'prod-jasmine-green-tea',
    name: 'Jasmine Green Tea',
    description:
      'Green tea scented with fresh jasmine blossoms. Floral, light, and smooth.',
    category: 'teas',
    price: 4.25,
    imageUrl: image('prod-jasmine-green-tea'),
    available: true,
    soldOut: false,
    badges: ['Bestseller'],
    ingredients: ['Green tea', 'Jasmine blossoms', 'Filtered water'],
    allergens: [],
    calories: 5,
    caffeineLevel: 'medium',
    options: [...drinkSizes, ...temperatures, ...sweetness],
  },
  {
    id: 'prod-hibiscus-rose-tisane',
    name: 'Hibiscus Rose Tisane',
    description:
      'A caffeine-free herbal blend of hibiscus and rose petals. Tart, fruity, and bright.',
    category: 'teas',
    price: 4.25,
    imageUrl: image('prod-hibiscus-rose-tisane'),
    available: true,
    soldOut: false,
    badges: ['Caffeine-free'],
    ingredients: ['Hibiscus', 'Rose petals', 'Orange peel', 'Filtered water'],
    allergens: [],
    calories: 10,
    caffeineLevel: 'none',
    options: [...drinkSizes, ...temperatures, ...sweetness],
  },

  // ----- Milk Teas & Lattes -----
  {
    id: 'prod-brown-sugar-milk-tea',
    name: 'Brown Sugar Milk Tea',
    description:
      'Assam black tea and milk poured over house-made brown sugar syrup. Rich and caramel-sweet.',
    category: 'milk-teas',
    price: 5.75,
    imageUrl: image('prod-brown-sugar-milk-tea'),
    available: true,
    soldOut: false,
    badges: ['Bestseller'],
    ingredients: ['Assam black tea', 'Milk', 'Brown sugar syrup'],
    allergens: ['Milk'],
    calories: 320,
    caffeineLevel: 'medium',
    options: [...drinkSizes, ...sweetness, ...milks, ...boba],
  },
  {
    id: 'prod-taro-milk-tea',
    name: 'Taro Milk Tea',
    description:
      'Creamy taro blended with jasmine green tea and milk. Nutty, sweet, and naturally purple.',
    category: 'milk-teas',
    price: 5.75,
    imageUrl: image('prod-taro-milk-tea'),
    available: true,
    soldOut: true,
    ingredients: ['Taro root', 'Jasmine green tea', 'Milk', 'Cane sugar'],
    allergens: ['Milk'],
    calories: 290,
    caffeineLevel: 'low',
    options: [...drinkSizes, ...sweetness, ...milks, ...boba],
  },

  // ----- Coffee -----
  {
    id: 'prod-earl-grey-espresso-latte',
    name: 'Earl Grey Espresso Latte',
    description:
      'Espresso and steamed milk infused with Earl Grey tea for a bright, citrusy bergamot finish.',
    category: 'coffee',
    price: 6.25,
    imageUrl: image('prod-earl-grey-espresso-latte'),
    available: true,
    soldOut: false,
    badges: ['New'],
    ingredients: ['Espresso', 'Earl Grey tea', 'Milk', 'Cane sugar'],
    allergens: ['Milk'],
    calories: 190,
    caffeineLevel: 'high',
    options: [...drinkSizes, ...temperatures, ...sweetness, ...milks],
  },
  {
    id: 'prod-vanilla-latte',
    name: 'Vanilla Latte',
    description:
      'Double espresso with steamed milk and house-made vanilla bean syrup.',
    category: 'coffee',
    price: 5.75,
    imageUrl: image('prod-vanilla-latte'),
    available: true,
    soldOut: false,
    ingredients: ['Espresso', 'Milk', 'Vanilla bean syrup'],
    allergens: ['Milk'],
    calories: 220,
    caffeineLevel: 'high',
    options: [...drinkSizes, ...temperatures, ...sweetness, ...milks],
  },
]
