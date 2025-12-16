'use client'

/**
 * useAuth Hook
 * Main authentication hook for Verity Agro B2B Platform
 *
 * IMPORTANTE: Este hook usa COOKIES para armazenamento de tokens (mais seguro)
 * em vez de localStorage/sessionStorage.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { SignupData } from '@/types/auth'
import type { AuthResponse } from '@/types/auth-api'
import * as authApi from '@/lib/auth/api'
import {
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  setRefreshToken,
  removeRefreshToken
} from '@/lib/auth/cookies'
import {
  clearRateLimitState,
  recordFailedAttempt,
  isRateLimited
} from '@/lib/utils/auth-validators'
import { handleError, getErrorMessage } from '@/lib/auth/errors'

// ============================================================================
// TIPOS
// ============================================================================

interface ContextUser {
  id: string
  email: string
  name: string
  role: string
}

interface UseAuthState {
  user: ContextUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

interface UseAuthReturn extends UseAuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (data: SignupData, inviteToken: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  clearError: () => void
}

// ============================================================================
// IMPLEMENTAÇÃO DO HOOK
// ============================================================================

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<UseAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isInitialized: false
  })

  // ============================================================================
  // INICIALIZAÇÃO - Verifica token existente no cookie
  // ============================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken()

        if (token) {
          // Token existe, buscar dados do usuário
          const userData = await authApi.getCurrentUserApi(token)
          setState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isInitialized: true
          })
        } else {
          // Sem token
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isInitialized: true
          })
        }
      } catch {
        // Token inválido ou expirado
        removeAuthToken()
        removeRefreshToken()
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isInitialized: true
        })
      }
    }

    initializeAuth()
  }, [])

  // ============================================================================
  // LOGIN
  // ============================================================================

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      // Verificar rate limiting
      const rateLimitStatus = isRateLimited()
      if (rateLimitStatus.limited) {
        setState((prev) => ({
          ...prev,
          error: rateLimitStatus.message || 'Muitas tentativas. Aguarde.'
        }))
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response: AuthResponse = await authApi.login({ email, password })

        // Salvar token no cookie seguro
        setAuthToken(response.token)
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken)
        }

        // Limpar rate limit após sucesso
        clearRateLimitState()

        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitialized: true
        })
      } catch (error) {
        // Registrar tentativa falha para rate limiting
        recordFailedAttempt()

        const authError = handleError(error)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: getErrorMessage(authError.code)
        }))
        throw authError
      }
    },
    []
  )

  // ============================================================================
  // LOGOUT
  // ============================================================================

  const logout = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      await authApi.logout()
    } catch (error) {
      console.warn('Erro ao fazer logout na API:', error)
    } finally {
      // Sempre limpar estado local
      removeAuthToken()
      removeRefreshToken()
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true
      })
    }
  }, [])

  // ============================================================================
  // SIGNUP
  // ============================================================================

  const signup = useCallback(
    async (data: SignupData, inviteToken: string): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response: AuthResponse = await authApi.signup({
          inviteToken,
          email: data.email,
          password: data.password,
          name: data.name
        })

        // Salvar token no cookie
        setAuthToken(response.token)
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken)
        }

        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitialized: true
        })
      } catch (error) {
        const authError = handleError(error)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: getErrorMessage(authError.code)
        }))
        throw authError
      }
    },
    []
  )

  // ============================================================================
  // RECUPERAÇÃO DE SENHA
  // ============================================================================

  const requestPasswordReset = useCallback(
    async (email: string): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        await authApi.requestPasswordReset({ email })
        setState((prev) => ({ ...prev, isLoading: false }))
      } catch (error) {
        const authError = handleError(error)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: getErrorMessage(authError.code)
        }))
        throw authError
      }
    },
    []
  )

  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        await authApi.resetPassword({ token, password: newPassword })
        setState((prev) => ({ ...prev, isLoading: false }))
      } catch (error) {
        const authError = handleError(error)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: getErrorMessage(authError.code)
        }))
        throw authError
      }
    },
    []
  )

  // ============================================================================
  // LIMPAR ERRO
  // ============================================================================

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // ============================================================================
  // RETORNO
  // ============================================================================

  return useMemo(
    () => ({
      ...state,
      login,
      logout,
      signup,
      requestPasswordReset,
      resetPassword,
      clearError
    }),
    [
      state,
      login,
      logout,
      signup,
      requestPasswordReset,
      resetPassword,
      clearError
    ]
  )
}

export default useAuth
