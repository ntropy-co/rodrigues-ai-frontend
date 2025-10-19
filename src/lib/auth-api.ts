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
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
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
  const response = await fetch(`${API_URL}/api/v1/auth/register`, {
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
 * Logout (invalidate token)
 */
export async function logoutApi(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Logout failed')
  }
}

/**
 * Request password reset
 */
export async function forgotPasswordApi(
  email: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to send reset email')
  }

  return response.json()
}

/**
 * Verify password reset token
 */
export async function verifyResetTokenApi(
  token: string
): Promise<{ valid: boolean }> {
  const response = await fetch(
    `${API_URL}/api/v1/auth/verify-reset-token/${token}`
  )

  if (!response.ok) {
    return { valid: false }
  }

  return response.json()
}

/**
 * Reset password with token
 */
export async function resetPasswordApi(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
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
