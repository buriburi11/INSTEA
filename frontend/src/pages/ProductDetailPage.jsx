import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { categories } from '../data/categories'
import { products, PRODUCT_IMAGE_PLACEHOLDER } from '../data/products'
import './MenuPages.css'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)

function ProductDetailPage() {
  const { productId } = useParams()

  // Remount the detail content when the selected product changes.
  return <ProductDetailContent key={productId} productId={productId} />
}

function ProductDetailContent({ productId }) {
  const product = products.find((item) => item.id === productId)

  const optionGroups = useMemo(
    () =>
      (product?.options ?? []).reduce((groups, option) => {
        groups[option.name] ??= []
        groups[option.name].push(option)
        return groups
      }, {}),
    [product],
  )

  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initialOptions = {}

    Object.entries(optionGroups).forEach(([name, options]) => {
      const isMultiple = options.some(
        (option) => option.selectionType === 'multiple',
      )
      const isRequired = options.some((option) => option.required)

      // Required choices begin empty. Optional single-choice groups use their
      // first option. Topping checkboxes begin unchecked.
      initialOptions[name] = isMultiple
        ? []
        : isRequired
          ? ''
          : options[0]?.value ?? ''
    })

    return initialOptions
  })

  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [cartMessage, setCartMessage] = useState('')

  if (!product) {
    return (
      <main className="menu-page not-found">
        <h1>Product not found</h1>
        <Link className="back-link" to="/menu">
          ← Back to menu
        </Link>
      </main>
    )
  }

  const isAvailable = product.available && !product.soldOut
  const categoryName = categories.find(
    (category) => category.id === product.category,
  )?.name

  const requiredChoicesComplete = Object.entries(optionGroups).every(
    ([name, options]) => {
      const isRequired = options.some((option) => option.required)
      return !isRequired || Boolean(selectedOptions[name])
    },
  )

  const selectedOptionItems = Object.entries(optionGroups).flatMap(
    ([name, options]) =>
      options.filter((option) =>
        option.selectionType === 'multiple'
          ? selectedOptions[name]?.includes(option.value)
          : selectedOptions[name] === option.value,
      ),
  )

  const selectedUnitPrice =
    product.price +
    selectedOptionItems.reduce(
      (total, option) => total + (option.additionalPrice ?? 0),
      0,
    )

  function chooseSingleOption(groupName, value) {
    setSelectedOptions((current) => ({
      ...current,
      [groupName]: value,
    }))
    setCartMessage('')
  }

  function toggleMultipleOption(groupName, value) {
    setSelectedOptions((current) => {
      const currentValues = current[groupName] ?? []
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value]

      return { ...current, [groupName]: nextValues }
    })
    setCartMessage('')
  }

  function addToCart() {
    const cartItem = {
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      quantity,
      unitPrice: selectedUnitPrice,
      totalPrice: selectedUnitPrice * quantity,
      selectedOptions: selectedOptionItems,
      specialInstructions: specialInstructions.trim(),
    }

    try {
      const savedCart = JSON.parse(localStorage.getItem('instea-cart') || '[]')
      const cart = Array.isArray(savedCart) ? savedCart : []
      localStorage.setItem('instea-cart', JSON.stringify([...cart, cartItem]))
      setCartMessage(`${quantity} × ${product.name} added to your demo cart.`)
    } catch {
      setCartMessage('The demo cart could not be saved in this browser.')
    }
  }

  return (
    <main className="menu-page detail-page">
      <Link className="back-link" to="/menu">
        ← Back to menu
      </Link>

      <article className="product-detail">
        <div className="detail-left">
          <div className="detail-image-wrap">
            <img
              className="detail-image"
              src={product.imageUrl}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
              }}
            />
          </div>

          <div className="detail-stats">
            <div>
              <span>Calories</span>
              <strong>{product.calories ?? '—'}</strong>
            </div>
            <div>
              <span>Caffeine</span>
              <strong className="capitalize">
                {product.caffeineLevel ?? 'Not listed'}
              </strong>
            </div>
            <div>
              <span>Earn</span>
              <strong>{product.rewardLeaves ?? 0} leaves</strong>
            </div>
          </div>

          <section className="detail-note">
            <h2>Ingredients</h2>
            <p>
              {product.ingredients?.length
                ? product.ingredients.join(', ')
                : 'Not listed'}
            </p>
          </section>

          <section className="detail-note">
            <h2>Allergens</h2>
            <p>
              {product.allergens?.length
                ? product.allergens.join(', ')
                : 'None listed'}
            </p>
          </section>

          <div className="detail-cart-panel">
            <div className="detail-cart-actions">
                <div className="quantity-control" aria-label="Quantity">
                <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    disabled={quantity <= 1}
                >
                    −
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((current) => current + 1)}
                >
                    +
                </button>
                </div>

                <button
                className="add-to-cart-button"
                type="button"
                disabled={!isAvailable || !requiredChoicesComplete}
                onClick={addToCart}
                >
                {isAvailable ? 'Add to cart' : 'Sold out'}
                </button>
            </div>

            <div className="current-item-total" aria-live="polite">
                <span>Current total</span>
                <strong>{formatPrice(selectedUnitPrice * quantity)}</strong>
                <small>{formatPrice(selectedUnitPrice)} each</small>
            </div>
            </div>

          {!requiredChoicesComplete && (
            <p className="required-hint">
              Choose each required option to continue.
            </p>
          )}

          {cartMessage && (
            <p className="cart-message" role="status">
              {cartMessage}
            </p>
          )}

          <p className="demo-cart-note">
            Demo cart only. Checkout and inventory are not connected.
          </p>
        </div>

        <div className="detail-info">
          <p className="menu-eyebrow">{categoryName}</p>

          {product.badges?.[0] && (
            <span className="detail-product-badge">{product.badges[0]}</span>
          )}

          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>

          <div className="detail-price-row">
            <div>
              <span className="detail-price-caption">From</span>
              <p className="detail-price">{formatPrice(product.price)}</p>
            </div>
            <span
              className={
                isAvailable
                  ? 'detail-availability'
                  : 'detail-availability sold'
              }
            >
              {isAvailable ? 'Available' : 'Sold out'}
            </span>
          </div>

          {Object.entries(optionGroups).map(([groupName, options]) => {
            const isRequired = options.some((option) => option.required)
            const isMultiple = options.some(
              (option) => option.selectionType === 'multiple',
            )

            return (
              <fieldset className="detail-option-group" key={groupName}>
                <legend>
                  <span>{groupName}</span>
                  {isRequired && <small>Required</small>}
                </legend>

                {isMultiple ? (
                  <div className="addon-list">
                    {options.map((option) => (
                      <label className="addon-row" key={option.value}>
                        <input
                          type="checkbox"
                          checked={
                            selectedOptions[groupName]?.includes(
                              option.value,
                            ) ?? false
                          }
                          onChange={() =>
                            toggleMultipleOption(groupName, option.value)
                          }
                        />
                        <span>{option.value}</span>
                        <small>
                          +{formatPrice(option.additionalPrice ?? 0)}
                        </small>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="detail-option-list">
                    {options.map((option) => {
                      const isSelected =
                        selectedOptions[groupName] === option.value

                      return (
                        <button
                          className={`detail-option ${
                            isSelected ? 'selected' : ''
                          }`}
                          type="button"
                          key={option.value}
                          aria-pressed={isSelected}
                          onClick={() =>
                            chooseSingleOption(groupName, option.value)
                          }
                        >
                          <span>{option.value}</span>
                          {option.additionalPrice > 0 && (
                            <small>
                              +{formatPrice(option.additionalPrice)}
                            </small>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </fieldset>
            )
          })}

          <section className="detail-instructions">
            <label htmlFor="special-instructions">
              Special instructions
            </label>
            <textarea
              id="special-instructions"
              maxLength={140}
              placeholder="e.g. extra hot, no straw"
              value={specialInstructions}
              onChange={(event) => setSpecialInstructions(event.target.value)}
            />
            <span>{specialInstructions.length}/140</span>
          </section>

          <p className="leaves-note">
            You’ll earn {product.rewardLeaves ?? 0} tea leaves on this item.
          </p>

        </div>
      </article>
    </main>
  )
}

export default ProductDetailPage