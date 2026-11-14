import { useEffect, useRef, useState } from 'react'
import { Archive, Pencil, Plus } from 'lucide-react'
import AdminTable from '../../components/admin/AdminTable.jsx'
import AdminFormField from '../../components/admin/AdminFormField.jsx'
import AdminButton from '../../components/admin/AdminButton.jsx'
import { getProducts } from '../../services/productService.js'
import { categories } from '../../data/categories.js'
import { PRODUCT_IMAGE_PLACEHOLDER } from '../../data/products.js'
import './AdminProducts.css'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const textSort = new Intl.Collator('en', { sensitivity: 'base', numeric: true })

function categoryLabel(product) {
  return categories.find((category) => category.id === product.category)?.name || product.category || 'Not available'
}

function availability(product) {
  return !product.available ? 'unavailable' : product.soldOut ? 'sold-out' : 'available'
}

const availabilityLabels = { available: 'Available', 'sold-out': 'Sold out', unavailable: 'Unavailable' }

function ProductForm({ product, onSave, onCancel }) {
  const formRef = useRef(null)
  const [values, setValues] = useState(() => ({
    name: product?.name ?? '',
    description: product?.description ?? '',
    category: product?.category ?? categories[0].id,
    price: product?.price === undefined ? '' : String(product.price),
    availability: product ? availability(product) : 'available',
  }))
  const [errors, setErrors] = useState({})

  useEffect(() => { formRef.current?.querySelector('input')?.focus() }, [])

  function change(field) {
    return (event) => setValues((previous) => ({ ...previous, [field]: event.target.value }))
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Enter a product name.'
    if (!categories.some((category) => category.id === values.category)) nextErrors.category = 'Choose a menu category.'
    if (!/^\d+(\.\d{1,2})?$/.test(values.price) || !Number.isFinite(Number(values.price))) {
      nextErrors.price = 'Enter a non-negative price with up to two decimal places.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      formRef.current?.elements.namedItem(Object.keys(nextErrors)[0])?.focus()
      return
    }
    onSave({
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category,
      price: Number(values.price),
      available: values.availability !== 'unavailable',
      soldOut: values.availability === 'sold-out',
    })
  }

  return (
    <section className="admin-product-panel" aria-labelledby="admin-product-form-heading">
      <h2 id="admin-product-form-heading">{product ? 'Edit product' : 'New product'}</h2>
      <form ref={formRef} className="admin-product-form" onSubmit={submit} noValidate>
        <AdminFormField label="Product name" name="name" value={values.name} onChange={change('name')} required error={errors.name} />
        <AdminFormField as="textarea" label="Description" name="description" value={values.description} onChange={change('description')} />
        <div className="admin-product-form-row">
          <AdminFormField as="select" label="Category" name="category" value={values.category} onChange={change('category')} required error={errors.category}>
            {!categories.some((category) => category.id === values.category) && <option value={values.category}>Choose a category</option>}
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </AdminFormField>
          <AdminFormField label="Price (USD)" name="price" type="number" min="0" step="0.01" value={values.price} onChange={change('price')} required error={errors.price} />
          <AdminFormField as="select" label="Availability" name="availability" value={values.availability} onChange={change('availability')}>
            {Object.entries(availabilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </AdminFormField>
        </div>
        <div className="admin-product-form-actions">
          <AdminButton variant="secondary" onClick={onCancel}>Cancel</AdminButton>
          <AdminButton type="submit">{product ? 'Save changes' : 'Add product'}</AdminButton>
        </div>
      </form>
    </section>
  )
}

function DeactivateConfirmation({ product, onConfirm, onCancel }) {
  const cancelRef = useRef(null)
  useEffect(() => { cancelRef.current?.focus() }, [])
  return (
    <section className="admin-product-panel admin-product-confirm" aria-labelledby="admin-deactivate-heading">
      <h2 id="admin-deactivate-heading">Deactivate {product.name}?</h2>
      <p>This will mark the product unavailable in this preview. Its record will be kept.</p>
      <div className="admin-product-form-actions">
        <AdminButton ref={cancelRef} variant="secondary" onClick={onCancel}>Keep product</AdminButton>
        <AdminButton variant="danger" onClick={onConfirm}>Confirm deactivation</AdminButton>
      </div>
    </section>
  )
}

export default function AdminProducts() {
  const [request, setRequest] = useState({ status: 'loading', products: [], error: '' })
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name-asc')
  const [editor, setEditor] = useState(null)
  const [pendingDeactivation, setPendingDeactivation] = useState(null)
  const [notice, setNotice] = useState('')
  const returnFocusRef = useRef(null)

  useEffect(() => {
    let ignore = false
    getProducts()
      .then((data) => {
        if (data !== null && !Array.isArray(data)) throw new Error('Invalid products response')
        if (!ignore) setRequest({ status: 'ready', products: data ?? [], error: '' })
      })
      .catch(() => {
        if (!ignore) setRequest({ status: 'error', products: [], error: 'We couldn’t load menu products. Please try again.' })
      })
    return () => { ignore = true }
  }, [attempt])

  function closePanel() {
    setEditor(null)
    setPendingDeactivation(null)
    returnFocusRef.current?.focus()
  }

  function openEditor(product, trigger) {
    returnFocusRef.current = trigger
    setNotice('')
    setPendingDeactivation(null)
    setEditor({ product })
  }

  function saveProduct(fields) {
    const existing = editor.product
    const product = existing
      ? { ...existing, ...fields }
      : { id: `prod-${crypto.randomUUID()}`, imageUrl: PRODUCT_IMAGE_PLACEHOLDER, options: [], ...fields }
    setRequest((previous) => ({
      ...previous,
      products: existing
        ? previous.products.map((item) => item.id === existing.id ? product : item)
        : [...previous.products, product],
    }))
    setQuery('')
    setNotice(`${product.name} ${existing ? 'updated' : 'added'} in this preview.`)
    closePanel()
  }

  function confirmDeactivation() {
    setRequest((previous) => ({
      ...previous,
      products: previous.products.map((product) => product.id === pendingDeactivation.id ? { ...product, available: false } : product),
    }))
    setNotice(`${pendingDeactivation.name} marked unavailable in this preview.`)
    closePanel()
  }

  const search = query.trim().toLowerCase()
  const [sortField, sortDirection] = sort.split('-')
  const direction = sortDirection === 'desc' ? -1 : 1
  const visibleProducts = request.products
    .filter((product) => [product.name, product.category, categoryLabel(product)]
      .some((value) => String(value ?? '').toLowerCase().includes(search)))
    .sort((left, right) => {
      let comparison
      if (sortField === 'price') {
        const leftValid = Number.isFinite(left.price) && left.price >= 0
        const rightValid = Number.isFinite(right.price) && right.price >= 0
        // Keep unavailable prices last in either direction.
        if (leftValid !== rightValid) return leftValid ? -1 : 1
        comparison = leftValid ? left.price - right.price : 0
      } else {
        comparison = textSort.compare(
          sortField === 'category' ? categoryLabel(left) : left.name ?? '',
          sortField === 'category' ? categoryLabel(right) : right.name ?? '',
        )
      }
      return comparison * direction || textSort.compare(left.name ?? '', right.name ?? '')
    })
  const activeProducts = visibleProducts.filter((product) => product.available)
  const deactivatedProducts = visibleProducts.filter((product) => !product.available)
  const columns = [
    { key: 'name', label: 'Product', render: (product) => (
      <div className="admin-product-identity">
        <img src={product.imageUrl || PRODUCT_IMAGE_PLACEHOLDER} alt="" onError={(event) => {
          if (event.currentTarget.getAttribute('src') !== PRODUCT_IMAGE_PLACEHOLDER) {
            event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
          }
        }} />
        <strong>{product.name}</strong>
      </div>
    ) },
    { key: 'category', label: 'Category', render: categoryLabel },
    { key: 'price', label: 'Price', render: (product) => Number.isFinite(product.price) && product.price >= 0 ? money.format(product.price) : 'Unavailable' },
    { key: 'availability', label: 'Status', render: (product) => <span className={`admin-product-status admin-product-status--${availability(product)}`}>{availabilityLabels[availability(product)]}</span> },
    { key: 'actions', label: 'Actions', align: 'right', render: (product) => (
      <div className="admin-product-row-actions">
        <AdminButton variant="secondary" size="compact" iconOnly aria-label={`Edit ${product.name}`} onClick={(event) => openEditor(product, event.currentTarget)}>
          <Pencil size={16} aria-hidden="true" />
        </AdminButton>
        <AdminButton variant="secondary" size="compact" iconOnly aria-label={`Deactivate ${product.name}`} disabled={!product.available} onClick={(event) => {
          returnFocusRef.current = event.currentTarget
          setEditor(null)
          setNotice('')
          setPendingDeactivation(product)
        }}>
          <Archive size={16} aria-hidden="true" />
        </AdminButton>
      </div>
    ) },
  ]

  return (
    <section className="admin-products" aria-labelledby="admin-products-heading">
      <header className="admin-products-header">
        <h1 id="admin-products-heading">Menu</h1>
        <div className="admin-products-tools">
          <AdminFormField type="search" label="Search products" hideLabel placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} disabled={request.status !== 'ready'} />
          <AdminFormField as="select" className="admin-products-sort" label="Sort products by" hideLabel value={sort} onChange={(event) => setSort(event.target.value)} disabled={request.status !== 'ready'}>
            <option value="name-asc">Name: A–Z</option>
            <option value="name-desc">Name: Z–A</option>
            <option value="category-asc">Category</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </AdminFormField>
          <AdminButton disabled={request.status !== 'ready'} onClick={(event) => openEditor(null, event.currentTarget)}><Plus size={18} aria-hidden="true" /> New product</AdminButton>
        </div>
      </header>
      <p className="admin-products-preview-note">Preview changes stay on this page until you leave or refresh. They do not update the customer menu.</p>
      <p role="status" aria-live="polite">{notice}</p>
      <AdminTable
        caption="Menu products"
        hideCaption
        columns={columns}
        rows={activeProducts}
        loading={request.status === 'loading'}
        loadingMessage="Loading menu products…"
        error={request.error}
        emptyMessage={!request.products.length ? 'No menu products yet.' : search ? 'No active products match your search.' : 'No active menu products.'}
      />
      {request.status === 'ready' && (
        <AdminTable
          caption="Deactivated products"
          columns={columns}
          rows={deactivatedProducts}
          emptyMessage={search ? 'No deactivated products match your search.' : 'No deactivated products.'}
        />
      )}
      {query && <AdminButton className="admin-products-clear" variant="secondary" size="compact" onClick={() => setQuery('')}>Clear search</AdminButton>}
      {request.status === 'error' && <AdminButton variant="secondary" onClick={() => {
        setRequest({ status: 'loading', products: [], error: '' })
        setAttempt((previous) => previous + 1)
      }}>Try again</AdminButton>}
      {editor && <ProductForm key={editor.product?.id || 'new'} product={editor.product} onSave={saveProduct} onCancel={closePanel} />}
      {pendingDeactivation && <DeactivateConfirmation product={pendingDeactivation} onConfirm={confirmDeactivation} onCancel={closePanel} />}
    </section>
  )
}
