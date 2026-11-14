import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { products, PRODUCT_IMAGE_PLACEHOLDER } from '../../data/products.js'
import { getProducts } from '../../services/productService.js'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import AdminProducts from './AdminProducts.jsx'

vi.mock('../../services/productService.js', () => ({ getProducts: vi.fn() }))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/products']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products" element={<AdminProducts />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

async function loadPage() {
  const view = renderPage()
  await screen.findByRole('button', { name: 'Edit Jasmine Green Tea' })
  return view
}

function productRow(name) {
  return within(screen.getByRole('button', { name: `Edit ${name}` }).closest('tr'))
}

beforeEach(() => {
  vi.clearAllMocks()
  getProducts.mockResolvedValue(products)
})

describe('admin menu products', () => {
  it('applies search and sorting to the deactivated list', async () => {
    getProducts.mockResolvedValue([
      { id: 'a', name: 'Tea A', price: 10, available: false },
      { id: 'b', name: 'Tea B', price: 2, available: false },
      { id: 'c', name: 'Coffee', price: 5, available: false },
      { id: 'd', name: 'Tea D', price: 3, available: true },
    ])
    renderPage()
    await screen.findByRole('button', { name: 'Edit Tea A' })
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Tea' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort products by' }), { target: { value: 'price-asc' } })
    const deactivated = within(screen.getByRole('table', { name: 'Deactivated products' }))
    expect(deactivated.getAllByRole('button', { name: /^Edit / }).map((button) => button.getAttribute('aria-label')))
      .toEqual(['Edit Tea B', 'Edit Tea A'])
    expect(within(screen.getByRole('table', { name: 'Menu products' })).getByRole('button', { name: 'Edit Tea D' })).toBeInTheDocument()
  })

  it('keeps sold-out products in the main list and lists deactivated products separately', async () => {
    getProducts.mockResolvedValue([
      { id: 'a', name: 'Apple', available: false },
      { id: 'b', name: 'Beta', available: true, soldOut: true },
      { id: 'z', name: 'Zebra', available: true, soldOut: false },
      { id: 'm', name: 'Mango', available: true, soldOut: false },
    ])
    renderPage()
    await screen.findByRole('button', { name: 'Edit Apple' })
    expect(within(screen.getByRole('combobox', { name: 'Sort products by' })).queryByRole('option', { name: 'Status' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('table', { name: 'Menu products' })).getAllByRole('button', { name: /^Edit / })
      .map((button) => button.getAttribute('aria-label'))).toEqual(['Edit Beta', 'Edit Mango', 'Edit Zebra'])
    expect(within(screen.getByRole('table', { name: 'Deactivated products' })).getByRole('button', { name: 'Edit Apple' })).toBeInTheDocument()
  })

  it.each([
    ['name-asc', ['Apple', 'Beta', 'Mango', 'Zebra']],
    ['name-desc', ['Zebra', 'Mango', 'Beta', 'Apple']],
    ['category-asc', ['Apple', 'Beta', 'Mango', 'Zebra']],
    ['price-asc', ['Mango', 'Zebra', 'Beta', 'Apple']],
    ['price-desc', ['Apple', 'Beta', 'Zebra', 'Mango']],
  ])('sorts products using %s', async (sort, expected) => {
    const sampleProducts = [
      { id: 'z', name: 'Zebra', category: 'teas', price: 2, available: true },
      { id: 'a', name: 'Apple', category: 'coffee', price: 10, available: true },
      { id: 'm', name: 'Mango', category: 'milk-teas', price: 0, available: true },
      { id: 'b', name: 'Beta', category: 'coffee', price: 5, available: true },
    ]
    getProducts.mockResolvedValue(sampleProducts)
    renderPage()
    await screen.findByRole('button', { name: 'Edit Apple' })
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort products by' }), { target: { value: sort } })
    const names = within(screen.getByRole('table', { name: 'Menu products' }))
      .getAllByRole('button', { name: /^Edit / }).map((button) => button.getAttribute('aria-label').slice(5))
    expect(names).toEqual(expected)
    expect(sampleProducts.map((product) => product.name)).toEqual(['Zebra', 'Apple', 'Mango', 'Beta'])
  })

  it('keeps invalid prices last and applies the selected sorting to search results', async () => {
    getProducts.mockResolvedValue([
      { id: 'a', name: 'Tea A', price: null, category: 'teas', available: true },
      { id: 'b', name: 'Tea B', price: 10, category: 'teas', available: true },
      { id: 'c', name: 'Tea C', price: 2, category: 'teas', available: true },
      { id: 'd', name: 'Coffee', price: 1, category: 'coffee', available: true },
    ])
    renderPage()
    await screen.findByRole('button', { name: 'Edit Tea A' })
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Tea' } })
    for (const [sort, expected] of [['price-asc', ['Edit Tea C', 'Edit Tea B', 'Edit Tea A']], ['price-desc', ['Edit Tea B', 'Edit Tea C', 'Edit Tea A']]]) {
      fireEvent.change(screen.getByRole('combobox', { name: 'Sort products by' }), { target: { value: sort } })
      expect(within(screen.getByRole('table', { name: 'Menu products' })).getAllByRole('button', { name: /^Edit / }).map((button) => button.getAttribute('aria-label'))).toEqual(expected)
    }
  })

  it('lists existing products with categories, prices, availability, and safe image fallbacks', async () => {
    await loadPage()
    const row = productRow('Jasmine Green Tea')
    expect(row.getByText('Teas')).toBeInTheDocument()
    expect(row.getByText('$4.25')).toBeInTheDocument()
    expect(row.getByText('Available')).toBeInTheDocument()
    expect(productRow('Taro Milk Tea').getByText('Sold out')).toBeInTheDocument()
    const image = row.getByRole('presentation')
    fireEvent.error(image)
    expect(image).toHaveAttribute('src', PRODUCT_IMAGE_PLACEHOLDER)
    fireEvent.error(image)
    expect(image).toHaveAttribute('src', PRODUCT_IMAGE_PLACEHOLDER)
  })

  it('adds a product with basic fields, including a valid zero price', async () => {
    await loadPage()
    fireEvent.click(screen.getByRole('button', { name: 'New product' }))
    const form = within(screen.getByRole('region', { name: 'New product' }))
    expect(form.getByRole('textbox', { name: 'Product name' })).toHaveFocus()
    fireEvent.change(form.getByRole('textbox', { name: 'Product name' }), { target: { value: 'Sample Tea' } })
    fireEvent.change(form.getByRole('textbox', { name: 'Description' }), { target: { value: 'A sample drink.' } })
    fireEvent.change(form.getByRole('spinbutton', { name: 'Price (USD)' }), { target: { value: '0' } })
    fireEvent.change(form.getByRole('combobox', { name: 'Category' }), { target: { value: 'coffee' } })
    fireEvent.click(form.getByRole('button', { name: 'Add product' }))
    const row = productRow('Sample Tea')
    expect(row.getByText('$0.00')).toBeInTheDocument()
    expect(row.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('Sample Tea added in this preview.')).toBeInTheDocument()
    expect(products.some((product) => product.name === 'Sample Tea')).toBe(false)
  })

  it('validates missing names and invalid prices before adding products', async () => {
    await loadPage()
    fireEvent.click(screen.getByRole('button', { name: 'New product' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add product' }))
    expect(screen.getByText('Enter a product name.')).toBeInTheDocument()
    expect(screen.getByText('Enter a non-negative price with up to two decimal places.')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Product name' }), { target: { value: 'Sample Tea' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Price (USD)' }), { target: { value: '-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add product' }))
    expect(screen.getByRole('spinbutton', { name: 'Price (USD)' })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('button', { name: 'Edit Sample Tea' })).not.toBeInTheDocument()
  })

  it('prefills edits, updates the preview, and retains saved descriptions and availability', async () => {
    await loadPage()
    fireEvent.click(screen.getByRole('button', { name: 'Edit Jasmine Green Tea' }))
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(products[0].description)
    fireEvent.change(screen.getByRole('textbox', { name: 'Product name' }), { target: { value: 'Jasmine Reserve' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Price (USD)' }), { target: { value: '5.50' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Availability' }), { target: { value: 'sold-out' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    const row = productRow('Jasmine Reserve')
    expect(row.getByText('$5.50')).toBeInTheDocument()
    expect(row.getByText('Sold out')).toBeInTheDocument()
    expect(products[0].name).toBe('Jasmine Green Tea')
    fireEvent.click(row.getByRole('button', { name: 'Edit Jasmine Reserve' }))
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(products[0].description)
    expect(screen.getByRole('combobox', { name: 'Availability' })).toHaveValue('sold-out')
  })

  it('discards cancelled edits and restores focus to the opening control', async () => {
    await loadPage()
    const opener = screen.getByRole('button', { name: 'Edit Jasmine Green Tea' })
    fireEvent.click(opener)
    fireEvent.change(screen.getByRole('textbox', { name: 'Product name' }), { target: { value: 'Unsaved name' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('region', { name: 'Edit product' })).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
    expect(productRow('Jasmine Green Tea').getByText('Available')).toBeInTheDocument()
  })

  it('requires confirmation for deactivation, supports cancellation, and retains the product record', async () => {
    await loadPage()
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate Jasmine Green Tea' }))
    expect(screen.getByRole('button', { name: 'Keep product' })).toHaveFocus()
    expect(productRow('Jasmine Green Tea').getByText('Available')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Keep product' }))
    expect(productRow('Jasmine Green Tea').getByText('Available')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate Jasmine Green Tea' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm deactivation' }))
    expect(productRow('Jasmine Green Tea').getByText('Unavailable')).toBeInTheDocument()
    expect(within(screen.getByRole('table', { name: 'Menu products' })).queryByRole('button', { name: 'Edit Jasmine Green Tea' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('table', { name: 'Deactivated products' })).getByRole('button', { name: 'Edit Jasmine Green Tea' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Deactivate Jasmine Green Tea' })).toBeDisabled()
    expect(products[0].available).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Edit Jasmine Green Tea' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Availability' }), { target: { value: 'available' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(productRow('Jasmine Green Tea').getByText('Available')).toBeInTheDocument()
    expect(within(screen.getByRole('table', { name: 'Menu products' })).getByRole('button', { name: 'Edit Jasmine Green Tea' })).toBeInTheDocument()
    expect(within(screen.getByRole('table', { name: 'Deactivated products' })).queryByRole('button', { name: 'Edit Jasmine Green Tea' })).not.toBeInTheDocument()
  })

  it('searches products by name or category and handles no matches', async () => {
    await loadPage()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '  COFFEE  ' } })
    expect(screen.getByRole('button', { name: 'Edit Vanilla Latte' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit Jasmine Green Tea' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'no-such-product' } })
    expect(screen.getByText('No active products match your search.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.getByRole('button', { name: 'Edit Jasmine Green Tea' })).toBeInTheDocument()
  })

  it('shows loading and empty states and lets administrators add their first product', async () => {
    getProducts.mockResolvedValue([])
    renderPage()
    expect(screen.getByText('Loading menu products…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New product' })).toBeDisabled()
    expect(await screen.findByText('No menu products yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New product' })).toBeEnabled()
  })

  it('allows retry after a service error', async () => {
    getProducts.mockRejectedValueOnce(new Error('Network error'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load menu products.')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('button', { name: 'Edit Jasmine Green Tea' })).toBeInTheDocument()
  })

  it('resets preview edits when the page is reopened', async () => {
    const view = await loadPage()
    fireEvent.click(screen.getByRole('button', { name: 'Edit Jasmine Green Tea' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Product name' }), { target: { value: 'Temporary name' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('button', { name: 'Edit Temporary name' })).toBeInTheDocument()
    view.unmount()
    await loadPage()
    expect(screen.queryByRole('button', { name: 'Edit Temporary name' })).not.toBeInTheDocument()
  })
})
