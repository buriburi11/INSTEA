import { Heart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import useAuth from '../../auth/useAuth.js'
import useFavorites from '../../favorites/useFavorites.js'
import './FavoriteButton.css'

// INST-71: heart button for marking a product as a favorite.
// Signed-out visitors are sent to sign in, since favorites belong to an account.
export default function FavoriteButton({ productId, productName, className = '' }) {
  const { isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const location = useLocation()
  const favorite = isAuthenticated && isFavorite(productId)

  function handleClick(event) {
    // The button can sit on top of a card link, so don't also follow the link.
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    toggleFavorite(productId)
  }

  return (
    <button
      type="button"
      className={`favorite-button${favorite ? ' active' : ''} ${className}`.trim()}
      aria-pressed={favorite}
      aria-label={
        favorite ? `Remove ${productName} from favorites` : `Add ${productName} to favorites`
      }
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
      onClick={handleClick}
    >
      <Heart size={18} aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} />
    </button>
  )
}
