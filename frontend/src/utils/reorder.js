// INST-70: turns a past order into new cart items, using today's menu.
import { calculateItemTotal, calculateUnitPrice } from './cartPricing.js'

export const CART_STORAGE_KEY = 'instea-cart'

const normalize = (text) => text.trim().toLowerCase()

// A past choice still matches if the menu now uses a longer name for it,
// e.g. "Oat" in an old order matches "Oat milk" on today's menu.
function sameChoice(pastValue, menuValue) {
  const past = normalize(pastValue)
  const current = normalize(menuValue)
  return current === past || current.startsWith(`${past} `)
}

function groupOptions(options = []) {
  return options.reduce((groups, option) => {
    groups[option.name] ??= []
    groups[option.name].push(option)
    return groups
  }, {})
}

// Rebuilds one past item's choices from today's menu options for that product.
// Single-choice groups with no match fall back to the menu's default (the first choice),
// like the product page does. Past choices the menu no longer offers are returned in `changed`.
function rebuildOptions(pastOptions = [], product) {
  const groups = groupOptions(product.options)
  const chosen = []
  const matchedPast = new Set()

  Object.entries(groups).forEach(([name, options]) => {
    const isMultiple = options.some((option) => option.selectionType === 'multiple')
    // Compare within the same group; add-on groups were renamed, so those match by value alone.
    const matches = options.filter((option) =>
      pastOptions.some((past, index) => {
        const isMatch =
          (past.name === name || isMultiple) && sameChoice(past.value, option.value)
        if (isMatch) matchedPast.add(index)
        return isMatch
      }),
    )

    if (isMultiple) {
      chosen.push(...matches)
    } else {
      chosen.push(matches[0] ?? options[0])
    }
  })

  const changed = pastOptions
    .filter((_, index) => !matchedPast.has(index))
    .map((past) => `${past.value} (${past.name})`)

  return { selectedOptions: chosen.filter(Boolean), changed }
}

/**
 * @param {import('../types/models').Order} order
 * @param {import('../types/models').Product[]} products today's menu
 * @returns {{
 *   cartItems: object[],
 *   unavailableItems: string[],
 *   changedOptions: { productName: string, options: string[] }[],
 * }}
 */
export function buildReorderCart(order, products) {
  const cartItems = []
  const unavailableItems = []
  const changedOptions = []

  order.items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId)

    if (!product || !product.available || product.soldOut) {
      unavailableItems.push(item.productName)
      return
    }

    const { selectedOptions, changed } = rebuildOptions(item.selectedOptions, product)
    const unitPrice = calculateUnitPrice(product.price, selectedOptions)

    // Same shape the product page saves, so the cart can edit these items.
    cartItems.push({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
      unitPrice,
      totalPrice: calculateItemTotal(unitPrice, item.quantity),
      selectedOptions,
      specialInstructions: item.specialInstructions ?? '',
    })

    if (changed.length > 0) {
      changedOptions.push({ productName: product.name, options: changed })
    }
  })

  return { cartItems, unavailableItems, changedOptions }
}

export function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

// Replaces the cart and tells the header to update its cart count.
export function replaceCart(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  window.dispatchEvent(new Event('instea-cart-updated'))
}
