/**
 * Secure Auth Storage
 * Token and user data persistence with security best practices
 */

import type { User, Organization } from '@/types/auth'

// ============================================================================
// STORAGE KEYS
// ============================================================================

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  USER: 'verity_user',
  ORGANIZATION: 'verity_org',
  REMEMBER_ME: 'verity_remember_me'
} as const

// ============================================================================
// USER STORAGE
// ============================================================================

/**
 * Stores user data
 */
export function setUser(user: User): void {
  if (typeof window === 'undefined') return

  const storage = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)
    ? localStorage
    : sessionStorage
  storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

/**
 * Retrieves user data
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null

  let userData = sessionStorage.getItem(STORAGE_KEYS.USER)
  if (!userData && localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)) {
    userData = localStorage.getItem(STORAGE_KEYS.USER)
  }

  if (!userData) return null

  try {
    return JSON.parse(userData) as User
  } catch {
    clearUser()
    return null
  }
}

/**
 * Clears user data
 */
export function clearUser(): void {
  if (typeof window === 'undefined') return

  sessionStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.USER)
}

// ============================================================================
// ORGANIZATION STORAGE
// ============================================================================

/**
 * Stores organization data
 */
export function setOrganization(org: Organization): void {
  if (typeof window === 'undefined') return

  const storage = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)
    ? localStorage
    : sessionStorage
  storage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(org))
}

/**
 * Retrieves organization data
 */
export function getOrganization(): Organization | null {
  if (typeof window === 'undefined') return null

  let orgData = sessionStorage.getItem(STORAGE_KEYS.ORGANIZATION)
  if (!orgData && localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)) {
    orgData = localStorage.getItem(STORAGE_KEYS.ORGANIZATION)
  }

  if (!orgData) return null

  try {
    return JSON.parse(orgData) as Organization
  } catch {
    clearOrganization()
    return null
  }
}

/**
 * Clears organization data
 */
export function clearOrganization(): void {
  if (typeof window === 'undefined') return

  sessionStorage.removeItem(STORAGE_KEYS.ORGANIZATION)
  localStorage.removeItem(STORAGE_KEYS.ORGANIZATION)
}

// ============================================================================
// COMPLETE CLEAR (LOGOUT)
// ============================================================================

/**
 * Clears all auth-related storage (full logout)
 */
export function clearAllAuthData(): void {
  if (typeof window === 'undefined') return

  // Clear all storage keys
  Object.values(STORAGE_KEYS).forEach((key) => {
    sessionStorage.removeItem(key)
    localStorage.removeItem(key)
  })
}

// ============================================================================
// SESSION STATUS
// ============================================================================

/**
 * Checks if user has an active session (based on user data presence)
 * Note: Real validation happens on API calls via cookies
 */
export function hasActiveSession(): boolean {
  return !!getUser()
}

/**
 * Gets complete auth state from storage
 */
export function getStoredAuthState(): {
  user: User | null
  organization: Organization | null
  isAuthenticated: boolean
} {
  const user = getUser()
  const organization = getOrganization()
  const isAuthenticated = hasActiveSession()

  return {
    user,
    organization,
    isAuthenticated
  }
}

/**
 * Persists complete auth state after login
 */
export function persistAuthState(
  user: User,
  organization: Organization,
  rememberMe: boolean = false
): void {
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true')
  } else {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
  }
  
  setUser(user)
  setOrganization(organization)
}
