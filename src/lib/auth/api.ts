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

// ============================================================================
// CONFIGURATION
// ============================================================================

// Always use internal Next.js API routes as proxy to backend
// This ensures proper request/response format conversion
const API_BASE_URL = '/api'

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  VALIDATE_INVITE: '/auth/invite/validate',
  PASSWORD_RESET_REQUEST: '/auth/forgot-password',
  PASSWORD_RESET: '/auth/reset-password'
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { authenticated = false, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers
  }

  // NOTA: O cabeçalho Authorization NÃO É MAIS necessário.
  // Usamos cookies HttpOnly que são enviados automaticamente pelo navegador.

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers
    })

    // Lidar com respostas sem conteúdo
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
 * Note: Now relies on HttpOnly cookie, but accepts optional token for legacy/manual flow
 */
export async function refreshToken(
  data?: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  // If data is provided, use it (body param). If not, send empty body (use cookie).
  const body = data?.refreshToken ? { refreshToken: data.refreshToken } : {}

  return authFetch<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH, {
    method: 'POST',
    body: JSON.stringify(body)
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  token?: string // Deprecated param, kept for signature compat
): Promise<{ id: string; email: string; name: string; role: string }> {
  return authFetch<{ id: string; email: string; name: string; role: string }>(
    '/auth/me',
    {
      method: 'GET'
      // No explicit headers needed, cookies are sent automatically
    }
  )
}

export default authApi
