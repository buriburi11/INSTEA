// =============
//    IMPORTS
// =============

 import { useMemo, useState } from 'react'
 import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
 import { categories } from '../data/categories'
 import { products, PRODUCT_IMAGE_PLACEHOLDER } from '../data/products'
 import {formatPrice, calculateUnitPrice, calculateItemTotal, } from '../utils/cartPricing'
 import './MenuPages.css'

 // =============
 //    FUNCTIONS
 // =============

 function ProductDetailPage() {
   const { productId } = useParams()                                                                                   // Retrieve the selected product ID from the URL.
   const [searchParams] = useSearchParams()                                                                            // Read URL parameters to determine whether an item is being edited.

   return (                                                                                                            // Reset form state when switching between editing and adding products.
     <ProductDetailContent
       key={`${productId}-${searchParams.get('edit') ?? 'new'}`}
       productId={productId}
     />
   )
 }

 // ------- PRODUCT DETAILS AND CART STATE -------

 function ProductDetailContent({ productId }) {
   const product = products.find((item) => item.id === productId)                                                      // Find the selected product in the shared mock catalog.

   const [searchParams] = useSearchParams()
   const navigate = useNavigate()
   const editIndex = searchParams.get('edit')                                                                          // Retrieve the cart item index when editing an existing item.

   // ------- RESTORE CART ITEM FOR EDITING -------

   const editingItem = (() => {
     if (editIndex === null || !/^\d+$/.test(editIndex)) return null                                                   // Only accept valid numeric cart indices.

     try {
       const cart = JSON.parse(localStorage.getItem('instea-cart') || '[]')                                            // Load previously saved cart items.
       const item = Array.isArray(cart) ? cart[Number(editIndex)] : null

       return item?.productId === productId ? item : null                                                              // Confirm the saved item belongs to the selected product.
     } catch {
       return null                                                                                                     // Continue in normal product mode if cart data is invalid.
     }
   })()

   // ------- GROUP PRODUCT OPTIONS -------

   const optionGroups = useMemo(
     () =>
       (product?.options ?? []).reduce((groups, option) => {
         groups[option.name] ??= []                                                                                    // Create a group for each customization category.
         groups[option.name].push(option)                                                                              // Add the available choice to its corresponding group.
         return groups
       }, {}),
     [product],
   )

   // ------- INITIALIZE SELECTED OPTIONS -------

   const [selectedOptions, setSelectedOptions] = useState(() => {
     const initialOptions = {}

     if (editingItem) {
       Object.entries(optionGroups).forEach(([name, options]) => {
         const isMultiple = options.some(
           (option) => option.selectionType === 'multiple'
         )

         const savedValues = (editingItem.selectedOptions ?? [])
           .filter((saved) =>
             options.some((option) => option.value === saved.value)
           )
           .map((saved) => saved.value)                                                                                // Restore previously selected customization values.

         initialOptions[name] = isMultiple
           ? savedValues                                                                                               // Restore all selections for checkbox groups.
           : savedValues[0] ?? ''                                                                                      // Restore one selection for single-choice groups.
       })

       return initialOptions
     }

     Object.entries(optionGroups).forEach(([name, options]) => {
       const isMultiple = options.some(
         (option) => option.selectionType === 'multiple',
       )
       const isRequired = options.some((option) => option.required)

       initialOptions[name] = isMultiple
         ? []                                                                                                          // Start optional multi-select groups with no selections.
         : isRequired
           ? ''                                                                                                        // Require customers to select required options manually.
           : options[0]?.value ?? ''                                                                                   // Default optional single-choice groups to their first option.
     })

     return initialOptions
   })

   // ------- QUANTITY AND INSTRUCTIONS -------

   const [quantity, setQuantity] = useState(
     () => editingItem?.quantity ?? 1                                                                                  // Restore saved quantity or default to one item.
   )

   const [specialInstructions, setSpecialInstructions] = useState(
     () => editingItem?.specialInstructions ?? ''                                                                      // Restore saved special instructions when editing.
   )

   const [cartMessage, setCartMessage] = useState('')                                                                  // Store cart confirmation or error messages.

   // ------- PRODUCT NOT FOUND -------

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

   // ------- PRODUCT AVAILABILITY -------

   const isAvailable = product.available && !product.soldOut                                                           // Disable purchasing when the product is unavailable.
   const categoryName = categories.find(
     (category) => category.id === product.category,
   )?.name

   // ------- REQUIRED OPTION VALIDATION -------

   const requiredChoicesComplete = Object.entries(optionGroups).every(
     ([name, options]) => {
       const isRequired = options.some((option) => option.required)
       return !isRequired || Boolean(selectedOptions[name])                                                            // Require a selection before allowing the product into the cart.
     },
   )

   // ------- SELECTED OPTIONS AND PRICING -------

   const selectedOptionItems = Object.entries(optionGroups).flatMap(
     ([name, options]) =>
       options.filter((option) =>
         option.selectionType === 'multiple'
           ? selectedOptions[name]?.includes(option.value)
           : selectedOptions[name] === option.value,
       ),
   )

   const selectedUnitPrice = calculateUnitPrice(
     product.price,
     selectedOptionItems                                                                                               // Include the prices of selected add-ons.
   )

   // ------- SINGLE OPTION SELECTION -------

   function chooseSingleOption(groupName, value) {
     setSelectedOptions((current) => ({
       ...current,
       [groupName]: value,                                                                                             // Replace the previous selection within this option group.
     }))
     setCartMessage('')
   }

   // ------- MULTIPLE OPTION SELECTION -------

   function toggleMultipleOption(groupName, value) {
     setSelectedOptions((current) => {
       const currentValues = current[groupName] ?? []
       const nextValues = currentValues.includes(value)
         ? currentValues.filter((item) => item !== value)                                                              // Remove an already selected add-on.
         : [...currentValues, value]                                                                                   // Add a newly selected add-on.

       return { ...current, [groupName]: nextValues }
     })
     setCartMessage('')
   }

   // ------- ADD OR UPDATE CART ITEM -------

   function addToCart() {
     const cartItem = {
       productId: product.id,
       name: product.name,
       imageUrl: product.imageUrl,
       quantity,
       unitPrice: selectedUnitPrice,
       totalPrice: calculateItemTotal(selectedUnitPrice, quantity),                                                    // Calculate the item total using selected options and quantity.
       selectedOptions: selectedOptionItems,                                                                           // Preserve customization choices in the saved cart item.
       specialInstructions: specialInstructions.trim(),
     }

     try {
       const savedCart = JSON.parse(localStorage.getItem('instea-cart') || '[]')
       const cart = Array.isArray(savedCart) ? savedCart : []

       if (editingItem && editIndex !== null) {
         const index = Number(editIndex)

         if (cart[index]?.productId !== productId) {
           setCartMessage('This cart item could not be found. Please return to your cart.')
           return
         }

         cart[index] = cartItem                                                                                        // Replace the existing cart item instead of creating a duplicate.
         localStorage.setItem('instea-cart', JSON.stringify(cart))
         window.dispatchEvent(new Event('instea-cart-updated'))                                                        // Notify the header to refresh its cart quantity.
         navigate('/cart', { replace: true })                                                                          // Return to the Shopping Cart after saving changes.
       } else {
         localStorage.setItem('instea-cart', JSON.stringify([...cart, cartItem]))                                      // Append a new item to the saved cart.
         window.dispatchEvent(new Event('instea-cart-updated'))
         setCartMessage(`${quantity} × ${product.name} added to your demo cart.`)
       }
     } catch {
       setCartMessage('The demo cart could not be saved in this browser.')
     }
   }

   // ===========================
   //    PRODUCT DETAIL DISPLAY
   // ===========================

   return (
     <main className="menu-page detail-page">
       <Link className="back-link" to="/menu">
         ← Back to menu
       </Link>

       <article className="product-detail">

         {/* ------- PRODUCT IMAGE AND INFORMATION ------- */}

         <div className="detail-left">
           <div className="detail-image-wrap">
             <img
               className="detail-image"
               src={product.imageUrl}
               alt={product.name}
               onError={(event) => {
                 event.currentTarget.onerror = null
                 event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER                                                   // Use a placeholder when the product image fails to load.
               }}
             />
           </div>

           {/* ------- PRODUCT STATS ------- */}

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

           {/* ------- INGREDIENTS ------- */}

           <section className="detail-note">
             <h2>Ingredients</h2>
             <p>
               {product.ingredients?.length
                 ? product.ingredients.join(', ')
                 : 'Not listed'}
             </p>
           </section>

           {/* ------- ALLERGENS ------- */}

           <section className="detail-note">
             <h2>Allergens</h2>
             <p>
               {product.allergens?.length
                 ? product.allergens.join(', ')
                 : 'None listed'}
             </p>
           </section>

           {/* ------- QUANTITY AND ADD TO CART ------- */}

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
                   onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                   disabled={quantity >= 99}
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
                 {!isAvailable
                   ? 'Sold out'
                   : editingItem
                     ? 'Save changes'
                     : 'Add to cart'}
               </button>
             </div>

             {/* ------- CURRENT ITEM TOTAL ------- */}

             <div className="current-item-total" aria-live="polite">
               <span>Current total</span>
               <strong>{formatPrice(calculateItemTotal(selectedUnitPrice, quantity))}</strong>
               <small>{formatPrice(selectedUnitPrice)} each</small>
             </div>
           </div>

           {/* ------- REQUIRED OPTION MESSAGE ------- */}

           {!requiredChoicesComplete && (
             <p className="required-hint">
               Choose each required option to continue.
             </p>
           )}

           {/* ------- CART STATUS MESSAGE ------- */}

           {cartMessage && (
             <p className="cart-message" role="status">
               {cartMessage}
             </p>
           )}

           <p className="demo-cart-note">
             Demo cart only. Checkout and inventory are not connected.
           </p>
         </div>

         {/* ------- PRODUCT DESCRIPTION AND CUSTOMIZATION ------- */}

         <div className="detail-info">
           <p className="menu-eyebrow">{categoryName}</p>

           {product.badges?.[0] && (
             <span className="detail-product-badge">{product.badges[0]}</span>
           )}

           <h1>{product.name}</h1>
           <p className="detail-description">{product.description}</p>

           {/* ------- BASE PRICE AND AVAILABILITY ------- */}

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

           {/* ------- PRODUCT OPTION GROUPS ------- */}

           {Object.entries(optionGroups).map(([groupName, options]) => {
             const isRequired = options.some((option) => option.required)                                              // Determine whether the customer must select an option.
             const isMultiple = options.some(
               (option) => option.selectionType === 'multiple',                                                        // Determine whether multiple options can be selected.
             )

             return (
               <fieldset className="detail-option-group" key={groupName}>
                 <legend>
                   <span>{groupName}</span>
                   {isRequired && <small>Required</small>}
                 </legend>

                 {/* ------- MULTIPLE SELECTION OPTIONS ------- */}

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

                   /* ------- SINGLE SELECTION OPTIONS ------- */

                   <div className="detail-option-list">
                     {options.map((option) => {
                       const isSelected =
                         selectedOptions[groupName] === option.value                                                   // Identify the currently selected option.

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

           {/* ------- SPECIAL INSTRUCTIONS ------- */}

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

           {/* ------- ITEM REWARDS ------- */}

           <p className="leaves-note">
             You’ll earn {product.rewardLeaves ?? 0} tea leaves on this item.
           </p>
         </div>
       </article>
     </main>
   )
 }

 export default ProductDetailPage