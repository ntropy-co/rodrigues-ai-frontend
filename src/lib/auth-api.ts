/**
 * Authentication API client
 */
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User
} from '@/types/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_BASE = `${API_URL}/api/v1`

/**
 * Login user
 */
export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const formData = new FormData()
  formData.append('username', data.username)
  formData.append('password', data.password)

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  return response.json()
}

/**
 * Register new user
 */
export async function registerApi(data: RegisterRequest): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/register`, {
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
 * Get current user
 */
export async function getCurrentUserApi(token: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get user')
  }

  return response.json()
}

/**
 * Logout user
 */
export async function logoutApi(token: string): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

/**
 * Request password reset
 */
export async function forgotPasswordApi(
  email: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to request password reset')
  }

  return response.json()
}

/**
 * Verify password reset token
 */
export async function verifyResetTokenApi(
  token: string
): Promise<{ valid: boolean }> {
  const response = await fetch(`${API_BASE}/auth/verify-reset-token/${token}`)

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
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
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
