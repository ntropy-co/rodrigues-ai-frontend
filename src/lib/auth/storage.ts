/**
 * Secure Auth Storage
 * Token and user data persistence with security best practices
 */

import type { User, Organization } from '@/types/auth'

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  TOKEN: 'verity_auth_token',
  REFRESH_TOKEN: 'verity_refresh_token',
  USER: 'verity_user',
  ORGANIZATION: 'verity_org',
  TOKEN_EXPIRY: 'verity_token_expiry',
  REMEMBER_ME: 'verity_remember_me'
} as const

// ============================================================================
// TOKEN STORAGE
// ============================================================================

/**
 * Stores authentication token
 * Uses sessionStorage by default, localStorage if rememberMe is true
 */
export function setToken(token: string, rememberMe: boolean = false): void {
  if (typeof window === 'undefined') return

  const storage = rememberMe ? localStorage : sessionStorage
  storage.setItem(STORAGE_KEYS.TOKEN, token)

  if (rememberMe) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true')
  }
}

/**
 * Retrieves authentication token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null

  // Check sessionStorage first
  let token = sessionStorage.getItem(STORAGE_KEYS.TOKEN)

  // Fall back to localStorage if rememberMe was used
  if (!token && localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)) {
    token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  return token
}

/**
 * Clears authentication token
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return

  sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
}

/**
 * Stores refresh token
 */
export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return

  // Always use localStorage for refresh token (long-lived)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
}

/**
 * Retrieves refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

/**
 * Clears refresh token
 */
export function clearRefreshToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
}

/**
 * Stores token expiry timestamp
 */
export function setTokenExpiry(expiresAt: Date | string): void {
  if (typeof window === 'undefined') return

  const expiry =
    typeof expiresAt === 'string' ? expiresAt : expiresAt.toISOString()
  const storage = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)
    ? localStorage
    : sessionStorage
  storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry)
}

/**
 * Retrieves token expiry
 */
export function getTokenExpiry(): Date | null {
  if (typeof window === 'undefined') return null

  let expiry = sessionStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
  if (!expiry) {
    expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
  }

  return expiry ? new Date(expiry) : null
}

/**
 * Checks if token is expired
 */
export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry()
  if (!expiry) return true

  // Add 1 minute buffer for network latency
  const buffer = 60 * 1000
  return Date.now() > expiry.getTime() - buffer
}

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
 * Checks if user has an active session
 */
export function hasActiveSession(): boolean {
  const token = getToken()
  if (!token) return false

  return !isTokenExpired()
}

/**
 * Gets complete auth state from storage
 */
export function getStoredAuthState(): {
  token: string | null
  user: User | null
  organization: Organization | null
  isAuthenticated: boolean
} {
  const token = getToken()
  const user = getUser()
  const organization = getOrganization()
  const isAuthenticated = hasActiveSession() && !!user

  return {
    token,
    user,
    organization,
    isAuthenticated
  }
}

/**
 * Persists complete auth state after login
 */
export function persistAuthState(
  token: string,
  user: User,
  organization: Organization,
  expiresAt: string,
  refreshToken?: string,
  rememberMe: boolean = false
): void {
  setToken(token, rememberMe)
  setUser(user)
  setOrganization(organization)
  setTokenExpiry(expiresAt)

  if (refreshToken) {
    setRefreshToken(refreshToken)
  }
}
