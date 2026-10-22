import { useState } from 'react'
import { customers } from '../data/customers.js'
import { AuthContext } from './AuthContext.js'

const CUSTOMER_STORAGE_KEY = 'instea.mockCustomer'
const DEMO_PASSWORD = 'Tea12345'

function readStoredCustomer() {
  try {
    const savedCustomer =
      localStorage.getItem(CUSTOMER_STORAGE_KEY) ??
      sessionStorage.getItem(CUSTOMER_STORAGE_KEY)

    return savedCustomer ? JSON.parse(savedCustomer) : null
  } catch {
    return null
  }
}

function storeCustomer(customer, remember = false) {
  localStorage.removeItem(CUSTOMER_STORAGE_KEY)
  sessionStorage.removeItem(CUSTOMER_STORAGE_KEY)

  const storage = remember ? localStorage : sessionStorage
  storage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer))
}

function normalizeIdentifier(value) {
  return value.trim().toLowerCase().replace(/[()\s-]/g, '')
}

function findCustomer(identifier) {
  const normalizedIdentifier = normalizeIdentifier(identifier)

  return customers.find((customer) => {
    const email = normalizeIdentifier(customer.email ?? '')
    const phone = normalizeIdentifier(customer.phone ?? '')

    return (
      normalizedIdentifier === email ||
      normalizedIdentifier === phone
    )
  })
}

export default function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(readStoredCustomer)

  function login({ identifier, password, remember = false }) {
    const matchingCustomer = findCustomer(identifier)

    if (
      !matchingCustomer ||
      matchingCustomer.accountStatus !== 'active' ||
      password !== DEMO_PASSWORD
    ) {
      return {
        success: false,
        message: 'The email, phone number, or password is incorrect.',
      }
    }

    const loggedInCustomer = structuredClone(matchingCustomer)

    storeCustomer(loggedInCustomer, remember)
    setCustomer(loggedInCustomer)

    return {
      success: true,
      customer: loggedInCustomer,
    }
  }

  function register({ fullName, identifier, password }) {
    const trimmedName = fullName.trim()
    const trimmedIdentifier = identifier.trim()

    if (!trimmedName || !trimmedIdentifier || !password) {
      return {
        success: false,
        message: 'Please complete all required fields.',
      }
    }

    if (findCustomer(trimmedIdentifier)) {
      return {
        success: false,
        message: 'An account already exists with that email or phone number.',
      }
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      return {
        success: false,
        message:
          'Password must contain at least 8 characters, one uppercase letter, and one number.',
      }
    }

    const nameParts = trimmedName.split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ')
    const isEmail = trimmedIdentifier.includes('@')

    const newCustomer = {
      id: `cust-${Date.now()}`,
      firstName,
      lastName,
      email: isEmail ? trimmedIdentifier.toLowerCase() : '',
      phone: isEmail ? '' : trimmedIdentifier,
      memberNumber: `INS-${Date.now().toString().slice(-6)}`,
      membershipTier: 'regular',
      rewardLeaves: 100,
      accountStatus: 'active',
    }

    storeCustomer(newCustomer)
    setCustomer(newCustomer)

    return {
      success: true,
      customer: newCustomer,
    }
  }

  function logout() {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY)
    sessionStorage.removeItem(CUSTOMER_STORAGE_KEY)
    setCustomer(null)
  }

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: Boolean(customer),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}