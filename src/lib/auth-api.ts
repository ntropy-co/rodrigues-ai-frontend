/**
 * Authentication API functions
 */

import type { User, RegisterRequest } from '@/types/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Login with email and password
 */
export async function loginApi(credentials: {
  username: string
  password: string
}): Promise<{ access_token: string; token_type: string }> {
  const response = await fetch(`${API_URL}/api/v1/login/access-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      username: credentials.username,
      password: credentials.password
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  return response.json()
}

/**
 * Register a new user
 */
export async function registerApi(data: RegisterRequest): Promise<User> {
  const response = await fetch(`${API_URL}/api/v1/users/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Registration failed')
  }

  return response.json()
}

/**
 * Get current user information
 */
export async function getCurrentUserApi(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/v1/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to get user info')
  }

  return response.json()
}

/**
 * Logout (client-side only - no backend endpoint)
 */
export async function logoutApi(_token: string): Promise<void> {
  // The reference backend doesn't have a logout endpoint
  // Token invalidation is handled client-side by removing the token
  // This function is kept for API compatibility but does nothing
  return Promise.resolve()
}

/**
 * Request password reset
 */
export async function forgotPasswordApi(
  email: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/v1/password-recovery/${email}`, {
    method: 'POST'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to send reset email')
  }

  return response.json()
}

/**
 * Reset password with token
 * Note: Token validation happens during the reset call
 */
export async function resetPasswordApi(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/v1/reset-password/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token,
      new_password: newPassword
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to reset password')
  }

  return response.json()
}
