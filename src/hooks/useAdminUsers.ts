'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User roles in the organization
 */
export type UserRole = 'admin' | 'member' | 'viewer'

/**
 * User account status
 */
export type UserStatus = 'active' | 'inactive' | 'pending'

/**
 * Summary view of a user (for list display)
 */
export interface UserSummary {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  last_login_at: string | null
}

/**
 * Detailed user information
 */
export interface UserDetails {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  status: UserStatus
  organization_id: string
  created_at: string
  updated_at: string
  last_login_at: string | null
  avatar_url: string | null
}

/**
 * Paginated users list response
 */
export interface UsersListResponse {
  users: UserSummary[]
  total: number
  skip: number
  limit: number
}

/**
 * Parameters for listing users
 */
export interface ListUsersParams {
  skip?: number
  limit?: number
  search?: string
  role?: UserRole
  status?: UserStatus
}

/**
 * Request to update user role and/or status
 */
export interface UpdateUserRequest {
  role?: UserRole
  status?: 'active' | 'inactive'
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing admin user operations
 *
 * Provides functions to list, get details, update, and deactivate users.
 * All operations require admin privileges.
 *
 * @example
 * ```tsx
 * const { listUsers, updateUserRole, loading, error } = useAdminUsers()
 *
 * // List users with pagination
 * const result = await listUsers({ skip: 0, limit: 20, search: 'john' })
 *
 * // Update user role
 * await updateUserRole(userId, 'member')
 * ```
 */
export function useAdminUsers() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  /**
   * List users with pagination and optional filters
   *
   * @param params - Pagination and filter parameters
   * @returns Paginated list of users
   */
  const listUsers = useCallback(
    async (params: ListUsersParams = {}): Promise<UsersListResponse | null> => {
      if (!user) {
        console.log('[useAdminUsers] No user available, skipping fetch')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const url = new URL('/api/admin/users', window.location.origin)

        // Add query parameters
        if (params.skip !== undefined) {
          url.searchParams.set('skip', params.skip.toString())
        }
        if (params.limit !== undefined) {
          url.searchParams.set('limit', params.limit.toString())
        }
        if (params.search) {
          url.searchParams.set('search', params.search)
        }
        if (params.role) {
          url.searchParams.set('role', params.role)
        }
        if (params.status) {
          url.searchParams.set('status', params.status)
        }

        console.log('[useAdminUsers] Fetching users from:', url.toString())

        const response = await fetchWithRefresh(url.toString(), {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useAdminUsers] Response not OK:',
            response.status,
            errorData
          )

          if (response.status === 403) {
            throw new Error(
              'Acesso negado. Permissão de administrador necessária.'
            )
          }

          throw new Error(errorData.detail || 'Erro ao carregar usuários')
        }

        const data: UsersListResponse = await response.json()
        console.log('[useAdminUsers] Fetched', data.total, 'users')
        return data
      } catch (err) {
        console.error('[useAdminUsers] Error fetching users:', err)
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  /**
   * Get detailed information for a specific user
   *
   * @param userId - The user ID to fetch
   * @returns User details or null on error
   */
  const getUser = useCallback(
    async (userId: string): Promise<UserDetails | null> => {
      if (!user) {
        console.log('[useAdminUsers] No user available, skipping fetch')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh(`/api/admin/users/${userId}`, {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useAdminUsers] Response not OK:',
            response.status,
            errorData
          )

          if (response.status === 404) {
            throw new Error('Usuário não encontrado')
          }

          if (response.status === 403) {
            throw new Error(
              'Acesso negado. Permissão de administrador necessária.'
            )
          }

          throw new Error(errorData.detail || 'Erro ao carregar usuário')
        }

        const data: UserDetails = await response.json()
        return data
      } catch (err) {
        console.error('[useAdminUsers] Error fetching user:', err)
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  /**
   * Update a user's role
   *
   * @param userId - The user ID to update
   * @param role - The new role to assign
   * @returns Updated user details or null on error
   */
  const updateUserRole = useCallback(
    async (userId: string, role: UserRole): Promise<UserDetails | null> => {
      if (!user) {
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useAdminUsers] Response not OK:',
            response.status,
            errorData
          )

          if (response.status === 403) {
            throw new Error(
              'Acesso negado. Permissão de administrador necessária.'
            )
          }

          throw new Error(
            errorData.detail || 'Erro ao atualizar role do usuário'
          )
        }

        const data: UserDetails = await response.json()
        return data
      } catch (err) {
        console.error('[useAdminUsers] Error updating user role:', err)
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  /**
   * Update a user's status
   *
   * @param userId - The user ID to update
   * @param status - The new status ('active' or 'inactive')
   * @returns Updated user details or null on error
   */
  const updateUserStatus = useCallback(
    async (
      userId: string,
      status: 'active' | 'inactive'
    ): Promise<UserDetails | null> => {
      if (!user) {
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useAdminUsers] Response not OK:',
            response.status,
            errorData
          )

          if (response.status === 403) {
            throw new Error(
              'Acesso negado. Permissão de administrador necessária.'
            )
          }

          throw new Error(
            errorData.detail || 'Erro ao atualizar status do usuário'
          )
        }

        const data: UserDetails = await response.json()
        return data
      } catch (err) {
        console.error('[useAdminUsers] Error updating user status:', err)
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  /**
   * Update a user's role and/or status in a single request
   *
   * @param userId - The user ID to update
   * @param data - Object containing role and/or status to update
   * @returns Updated user details or null on error
   */
  const updateUser = useCallback(
    async (
      userId: string,
      data: UpdateUserRequest
    ): Promise<UserDetails | null> => {
      if (!user) {
        return null
      }

      if (!data.role && !data.status) {
        setError('Pelo menos role ou status deve ser fornecido')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useAdminUsers] Response not OK:',
            response.status,
            errorData
          )

          if (response.status === 403) {
            throw new Error(
              'Acesso negado. Permissão de administrador necessária.'
            )
          }

          throw new Error(errorData.detail || 'Erro ao atualizar usuário')
        }

        const result: UserDetails = await response.json()
        return result
      } catch (err) {
        console.error('[useAdminUsers] Error updating user:', err)
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  /**
   * Deactivate a user (soft delete)
   *
   * The user can be reactivated later via updateUserStatus.
   *
   * @param userId - The user ID to deactivate
   * @returns true if successful, false otherwise
   */
  const deactivateUser = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!user) {
        return false
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh(`/api/admin/users/${userId}`, {
          method: 'DELETE'
        })

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useAdminUsers] Response not OK:',
            response.status,
            errorData
          )

          if (response.status === 403) {
            throw new Error(
              'Acesso negado. Permissão de administrador necessária.'
            )
          }

          throw new Error(errorData.detail || 'Erro ao desativar usuário')
        }

        console.log('[useAdminUsers] User deactivated successfully:', userId)
        return true
      } catch (err) {
        console.error('[useAdminUsers] Error deactivating user:', err)
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    loading,
    error,

    // Actions
    listUsers,
    getUser,
    updateUserRole,
    updateUserStatus,
    updateUser,
    deactivateUser,
    clearError
  }
}
