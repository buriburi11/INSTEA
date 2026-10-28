export function identifierIsValid(identifier) {
  const value = identifier.trim()

  if (value.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  // Allow digits, spaces, parentheses, hyphens,
  // and an optional + at the beginning.
  if (!/^\+?[\d\s()-]+$/.test(value)) {
    return false
  }

  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}