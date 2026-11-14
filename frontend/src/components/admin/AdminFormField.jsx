import { useId } from 'react'
import './AdminComponents.css'

/**
 * Labeled input, select, textarea, or checkbox. Native control props (value,
 * onChange, disabled, min, etc.) pass through. Select options are children.
 * `className` applies to the field wrapper; ids are generated when omitted.
 *
 * @param {{
 *   label: string,
 *   as?: 'input' | 'select' | 'textarea',
 *   id?: string,
 *   hint?: string,
 *   error?: string,
 *   className?: string,
 *   required?: boolean,
 *   hideLabel?: boolean,
 *   compact?: boolean,
 *   type?: string,
 *   [key: string]: any,
 * }} props
 */
export default function AdminFormField({
  label,
  as: Control = 'input',
  id,
  hint = '',
  error = '',
  className = '',
  required = false,
  hideLabel = false,
  compact = false,
  ...controlProps
}) {
  const generatedId = useId()
  const controlId = id || generatedId
  const checkbox = Control === 'input' && controlProps.type === 'checkbox'
  const search = Control === 'input' && controlProps.type === 'search'
  const describedBy = [
    controlProps['aria-describedby'],
    hint && `${controlId}-hint`,
    error && `${controlId}-error`,
  ].filter(Boolean).join(' ') || undefined

  return (
    <div className={[
      'admin-field',
      checkbox && 'admin-field--checkbox',
      search && 'admin-field--search',
      compact && 'admin-field--compact',
      hideLabel && 'admin-field--label-hidden',
      className,
    ].filter(Boolean).join(' ')}>
      <label className={`admin-field__label${hideLabel ? ' admin-visually-hidden' : ''}`} htmlFor={controlId}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      <Control
        {...controlProps}
        id={controlId}
        className="admin-field__control"
        required={required}
        aria-describedby={describedBy}
        aria-invalid={error ? true : controlProps['aria-invalid']}
      />
      {hint && <p className="admin-field__hint" id={`${controlId}-hint`}>{hint}</p>}
      {error && <p className="admin-field__error" id={`${controlId}-error`} role="alert">{error}</p>}
    </div>
  )
}
