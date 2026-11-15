import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthContext } from '../../auth/AuthContext.js'
import FavoritesProvider, { FAVORITES_STORAGE_KEY } from '../../favorites/FavoritesProvider.jsx'
import MenuPage from '../MenuPage.jsx'
import ProductDetailPage from '../ProductDetailPage.jsx'
import FavoritesPage from './FavoritesPage.jsx'

// INST-71: favorites across the menu, product page, and Favorites tab.
const alex = { id: 'cust-alex-rivera', firstName: 'Alex' }
const jordan = { id: 'cust-jordan-kim', firstName: 'Jordan' }

function renderApp(path, customer = alex) {
  return render(
    <AuthContext.Provider value={{ customer, isAuthenticated: Boolean(customer) }}>
      <FavoritesProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/:productId" element={<ProductDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/login" element={<p>Login page</p>} />
          </Routes>
        </MemoryRouter>
      </FavoritesProvider>
    </AuthContext.Provider>,
  )
}

// The heart's label says what clicking it will do.
const heart = (name, { isFavorite = false } = {}) =>
  screen.getByRole('button', {
    name: isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`,
  })

const savedFavorites = () => JSON.parse(sessionStorage.getItem(FAVORITES_STORAGE_KEY) || '{}')

beforeEach(() => sessionStorage.clear())

describe('Favorites', () => {
  it('marks a product as a favorite from the menu', () => {
    renderApp('/menu')
    fireEvent.click(heart('Vanilla Latte'))
    expect(savedFavorites()[alex.id]).toEqual(['prod-vanilla-latte'])
  })

  it('shows favorite state visually and to screen readers', () => {
    renderApp('/menu')
    const button = heart('Vanilla Latte')
    expect(button).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(button)
    const active = heart('Vanilla Latte', { isFavorite: true })
    expect(active).toHaveAttribute('aria-pressed', 'true')
    expect(active).toHaveClass('active')
  })

  it('removes a product from favorites', () => {
    renderApp('/menu')
    fireEvent.click(heart('Vanilla Latte'))
    fireEvent.click(heart('Vanilla Latte', { isFavorite: true }))
    expect(savedFavorites()[alex.id]).toEqual([])
    expect(heart('Vanilla Latte')).toHaveAttribute('aria-pressed', 'false')
  })

  it('does not open the product page when the heart is clicked', () => {
    renderApp('/menu')
    fireEvent.click(heart('Vanilla Latte'))
    expect(screen.getByRole('heading', { level: 1, name: 'Explore the menu' })).toBeInTheDocument()
  })

  it('can be favorited from the product page', () => {
    renderApp('/menu/prod-jasmine-green-tea')
    fireEvent.click(heart('Jasmine Green Tea'))
    expect(savedFavorites()[alex.id]).toEqual(['prod-jasmine-green-tea'])
  })

  it('lists favorite products on the Favorites page, newest first', async () => {
    sessionStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ [alex.id]: ['prod-vanilla-latte', 'prod-taro-milk-tea'] }),
    )
    renderApp('/favorites')

    const cards = await screen.findAllByRole('listitem')
    expect(cards).toHaveLength(2)
    expect(within(cards[0]).getByRole('heading', { name: 'Taro Milk Tea' })).toBeInTheDocument()
    expect(within(cards[0]).getByText('Sold out')).toBeInTheDocument()
    expect(within(cards[1]).getByRole('link')).toHaveAttribute('href', '/menu/prod-vanilla-latte')
  })

  it('removes a product from the Favorites page', async () => {
    sessionStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ [alex.id]: ['prod-vanilla-latte'] }))
    renderApp('/favorites')

    fireEvent.click(await screen.findByRole('button', { name: 'Remove Vanilla Latte from favorites' }))
    expect(screen.getByRole('heading', { name: 'No favorites yet' })).toBeInTheDocument()
  })

  it('shows an empty state with no favorites', async () => {
    renderApp('/favorites')
    expect(await screen.findByRole('heading', { name: 'No favorites yet' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse the menu' })).toHaveAttribute('href', '/menu')
  })

  it('keeps favorites separate for each customer', async () => {
    sessionStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ [alex.id]: ['prod-vanilla-latte'] }))
    renderApp('/favorites', jordan)
    expect(await screen.findByRole('heading', { name: 'No favorites yet' })).toBeInTheDocument()
  })

  it('sends signed-out visitors to sign in', () => {
    renderApp('/menu', null)
    fireEvent.click(heart('Vanilla Latte'))
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(sessionStorage.getItem(FAVORITES_STORAGE_KEY)).toBe('{}')
  })
})
