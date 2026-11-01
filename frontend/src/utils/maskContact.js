// Shows enough of a contact to recognize it without exposing all of it.
// Used by the verification and password-recovery pages.

// "alex.rivera@example.com" -> "a***@example.com"
export function maskEmail(email) {
  const [name, domain] = email.trim().split('@')
  return `${name.charAt(0)}***@${domain}`
}

// "(916) 555-0101" -> "(***) ***-0101"
export function maskPhone(phone) {
  const lastFour = phone.replace(/\D/g, '').slice(-4)
  return `(***) ***-${lastFour}`
}

// Masks either an email or a phone number.
export function maskContact(contact) {
  return contact.includes('@') ? maskEmail(contact) : maskPhone(contact)
}
