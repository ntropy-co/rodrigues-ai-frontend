'use client'

/**
 * useInvites Hook
 *
 * Manages organization invites: list, create, cancel, resend, validate, and accept.
 * Uses BFF routes for all operations.
 */

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'
import type { UserRole, Organization } from '@/types/auth'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Invite status enum
 */
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

/**
 * Invite entity from backend
 */
export interface Invite {
  id: string
  token: string
  organization_id: string
  email: string
  role: UserRole
  status: InviteStatus
  sent_at: string
  expires_at: string
  accepted_at?: string
  revoked_at?: string
  invited_by: string
}

/**
 * Request to create a new invite
 */
export interface CreateInviteRequest {
  email: string
  role?: UserRole
}

/**
 * Request to accept an invite
 */
export interface AcceptInviteRequest {
  token: string
  password: string
  full_name?: string
}

/**
 * Response from validate invite endpoint
 */
export interface ValidateInviteResponse {
  valid: boolean
  email: string
  organization_name: string
  role: UserRole
  expires_at: string
}

/**
 * Response from accept invite endpoint
 * SECURITY: tokens are stored in HttpOnly cookies, not returned in JSON
 */
export interface AcceptInviteResponse {
  user: {
    id: string
    email: string
    name: string
    role: string
  } | null
  organization: Organization | null
  expiresAt: string
}

/**
 * Hook return type
 */
export interface UseInvitesReturn {
  loading: boolean
  error: string | null
  listInvites: () => Promise<Invite[]>
  createInvite: (data: CreateInviteRequest) => Promise<Invite | null>
  cancelInvite: (id: string) => Promise<boolean>
  resendInvite: (id: string) => Promise<boolean>
  validateInvite: (token: string) => Promise<ValidateInviteResponse | null>
  acceptInvite: (
    data: AcceptInviteRequest
  ) => Promise<AcceptInviteResponse | null>
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useInvites(): UseInvitesReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { refetchUser } = useAuth()

  /**
   * List all invites for the current organization
   * Requires authentication
   */
  const listInvites = useCallback(async (): Promise<Invite[]> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithRefresh('/api/organizations/invites', {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn(
          '[useInvites] listInvites failed:',
          response.status,
          errorData
        )

        if (response.status === 401 || response.status === 404) {
          return []
        }

        throw new Error(errorData.detail || 'Erro ao carregar convites')
      }

      const data: Invite[] = await response.json()
      return data
    } catch (err) {
      console.error('[useInvites] Error listing invites:', err)
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new invite
   * Requires authentication
   */
  const createInvite = useCallback(
    async (data: CreateInviteRequest): Promise<Invite | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/organizations/invites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Erro ao criar convite')
        }

        const result: Invite = await response.json()
        return result
      } catch (err) {
        console.error('[useInvites] Error creating invite:', err)
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Cancel (delete) an invite
   * Requires authentication
   */
  const cancelInvite = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithRefresh(
        `/api/organizations/invites/${id}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Erro ao cancelar convite')
      }

      return true
    } catch (err) {
      console.error('[useInvites] Error canceling invite:', err)
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Resend an invite email
   * Requires authentication
   */
  const resendInvite = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithRefresh(
        `/api/organizations/invites/${id}/resend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Erro ao reenviar convite')
      }

      return true
    } catch (err) {
      console.error('[useInvites] Error resending invite:', err)
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Validate an invite token
   * Public route - no authentication required
   */
  const validateInvite = useCallback(
    async (token: string): Promise<ValidateInviteResponse | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/organizations/invites/validate/${encodeURIComponent(token)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Convite inválido ou expirado')
        }

        const data: ValidateInviteResponse = await response.json()
        return data
      } catch (err) {
        console.error('[useInvites] Error validating invite:', err)
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Accept an invite and create account
   * Public route - no authentication required
   * Returns auth tokens for automatic login
   */
  const acceptInvite = useCallback(
    async (data: AcceptInviteRequest): Promise<AcceptInviteResponse | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/organizations/invites/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Erro ao aceitar convite')
        }

        const result: AcceptInviteResponse = await response.json()

        // If user is returned, authentication succeeded (tokens are in HttpOnly cookies)
        // Refetch user data to update AuthContext
        if (result.user) {
          try {
            await refetchUser()
          } catch (refetchError) {
            console.warn(
              '[useInvites] Failed to refetch user after accept:',
              refetchError
            )
          }
        }

        return result
      } catch (err) {
        console.error('[useInvites] Error accepting invite:', err)
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [refetchUser]
  )

  return {
    loading,
    error,
    listInvites,
    createInvite,
    cancelInvite,
    resendInvite,
    validateInvite,
    acceptInvite
  }
}

export default useInvites
