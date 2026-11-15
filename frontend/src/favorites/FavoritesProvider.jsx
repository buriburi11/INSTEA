import { useEffect, useState } from 'react'
import useAuth from '../auth/useAuth.js'
import { FavoritesContext } from './FavoritesContext.js'

// INST-71: each signed-in customer's favorite products (mock).
// Saved in sessionStorage, so favorites last until the browser tab is closed,
// and are kept per customer so two demo accounts don't share favorites.
export const FAVORITES_STORAGE_KEY = 'instea.favorites'

function readStoredFavorites() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(FAVORITES_STORAGE_KEY))
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      return stored
    }
  } catch {
    // Start empty if stored data is missing or invalid.
  }

  return {}
}

export default function FavoritesProvider({ children }) {
  const { customer } = useAuth()
  // { [customerId]: productId[] }
  const [favoritesByCustomer, setFavoritesByCustomer] = useState(readStoredFavorites)

  useEffect(() => {
    sessionStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesByCustomer))
  }, [favoritesByCustomer])

  const favoriteIds = customer ? (favoritesByCustomer[customer.id] ?? []) : []

  function isFavorite(productId) {
    return favoriteIds.includes(productId)
  }

  // Adds the product if it isn't a favorite yet, otherwise removes it.
  function toggleFavorite(productId) {
    if (!customer) return

    setFavoritesByCustomer((current) => {
      const ids = current[customer.id] ?? []
      const nextIds = ids.includes(productId)
        ? ids.filter((id) => id !== productId)
        : [...ids, productId]

      return { ...current, [customer.id]: nextIds }
    })
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}
