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
import { validateApiUrl } from '@/lib/utils/url-validator'

// Validar URL da API na inicialização para prevenir SSRF
const API_BASE_URL = validateApiUrl(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  { allowLocalhost: true } // Permitir localhost para desenvolvimento
)

// Debug: verificar se a variável de ambiente está sendo lida corretamente
console.log('[Auth API] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('[Auth API] API_BASE_URL:', API_BASE_URL)

/**
 * Login with email and password
 * Uses OAuth2 standard endpoint /login/access-token
 */
export async function loginApi(
  credentials: LoginRequest
): Promise<AuthResponse> {
  const formData = new URLSearchParams()
  formData.append('username', credentials.username)
  formData.append('password', credentials.password)

  try {
    // Use Next.js API Route as proxy to avoid CORS issues in development
    const loginUrl = '/api/auth/login'
    console.log('[loginApi] Attempting fetch to:', loginUrl)
    console.log('[loginApi] FormData:', formData.toString())

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include',
      body: formData
    })

    console.log('[loginApi] Response status:', response.status)
    console.log('[loginApi] Response ok:', response.ok)

    if (!response.ok) {
      // Parse error response
      const error = await response.json().catch(() => null)

      // Handle specific HTTP status codes
      if (response.status === 401) {
        throw new Error('Email ou senha incorretos')
      } else if (response.status === 422) {
        throw new Error('Formato de email ou senha inválido')
      } else if (response.status === 429) {
        throw new Error('Muitas tentativas. Aguarde alguns minutos')
      } else if (response.status >= 500) {
        throw new Error('Erro no servidor. Tente novamente em alguns instantes')
      }

      // Fallback to error detail from response
      throw new Error(error?.detail || 'Erro ao fazer login')
    }

    return response.json()
  } catch (error) {
    console.error('[loginApi] Caught error:', error)
    console.error('[loginApi] Error type:', error instanceof TypeError)
    console.error(
      '[loginApi] Error message:',
      error instanceof Error ? error.message : String(error)
    )

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'Erro de conexão. Verifique sua internet e tente novamente'
      )
    }
    // Re-throw the original error
    throw error
  }
}

/**
 * Register a new user
 */
export async function registerApi(data: RegisterRequest): Promise<User> {
  try {
    // Use Next.js API Route as proxy to avoid CORS issues in development
    const registerUrl = '/api/auth/register'
    console.log('[registerApi] Attempting fetch to:', registerUrl)
    console.log('[registerApi] Data:', data)

    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    console.log('[registerApi] Response status:', response.status)
    console.log('[registerApi] Response ok:', response.ok)

    if (!response.ok) {
      const error = await response.json().catch(() => null)

      console.log('[registerApi] Error response:', error)

      // Handle specific HTTP status codes
      if (response.status === 400) {
        // Map common backend error messages to Portuguese
        if (error?.detail?.toLowerCase().includes('already registered')) {
          throw new Error(
            'Este email já está cadastrado. Tente fazer login ou use outro email.'
          )
        }
        throw new Error(error?.detail || 'Email já está em uso')
      } else if (response.status === 422) {
        throw new Error('Dados de registro inválidos. Verifique os campos')
      } else if (response.status >= 500) {
        throw new Error('Erro no servidor. Tente novamente em alguns instantes')
      }

      throw new Error(error?.detail || 'Não foi possível criar a conta')
    }

    return response.json()
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'Erro de conexão. Verifique sua internet e tente novamente'
      )
    }
    throw error
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUserApi(token: string): Promise<User> {
  // Use Next.js API Route as proxy to avoid CORS issues in development
  const meUrl = '/api/auth/me'
  console.log('[getCurrentUserApi] Attempting fetch to:', meUrl)

  const response = await fetch(meUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    credentials: 'include'
  })

  console.log('[getCurrentUserApi] Response status:', response.status)
  console.log('[getCurrentUserApi] Response ok:', response.ok)

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: 'Erro ao buscar usuário' }))
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
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Erro ao fazer logout' }))
    throw new Error(error.message || 'Não foi possível fazer logout')
  }

  return response.json()
}

/**
 * Request password reset email
 */
export async function forgotPasswordApi(
  data: ForgotPasswordRequest
): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Erro ao solicitar reset de senha' }))
    throw new Error(
      error.message || 'Não foi possível solicitar reset de senha'
    )
  }

  return response.json()
}

/**
 * Reset password with token
 */
export async function resetPasswordApi(
  data: ResetPasswordRequest
): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Erro ao redefinir senha' }))
    throw new Error(error.message || 'Não foi possível redefinir a senha')
  }

  return response.json()
}

/**
 * Validate password reset token
 */
export async function validateResetTokenApi(
  token: string
): Promise<TokenValidation> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auth/validate-reset-token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ token })
    }
  )

  if (!response.ok) {
    return { valid: false }
  }

  return response.json()
}
