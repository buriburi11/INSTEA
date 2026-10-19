import { USE_MOCK, mockResponse, apiGet } from './apiClient.js'
import { products } from '../data/products.js'

/** @typedef {import('../types/models').Product} Product */

/**
 * @returns {Promise<Product[]>}
 */
export async function getProducts() {
  if (USE_MOCK) return mockResponse(products)
  return apiGet('/products')
}

/**
 * @param {string} id
 * @returns {Promise<Product | null>} null if no product has this id
 */
export async function getProductById(id) {
  if (USE_MOCK) return mockResponse(products.find((p) => p.id === id) ?? null)
  return apiGet(`/products/${encodeURIComponent(id)}`)
}
