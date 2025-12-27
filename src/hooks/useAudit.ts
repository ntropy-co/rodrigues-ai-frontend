'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'

/**
 * Audit log entry from backend
 */
export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  ip_address: string | null
  user_agent: string | null
  result: string
  details: string | null
  created_at: string
}

/**
 * Paginated list of audit logs
 */
export interface AuditLogList {
  data: AuditLog[]
  total: number
  page: number
  page_size: number
}

/**
 * Filters for audit log queries
 */
export interface AuditFilters {
  action?: string
  resource_type?: string
  page?: number
  page_size?: number
}

/**
 * Hook for managing audit logs
 *
 * Provides methods for:
 * - Fetching current user's audit logs
 * - Fetching specific user's audit logs (admin only)
 * - Fetching resource audit logs (admin only)
 * - Fetching recent activity (admin only)
 * - Fetching security events (admin only)
 * - Fetching available action types
 * - Fetching available resource types
 */
export function useAudit() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  /**
   * Fetch audit logs for the current user
   */
  const fetchMyLogs = useCallback(
    async (filters?: AuditFilters): Promise<AuditLogList | null> => {
      if (!token) {
        console.log('[useAudit] No token available, skipping fetch')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (filters?.action) params.set('action', filters.action)
        if (filters?.resource_type)
          params.set('resource_type', filters.resource_type)
        if (filters?.page) params.set('page', String(filters.page))
        if (filters?.page_size)
          params.set('page_size', String(filters.page_size))

        const queryString = params.toString()
        const url = queryString
          ? `/api/audit/me?${queryString}`
          : '/api/audit/me'

        const response = await fetchWithRefresh(url, {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useAudit] Response not OK:',
            response.status,
            errorData
          )
          if (response.status === 401 || response.status === 404) {
            return null
          }
          throw new Error(
            errorData.detail || 'Erro ao carregar logs de auditoria'
          )
        }

        const data: AuditLogList = await response.json()
        return data
      } catch (err) {
        console.error('[useAudit] Error fetching my logs:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  /**
   * Fetch audit logs for a specific user (admin only)
   */
  const fetchUserLogs = useCallback(
    async (
      userId: string,
      filters?: AuditFilters
    ): Promise<AuditLogList | null> => {
      if (!token) {
        console.log('[useAudit] No token available, skipping fetch')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (filters?.action) params.set('action', filters.action)
        if (filters?.resource_type)
          params.set('resource_type', filters.resource_type)
        if (filters?.page) params.set('page', String(filters.page))
        if (filters?.page_size)
          params.set('page_size', String(filters.page_size))

        const queryString = params.toString()
        const url = queryString
          ? `/api/audit/user/${userId}?${queryString}`
          : `/api/audit/user/${userId}`

        const response = await fetchWithRefresh(url, {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useAudit] Response not OK:',
            response.status,
            errorData
          )
          if (response.status === 401 || response.status === 403) {
            throw new Error(errorData.detail || 'Acesso negado')
          }
          if (response.status === 404) {
            return null
          }
          throw new Error(
            errorData.detail || 'Erro ao carregar logs do usuario'
          )
        }

        const data: AuditLogList = await response.json()
        return data
      } catch (err) {
        console.error('[useAudit] Error fetching user logs:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  /**
   * Fetch audit logs for a specific resource (admin only)
   */
  const fetchResourceLogs = useCallback(
    async (
      resourceType: string,
      resourceId: string,
      limit?: number
    ): Promise<AuditLog[] | null> => {
      if (!token) {
        console.log('[useAudit] No token available, skipping fetch')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (limit) params.set('limit', String(limit))

        const queryString = params.toString()
        const url = queryString
          ? `/api/audit/resource/${resourceType}/${resourceId}?${queryString}`
          : `/api/audit/resource/${resourceType}/${resourceId}`

        const response = await fetchWithRefresh(url, {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useAudit] Response not OK:',
            response.status,
            errorData
          )
          if (response.status === 401 || response.status === 403) {
            throw new Error(errorData.detail || 'Acesso negado')
          }
          if (response.status === 404) {
            return null
          }
          throw new Error(
            errorData.detail || 'Erro ao carregar logs do recurso'
          )
        }

        const data: AuditLog[] = await response.json()
        return data
      } catch (err) {
        console.error('[useAudit] Error fetching resource logs:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  /**
   * Fetch recent activity across all users (admin only)
   */
  const fetchRecentActivity = useCallback(
    async (hours?: number, limit?: number): Promise<AuditLog[] | null> => {
      if (!token) {
        console.log('[useAudit] No token available, skipping fetch')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (hours) params.set('hours', String(hours))
        if (limit) params.set('limit', String(limit))

        const queryString = params.toString()
        const url = queryString
          ? `/api/audit/recent?${queryString}`
          : '/api/audit/recent'

        const response = await fetchWithRefresh(url, {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useAudit] Response not OK:',
            response.status,
            errorData
          )
          if (response.status === 401 || response.status === 403) {
            throw new Error(errorData.detail || 'Acesso negado')
          }
          throw new Error(
            errorData.detail || 'Erro ao carregar atividade recente'
          )
        }

        const data: AuditLog[] = await response.json()
        return data
      } catch (err) {
        console.error('[useAudit] Error fetching recent activity:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  /**
   * Fetch security events (admin only)
   */
  const fetchSecurityEvents = useCallback(
    async (hours?: number): Promise<AuditLog[] | null> => {
      if (!token) {
        console.log('[useAudit] No token available, skipping fetch')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (hours) params.set('hours', String(hours))

        const queryString = params.toString()
        const url = queryString
          ? `/api/audit/security?${queryString}`
          : '/api/audit/security'

        const response = await fetchWithRefresh(url, {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useAudit] Response not OK:',
            response.status,
            errorData
          )
          if (response.status === 401 || response.status === 403) {
            throw new Error(errorData.detail || 'Acesso negado')
          }
          throw new Error(
            errorData.detail || 'Erro ao carregar eventos de seguranca'
          )
        }

        const data: AuditLog[] = await response.json()
        return data
      } catch (err) {
        console.error('[useAudit] Error fetching security events:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  /**
   * Fetch all available audit action types
   */
  const fetchAuditActions = useCallback(async (): Promise<string[] | null> => {
    if (!token) {
      console.log('[useAudit] No token available, skipping fetch')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithRefresh('/api/audit/actions', {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn('[useAudit] Response not OK:', response.status, errorData)
        if (response.status === 401) {
          return null
        }
        throw new Error(errorData.detail || 'Erro ao carregar tipos de acao')
      }

      const data: string[] = await response.json()
      return data
    } catch (err) {
      console.error('[useAudit] Error fetching audit actions:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return null
    } finally {
      setLoading(false)
    }
  }, [token])

  /**
   * Fetch all available resource types
   */
  const fetchResourceTypes = useCallback(async (): Promise<string[] | null> => {
    if (!token) {
      console.log('[useAudit] No token available, skipping fetch')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithRefresh('/api/audit/resource-types', {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn('[useAudit] Response not OK:', response.status, errorData)
        if (response.status === 401) {
          return null
        }
        throw new Error(errorData.detail || 'Erro ao carregar tipos de recurso')
      }

      const data: string[] = await response.json()
      return data
    } catch (err) {
      console.error('[useAudit] Error fetching resource types:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return null
    } finally {
      setLoading(false)
    }
  }, [token])

  return {
    loading,
    error,
    fetchMyLogs,
    fetchUserLogs,
    fetchResourceLogs,
    fetchRecentActivity,
    fetchSecurityEvents,
    fetchAuditActions,
    fetchResourceTypes
  }
}
