import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { Link } from 'react-router'
import FavoriteButton from '../../components/favorites/FavoriteButton.jsx'
import useFavorites from '../../favorites/useFavorites.js'
import { getProducts } from '../../services/productService.js'
import { PRODUCT_IMAGE_PLACEHOLDER } from '../../data/products.js'
import { formatPrice } from '../../utils/cartPricing.js'
import './FavoritesPage.css'

// INST-71: the signed-in customer's favorite products. The page title and
// account tabs come from MemberLayout.

export default function FavoritesPage() {
  const { favoriteIds } = useFavorites()
  const [products, setProducts] = useState(null)
  const [error, setError] = useState('')

  // `ignore` stops a slow response from updating state after the page unmounts.
  useEffect(() => {
    let ignore = false

    getProducts()
      .then((data) => !ignore && setProducts(data))
      .catch(() => !ignore && setError("We couldn't load your favorites. Please try again later."))

    return () => {
      ignore = true
    }
  }, [])

  // Most recently favorited first. Products no longer on the menu are skipped.
  const favorites = products
    ? [...favoriteIds]
        .reverse()
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean)
    : []

  function renderContent() {
    if (error) {
      return (
        <p className="favorites-message" role="alert">
          {error}
        </p>
      )
    }

    if (products === null) {
      return <p className="favorites-message">Loading your favorites…</p>
    }

    if (favorites.length === 0) {
      return (
        <div className="favorites-empty">
          <Heart size={32} aria-hidden="true" />
          <h2>No favorites yet</h2>
          <p>Tap the heart on any drink to save it here.</p>
          <Link to="/menu" className="favorites-empty-link">
            Browse the menu
          </Link>
        </div>
      )
    }

    return (
      <>
        <p className="favorites-count">
          {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'}
        </p>

        <ul className="favorites-grid">
          {favorites.map((product) => {
            const isAvailable = product.available && !product.soldOut

            return (
              <li key={product.id} className="favorites-card">
                <Link to={`/menu/${product.id}`} className="favorites-card-link">
                  <img
                    src={product.imageUrl}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
                    }}
                  />
                  <div className="favorites-card-info">
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                    <div className="favorites-card-bottom">
                      <span className="favorites-card-price">From {formatPrice(product.price)}</span>
                      {!isAvailable && <span className="favorites-card-sold-out">Sold out</span>}
                    </div>
                  </div>
                </Link>

                <FavoriteButton
                  productId={product.id}
                  productName={product.name}
                  className="favorites-card-heart"
                />
              </li>
            )
          })}
        </ul>
      </>
    )
  }

  return <main className="favorites-page">{renderContent()}</main>
}
