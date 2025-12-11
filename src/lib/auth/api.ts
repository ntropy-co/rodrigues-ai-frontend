/**
 * Authentication API Client
 * Centralized API calls for authentication operations
 */

import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  PasswordResetRequest,
  NewPasswordRequest,
  InviteValidationResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  AuthApiClient
} from '@/types/auth-api'
import { AuthError, mapApiError, isNetworkError } from './errors'
import { getToken, getRefreshToken } from './storage'

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  VALIDATE_INVITE: '/auth/invite/validate',
  PASSWORD_RESET_REQUEST: '/auth/password/reset-request',
  PASSWORD_RESET: '/auth/password/reset'
} as const

// ============================================================================
// FETCH WRAPPER
// ============================================================================

interface FetchOptions extends RequestInit {
  authenticated?: boolean
}

async function authFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { authenticated = false, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers
  }

  // Add auth header if authenticated request
  if (authenticated) {
    const token = getToken()
    if (token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers
    })

    // Handle no-content responses
    if (response.status === 204) {
      return {} as T
    }

    const data = await response.json()

    if (!response.ok) {
      throw mapApiError({
        code: data.code,
        message: data.message || data.detail, // Backend uses 'detail' for error messages
        status: response.status,
        details: data.details
      })
    }

    return data as T
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }

    if (isNetworkError(error)) {
      throw new AuthError('network_error')
    }

    throw new AuthError('unknown_error', (error as Error).message)
  }
}

// ============================================================================
// API CLIENT IMPLEMENTATION
// ============================================================================

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  return authFetch<AuthResponse>(AUTH_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * Register new user with invite token
 */
export async function signup(data: SignupRequest): Promise<AuthResponse> {
  return authFetch<AuthResponse>(AUTH_ENDPOINTS.SIGNUP, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * Logout and invalidate session
 */
export async function logout(): Promise<void> {
  try {
    await authFetch<void>(AUTH_ENDPOINTS.LOGOUT, {
      method: 'POST',
      authenticated: true
    })
  } catch (error) {
    // Ignore logout errors - we'll clear local state anyway
    console.warn('Logout API call failed:', error)
  }
}

/**
 * Validate invite token
 */
export async function validateInvite(
  token: string
): Promise<InviteValidationResponse> {
  return authFetch<InviteValidationResponse>(
    `${AUTH_ENDPOINTS.VALIDATE_INVITE}?token=${encodeURIComponent(token)}`,
    { method: 'GET' }
  )
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(
  data: PasswordResetRequest
): Promise<{ success: boolean; message: string }> {
  return authFetch(AUTH_ENDPOINTS.PASSWORD_RESET_REQUEST, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * Reset password with token
 */
export async function resetPassword(
  data: NewPasswordRequest
): Promise<{ success: boolean; message: string }> {
  return authFetch(AUTH_ENDPOINTS.PASSWORD_RESET, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * Refresh authentication token
 */
export async function refreshToken(
  data?: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  const token = data?.refreshToken || getRefreshToken()

  if (!token) {
    throw new AuthError('session_expired')
  }

  return authFetch<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH, {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token })
  })
}

// ============================================================================
// COMPLETE API CLIENT OBJECT
// ============================================================================

export const authApi: AuthApiClient = {
  login,
  signup,
  logout,
  validateInvite,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  // Admin endpoints would be implemented here
  createInvite: async () => {
    throw new Error('Not implemented')
  },
  revokeInvite: async () => {
    throw new Error('Not implemented')
  },
  listInvites: async () => {
    throw new Error('Not implemented')
  }
}

// ============================================================================
// BACKWARDS COMPATIBILITY ALIASES (for AuthContext imports)
// ============================================================================

/** @deprecated Use `login` instead */
export const loginApi = login

/** @deprecated Use `logout` instead */
export const logoutApi = logout

/** @deprecated Use `signup` instead */
export const registerApi = signup

/**
 * Get current user data
 */
export async function getCurrentUserApi(
  token: string
): Promise<{ id: string; email: string; name: string; role: string }> {
  return authFetch<{ id: string; email: string; name: string; role: string }>(
    '/auth/me',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
}

export default authApi
