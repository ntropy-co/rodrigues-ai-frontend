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
    const loginUrl = '/api/auth/login'

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)

      if (response.status === 401) {
        throw new Error('Email ou senha incorretos')
      } else if (response.status === 422) {
        throw new Error('Formato de email ou senha inválido')
      } else if (response.status === 429) {
        throw new Error('Muitas tentativas. Aguarde alguns minutos')
      } else if (response.status >= 500) {
        throw new Error('Erro no servidor. Tente novamente em alguns instantes')
      }

      throw new Error(error?.detail || 'Erro ao fazer login')
    }

    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'Erro de conexão. Verifique sua internet e tente novamente'
      )
    }
    throw error
  }
}

/**
 * Register a new user
 */
export async function registerApi(data: RegisterRequest): Promise<User> {
  try {
    const registerUrl = '/api/auth/register'

    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)

      if (response.status === 400) {
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
  const meUrl = '/api/auth/me'

  const response = await fetch(meUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    credentials: 'include'
  })

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
  const logoutUrl = '/api/auth/logout'

  const response = await fetch(logoutUrl, {
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
  const response = await fetch('/api/auth/forgot-password', {
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
  const response = await fetch('/api/auth/reset-password', {
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
  const response = await fetch('/api/auth/validate-reset-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ token })
  })

  if (!response.ok) {
    return { valid: false }
  }

  return response.json()
}
