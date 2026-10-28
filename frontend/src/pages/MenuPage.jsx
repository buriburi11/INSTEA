import { useState } from 'react'
import { Link } from 'react-router'
import { categories } from '../data/categories'
import { products, PRODUCT_IMAGE_PLACEHOLDER } from '../data/products'
import { formatPrice } from '../utils/cartPricing'
import './MenuPages.css'

function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const visibleProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => product.category === selectedCategory)

  return (
    <main className="menu-page">
      <section className="menu-intro">
        <p className="menu-eyebrow">INSPIRED BY TEA</p>
        <h1>Explore the menu</h1>
        <p>
          Discover slow-steeped teas, creamy milk teas, and coffee favorites.
        </p>
      </section>

      <section className="menu-section" aria-label="Menu">
        <div className="menu-toolbar">
          <div className="category-tabs" aria-label="Filter by category">
            <button
              className={selectedCategory === 'all' ? 'category-tab active' : 'category-tab'}
              type="button"
              aria-pressed={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                className={
                  selectedCategory === category.id
                    ? 'category-tab active'
                    : 'category-tab'
                }
                type="button"
                key={category.id}
                aria-pressed={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <p className="product-count">
            {visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <p className="category-description">
            {categories.find((category) => category.id === selectedCategory)?.description}
          </p>
        )}

        <div className="product-grid">
          {visibleProducts.map((product) => {
            const isAvailable = product.available && !product.soldOut

            return (
              <Link
                className={`product-card ${isAvailable ? '' : 'unavailable'}`}
                to={`/menu/${product.id}`}
                key={product.id}
                aria-label={`${product.name}, ${formatPrice(product.price)}, ${
                  isAvailable ? 'available' : 'sold out'
                }. View details.`}
              >
                <div className="product-image-wrap">
                  <img
                    className="product-image"
                    src={product.imageUrl}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
                    }}
                  />

                  {product.badges?.[0] && (
                    <span className="product-badge">{product.badges[0]}</span>
                  )}

                  {!isAvailable && (
                    <span className="availability-badge sold-out">Sold out</span>
                  )}
                </div>

                <div className="product-card-info">
                  <p className="product-category">
                    {categories.find((category) => category.id === product.category)?.name}
                  </p>
                  <h2>{product.name}</h2>
                  <p className="product-description">{product.description}</p>

                  <div className="product-card-bottom">
                    <span className="product-price">From {formatPrice(product.price)}</span>
                    <span className={isAvailable ? 'availability-text' : 'availability-text sold'}>
                      {isAvailable ? 'Available' : 'Currently unavailable'}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default MenuPage