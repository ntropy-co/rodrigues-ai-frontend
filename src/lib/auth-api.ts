/**
 * Authentication API functions
 * Handles all HTTP requests to the backend auth endpoints
 */

import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  TokenValidation,
  User
} from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Login with email and password
 */
export async function loginApi(credentials: LoginRequest): Promise<AuthResponse> {
  const formData = new URLSearchParams()
  formData.append('username', credentials.username)
  formData.append('password', credentials.password)

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erro ao fazer login' }))
    throw new Error(error.detail || 'Credenciais inválidas')
  }

  return response.json()
}

/**
 * Register a new user
 */
export async function registerApi(data: RegisterRequest): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erro ao criar conta' }))
    throw new Error(error.detail || 'Não foi possível criar a conta')
  }

  return response.json()
}

/**
 * Get current authenticated user
 */
export async function getCurrentUserApi(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erro ao buscar usuário' }))
    throw new Error(error.detail || 'Não foi possível obter dados do usuário')
  }

  return response.json()
}

/**
 * Logout (client-side token removal, server just returns success)
 */
export async function logoutApi(token: string): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao fazer logout' }))
    throw new Error(error.message || 'Não foi possível fazer logout')
  }

  return response.json()
}

/**
 * Request password reset email
 */
export async function forgotPasswordApi(data: ForgotPasswordRequest): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao solicitar reset de senha' }))
    throw new Error(error.message || 'Não foi possível solicitar reset de senha')
  }

  return response.json()
}

/**
 * Reset password with token
 */
export async function resetPasswordApi(data: ResetPasswordRequest): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao redefinir senha' }))
    throw new Error(error.message || 'Não foi possível redefinir a senha')
  }

  return response.json()
}

/**
 * Validate password reset token
 */
export async function validateResetTokenApi(token: string): Promise<TokenValidation> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/validate-reset-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  })

  if (!response.ok) {
    return { valid: false }
  }

  return response.json()
}
