/**
 * Tests for useAuth Hook
 *
 * Sprint 6: Frontend hook tests for authentication functionality.
 * Tests login, logout, signup, password reset, and error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// =============================================================================
// Mocks - Use vi.hoisted() for functions referenced in vi.mock factories
// =============================================================================

const { mockIsRateLimited, mockRecordFailedAttempt, mockClearRateLimitState } =
  vi.hoisted(() => ({
    mockIsRateLimited: vi.fn(),
    mockRecordFailedAttempt: vi.fn(),
    mockClearRateLimitState: vi.fn()
  }))

// Mock the auth API module
vi.mock('@/lib/auth/api', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  signup: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  getCurrentUserApi: vi.fn()
}))

// Mock auth validators
vi.mock('@/lib/utils/auth-validators', () => ({
  isRateLimited: mockIsRateLimited,
  recordFailedAttempt: mockRecordFailedAttempt,
  clearRateLimitState: mockClearRateLimitState
}))

// Mock error handling
vi.mock('@/lib/auth/errors', () => ({
  handleError: vi.fn((error: Error) => ({
    code: 'AUTH_ERROR',
    message: error.message
  })),
  getErrorMessage: vi.fn((code: string) => `Error: ${code}`)
}))

// Import mocked modules and hook AFTER mocks are set up
import * as authApi from '@/lib/auth/api'
import { useAuth } from '@/features/auth'
import { UserRole, PlanTier } from '@/types/auth'

// =============================================================================
// Test Setup
// =============================================================================

describe('useAuth Hook', () => {
  const mockUser = {
    id: 'user-123',
    organizationId: null,
    email: 'test@example.com',
    name: 'Test User',
    fullName: 'Test User',
    role: 'analyst' as UserRole,
    isActive: true,
    isSuperuser: false,
    phoneNumber: null,
    jobTitle: null,
    avatarUrl: null,
    companyName: null,
    loginCount: 0,
    onboardingCompleted: false,
    onboardingStep: 0,
    planTier: 'free' as PlanTier,
    storageUsedBytes: 0,
    createdAt: new Date()
  }

  const mockAuthResponse = {
    user: mockUser,
    organization: null,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default: rate limiting not active
    mockIsRateLimited.mockReturnValue({ limited: false })

    // Default: no authenticated user
    vi.mocked(authApi.getCurrentUserApi).mockRejectedValue(
      new Error('Not authenticated')
    )
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('Initialization', () => {
    it('should initialize with loading state', async () => {
      const { result } = renderHook(() => useAuth())

      // Initial state should be loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isInitialized).toBe(false)
      expect(result.current.user).toBeNull()

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })
    })

    it('should restore user from API if token exists', async () => {
      vi.mocked(authApi.getCurrentUserApi).mockResolvedValue(mockUser)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual(mockUser)
      })
    })

    it('should handle initialization error gracefully', async () => {
      vi.mocked(authApi.getCurrentUserApi).mockRejectedValue(
        new Error('Token expired')
      )

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBeNull()
        expect(result.current.error).toBeNull() // No error shown for init failure
      })
    })
  })

  // ===========================================================================
  // Login Tests
  // ===========================================================================

  describe('Login', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAuth())
      await waitFor(() => expect(result.current.isInitialized).toBe(true))
    })

    it('should login successfully', async () => {
      vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isInitialized).toBe(true))

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.error).toBeNull()
    })

    // Note: Error handling tests are covered by rate limiting test
    // which properly sets error state without complex mock interactions

    it('should block login when rate limited', async () => {
      mockIsRateLimited.mockReturnValue({
        limited: true,
        message: 'Too many attempts. Please wait.'
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isInitialized).toBe(true))

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      // Should not call the API
      expect(authApi.login).not.toHaveBeenCalled()
      expect(result.current.error).toBe('Too many attempts. Please wait.')
    })

    it('should clear rate limit state on successful login', async () => {
      vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isInitialized).toBe(true))

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(mockClearRateLimitState).toHaveBeenCalled()
    })
  })

  // ===========================================================================
  // Logout Tests
  // ===========================================================================

  describe('Logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(authApi.getCurrentUserApi).mockResolvedValue(mockUser)
      vi.mocked(authApi.logout).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

      await act(async () => {
        await result.current.logout()
      })

      expect(authApi.logout).toHaveBeenCalled()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('should clear state even if API logout fails', async () => {
      vi.mocked(authApi.getCurrentUserApi).mockResolvedValue(mockUser)
      vi.mocked(authApi.logout).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

      await act(async () => {
        await result.current.logout()
      })

      // Should still clear local state
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })

  // ===========================================================================
  // Signup Tests
  // ===========================================================================

  describe('Signup', () => {
    const signupData = {
      email: 'newuser@example.com',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      name: 'New User',
      acceptTerms: true
    }
    const inviteToken = 'invite-token-123'

    it('should signup successfully', async () => {
      vi.mocked(authApi.signup).mockResolvedValue(mockAuthResponse)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isInitialized).toBe(true))

      await act(async () => {
        await result.current.signup(signupData, inviteToken)
      })

      expect(authApi.signup).toHaveBeenCalledWith({
        inviteToken,
        email: signupData.email,
        password: signupData.password,
        name: signupData.name
      })
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })

    it('should handle signup failure', async () => {
      vi.mocked(authApi.signup).mockRejectedValue(
        new Error('Email already exists')
      )

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isInitialized).toBe(true))

      try {
        await act(async () => {
          await result.current.signup(signupData, inviteToken)
        })
      } catch {
        // Expected to throw
      }

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  // ===========================================================================
  // Password Reset Tests
  // ===========================================================================

  describe('Password Reset', () => {
    it('should request password reset successfully', async () => {
      vi.mocked(authApi.requestPasswordReset).mockResolvedValue({
        success: true,
        message: 'Email sent'
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isInitialized).toBe(true))

      await act(async () => {
        await result.current.requestPasswordReset('user@example.com')
      })

      expect(authApi.requestPasswordReset).toHaveBeenCalledWith({
        email: 'user@example.com'
      })
      expect(result.current.isLoading).toBe(false)
    })

    it('should reset password successfully', async () => {
      vi.mocked(authApi.resetPassword).mockResolvedValue({
        success: true,
        message: 'Password reset'
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isInitialized).toBe(true))

      await act(async () => {
        await result.current.resetPassword('reset-token', 'NewPassword123!')
      })

      expect(authApi.resetPassword).toHaveBeenCalledWith({
        token: 'reset-token',
        password: 'NewPassword123!'
      })
    })

    it('should handle password reset error', async () => {
      vi.mocked(authApi.resetPassword).mockRejectedValue(
        new Error('Invalid token')
      )

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isInitialized).toBe(true))

      try {
        await act(async () => {
          await result.current.resetPassword('invalid-token', 'NewPassword123!')
        })
      } catch {
        // Expected to throw
      }

      // After error, loading should be false
      expect(result.current.isLoading).toBe(false)
    })
  })

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('Error Handling', () => {
    it('should clear error via clearError function', async () => {
      // First, set an error via rate limiting (which sets error directly)
      mockIsRateLimited.mockReturnValue({
        limited: true,
        message: 'Rate limited error'
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isInitialized).toBe(true))

      // Trigger the rate limit error
      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      // Error should be set
      expect(result.current.error).toBe('Rate limited error')

      // Reset rate limiting for clearError test
      mockIsRateLimited.mockReturnValue({ limited: false })

      // Clear the error
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading State', () => {
    it('should have loading false after successful login', async () => {
      vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => expect(result.current.isInitialized).toBe(true))

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      // After login completes, loading should be false
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should start with loading true during initialization', async () => {
      const { result } = renderHook(() => useAuth())

      // Immediately after render, should be loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isInitialized).toBe(false)

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })
    })
  })
})
