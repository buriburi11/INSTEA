/**
 * Decides where service data comes from.
 *
 * While USE_MOCK is true, services return the mock data in src/data/.
 * When the backend is ready, set USE_MOCK to false and point API_BASE_URL at
 * the real API. Services and UI components do not need to change.
 */

export const USE_MOCK = true

// TODO: read this from src/config/env.js (env.apiBaseUrl) once the
// feature/env-config branch is merged.
const API_BASE_URL = 'http://localhost:8080/api'

const MOCK_DELAY_MS = 300

/**
 * Returns a copy of mock data after a short delay, like a network request.
 * Copying means components can't accidentally change the mock data itself.
 *
 * @template T
 * @param {T} data
 * @returns {Promise<T>}
 */
export function mockResponse(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), MOCK_DELAY_MS)
  })
}

/**
 * GETs JSON from the backend. Returns null for 404 (not found) and throws
 * for any other error.
 *
 * @param {string} path e.g. '/products'
 * @returns {Promise<any>}
 */
export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`)
  }

  return response.json()
}
