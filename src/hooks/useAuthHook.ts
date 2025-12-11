'use client'

/**
 * useAuth Hook
 * Main authentication hook for Verity Agro B2B Platform
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { AuthState, SignupData } from '@/types/auth'
import type { AuthResponse } from '@/types/auth-api'
import * as authApi from '@/lib/auth/api'
import * as storage from '@/lib/auth/storage'
import {
  clearRateLimitState,
  recordFailedAttempt,
  isRateLimited
} from '@/lib/utils/auth-validators'

// ============================================================================
// HOOK STATE
// ============================================================================

interface UseAuthState extends AuthState {
  // Additional UI states
  isInitialized: boolean
}

interface UseAuthReturn extends UseAuthState {
  // Actions
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>
  logout: () => Promise<void>
  signup: (data: SignupData, inviteToken: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<UseAuthState>({
    user: null,
    organization: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isInitialized: false
  })

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedState = storage.getStoredAuthState()

        setState({
          user: storedState.user,
          organization: storedState.organization,
          isAuthenticated: storedState.isAuthenticated,
          isLoading: false,
          error: null,
          isInitialized: true
        })

        // If session exists but is about to expire, try to refresh
        if (storedState.isAuthenticated && storage.isTokenExpired()) {
          // Token expired, try refresh
          refreshSession()
        }
      } catch {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isInitialized: true
        }))
      }
    }

    initializeAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ============================================================================
  // LOGIN
  // ============================================================================

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe: boolean = false
    ): Promise<void> => {
      // Check rate limiting
      const rateLimitStatus = isRateLimited()
      if (rateLimitStatus.limited) {
        setState((prev) => ({
          ...prev,
          error: rateLimitStatus.message || 'Rate limited'
        }))
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response: AuthResponse = await authApi.login({ email, password })

        // Persist auth state
        storage.persistAuthState(
          response.token,
          response.user,
          response.organization,
          response.expiresAt,
          response.refreshToken,
          rememberMe
        )

        // Clear rate limit on success
        clearRateLimitState()

        setState({
          user: response.user,
          organization: response.organization,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitialized: true
        })
      } catch {
        // Record failed attempt for rate limiting
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
      // Call API to invalidate session server-side
      await authApi.logout()
    } catch {
      // Ignore logout API errors
      console.warn('Logout API error:', error)
    } finally {
      // Always clear local state
      storage.clearAllAuthData()

      setState({
        user: null,
        organization: null,
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

        // Persist auth state
        storage.persistAuthState(
          response.token,
          response.user,
          response.organization,
          response.expiresAt,
          response.refreshToken,
          true // Always remember for new signups
        )

        setState({
          user: response.user,
          organization: response.organization,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isInitialized: true
        })
      } catch {
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
  // PASSWORD RESET
  // ============================================================================

  const requestPasswordReset = useCallback(
    async (email: string): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        await authApi.requestPasswordReset({ email })
        setState((prev) => ({ ...prev, isLoading: false }))
      } catch {
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
      } catch {
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
  // SESSION REFRESH
  // ============================================================================

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const response = await authApi.refreshToken()

      // Update token in storage
      storage.setToken(
        response.token,
        !!localStorage.getItem('verity_remember_me')
      )
      storage.setTokenExpiry(response.expiresAt)
    } catch {
      // Refresh failed, clear session
      storage.clearAllAuthData()
      setState({
        user: null,
        organization: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true
      })
    }
  }, [])

  // ============================================================================
  // CLEAR ERROR
  // ============================================================================

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // ============================================================================
  // RETURN
  // ============================================================================

  return useMemo(
    () => ({
      ...state,
      login,
      logout,
      signup,
      requestPasswordReset,
      resetPassword,
      refreshSession,
      clearError
    }),
    [
      state,
      login,
      logout,
      signup,
      requestPasswordReset,
      resetPassword,
      refreshSession,
      clearError
    ]
  )
}

export default useAuth
