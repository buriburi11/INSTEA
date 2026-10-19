/**
 * Mock INSTEA menu until backend is ready.
 * Product images fall back to the placeholder until real photos are added.
 */

/** @typedef {import('../types/models').Product} Product */
/** @typedef {import('../types/models').ProductOption} ProductOption */

export const PRODUCT_IMAGE_PLACEHOLDER = '/images/products/placeholder.svg'

const image = (id) => `/images/products/${id}.jpg`

/** @type {ProductOption[]} */
const sizes = [
  { name: 'Size', value: 'Regular (12 oz)', additionalPrice: 0, required: true },
  { name: 'Size', value: 'Large (16 oz)', additionalPrice: 0.75, required: true },
]

/** @type {ProductOption[]} */
const temperatures = [
  { name: 'Temperature', value: 'Iced', additionalPrice: 0, required: true },
  { name: 'Temperature', value: 'Hot', additionalPrice: 0, required: true },
]

/** @type {ProductOption[]} */
const sweetness = [
  { name: 'Sweetness', value: '0%', additionalPrice: 0 },
  { name: 'Sweetness', value: '30%', additionalPrice: 0 },
  { name: 'Sweetness', value: '50%', additionalPrice: 0 },
  { name: 'Sweetness', value: '70%', additionalPrice: 0 },
  { name: 'Sweetness', value: '100%', additionalPrice: 0 },
]

/** @type {ProductOption[]} */
const iceLevels = [
  { name: 'Ice level', value: 'No ice', additionalPrice: 0 },
  { name: 'Ice level', value: 'Light', additionalPrice: 0 },
  { name: 'Ice level', value: 'Regular', additionalPrice: 0 },
  { name: 'Ice level', value: 'Extra', additionalPrice: 0 },
]

/** @type {ProductOption[]} */
const milks = [
  { name: 'Milk', value: 'Fresh milk', additionalPrice: 0 },
  { name: 'Milk', value: 'Oat milk', additionalPrice: 0.60 },
  { name: 'Milk', value: 'Almond milk', additionalPrice: 0.60 },
  { name: 'Milk', value: 'No milk', additionalPrice: 0 },
]

/** @type {ProductOption[]} */
const toppings = [
  { name: 'Toppings & add-ons', value: 'Brown sugar pearls', additionalPrice: 0.75, selectionType: 'multiple' },
  { name: 'Toppings & add-ons', value: 'Cheese foam', additionalPrice: 0.90, selectionType: 'multiple' },
  { name: 'Toppings & add-ons', value: 'Honey jelly', additionalPrice: 0.60, selectionType: 'multiple' },
  { name: 'Toppings & add-ons', value: 'Aloe vera', additionalPrice: 0.60, selectionType: 'multiple' },
  { name: 'Toppings & add-ons', value: 'Red bean', additionalPrice: 0.60, selectionType: 'multiple' },
]

/** @type {ProductOption[]} */
/** @type {ProductOption[]} */
const teaOptions = [
  ...sizes,
  ...temperatures,
  ...sweetness,
  ...iceLevels,
  ...toppings,
]

/** @type {ProductOption[]} */
const milkTeaOptions = [
  ...sizes,
  ...temperatures,
  ...sweetness,
  ...iceLevels,
  ...milks,
  ...toppings,
]

/** @type {ProductOption[]} */
const coffeeOptions = [
  ...sizes,
  ...temperatures,
  ...sweetness,
  ...iceLevels,
  ...milks,
  ...toppings,
]

/** @type {Product[]} */
export const products = [
  {
    id: 'prod-jasmine-green-tea',
    name: 'Jasmine Green Tea',
    description: 'Green tea scented with fresh jasmine blossoms. Floral, light, and smooth.',
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
    rewardLeaves: 43,
    options: teaOptions,
  },
  {
    id: 'prod-hibiscus-rose-tisane',
    name: 'Hibiscus Rose Tisane',
    description: 'A caffeine-free herbal blend of hibiscus and rose petals. Tart, fruity, and bright.',
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
    rewardLeaves: 43,
    options: teaOptions,
  },
  {
    id: 'prod-brown-sugar-milk-tea',
    name: 'Brown Sugar Milk Tea',
    description: 'Assam black tea and milk poured over house-made brown sugar syrup. Rich and caramel-sweet.',
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
    rewardLeaves: 58,
    options: milkTeaOptions,
  },
  {
    id: 'prod-taro-milk-tea',
    name: 'Taro Milk Tea',
    description: 'Creamy taro blended with jasmine green tea and milk. Nutty, sweet, and naturally purple.',
    category: 'milk-teas',
    price: 5.75,
    imageUrl: image('prod-taro-milk-tea'),
    available: true,
    soldOut: true,
    ingredients: ['Taro root', 'Jasmine green tea', 'Milk', 'Cane sugar'],
    allergens: ['Milk'],
    calories: 290,
    caffeineLevel: 'low',
    rewardLeaves: 58,
    options: milkTeaOptions,
  },
  {
    id: 'prod-earl-grey-espresso-latte',
    name: 'Earl Grey Espresso Latte',
    description: 'Espresso and steamed milk infused with Earl Grey tea for a bright, citrusy bergamot finish.',
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
    rewardLeaves: 63,
    options: coffeeOptions,
  },
  {
    id: 'prod-vanilla-latte',
    name: 'Vanilla Latte',
    description: 'Double espresso with steamed milk and house-made vanilla bean syrup.',
    category: 'coffee',
    price: 5.75,
    imageUrl: image('prod-vanilla-latte'),
    available: true,
    soldOut: false,
    ingredients: ['Espresso', 'Milk', 'Vanilla bean syrup'],
    allergens: ['Milk'],
    calories: 220,
    caffeineLevel: 'high',
    rewardLeaves: 58,
    options: coffeeOptions,
  },
]