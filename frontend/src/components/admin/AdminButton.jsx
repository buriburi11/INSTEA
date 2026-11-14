import { LoaderCircle } from 'lucide-react'
import './AdminComponents.css'

/**
 * Shared admin action. Explicitly use type="submit" for form submission.
 * Loading disables the button to prevent duplicate submissions.
 * Icon-only buttons must include an aria-label describing the action.
 *
 * @param {{
 *   children: import('react').ReactNode,
 *   variant?: 'primary' | 'secondary' | 'danger',
 *   size?: 'default' | 'compact',
 *   iconOnly?: boolean,
 *   loading?: boolean,
 *   loadingLabel?: string,
 *   disabled?: boolean,
 *   type?: 'button' | 'submit' | 'reset',
 *   className?: string,
 *   [key: string]: any,
 * }} props
 */
export default function AdminButton({
  children,
  variant = 'primary',
  size = 'default',
  iconOnly = false,
  loading = false,
  loadingLabel = 'Saving…',
  disabled = false,
  type = 'button',
  className = '',
  ...buttonProps
}) {
  return (
    <button
      {...buttonProps}
      type={type}
      className={[
        'admin-button',
        `admin-button--${variant}`,
        size === 'compact' && 'admin-button--compact',
        iconOnly && 'admin-button--icon-only',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-label={loading && iconOnly ? loadingLabel : buttonProps['aria-label']}
    >
      {loading
        ? (iconOnly ? <LoaderCircle size={16} aria-hidden="true" /> : loadingLabel)
        : children}
    </button>
  )
}
