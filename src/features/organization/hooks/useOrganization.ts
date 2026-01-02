'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Organization from backend (OrganizationPublic)
 */
export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string | null
  plan_tier: string
  max_users: number
  current_users_count: number
  created_at: string
}

/**
 * Organization settings from backend
 */
export interface OrganizationSettingsData {
  // Features
  enable_cpr_analysis: boolean
  enable_cpr_creation: boolean
  enable_contracts: boolean
  enable_commodities: boolean

  // Defaults
  default_language: string
  default_currency: string

  // Security
  require_2fa: boolean
  session_timeout_minutes: number
  ip_whitelist: string[]

  // Notifications
  notify_new_users: boolean
  notify_usage_alerts: boolean
  usage_alert_threshold: number
}

/**
 * Data for creating a new organization
 */
export interface CreateOrganizationData {
  name: string
  slug?: string
  logo_url?: string
  email?: string
  phone?: string
  website?: string
}

/**
 * Data for updating an organization
 */
export interface UpdateOrganizationData {
  name?: string
  logo_url?: string
  primary_color?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  settings?: Record<string, unknown>
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing organization data and settings
 *
 * Usage:
 * ```tsx
 * const {
 *   organization,
 *   settings,
 *   loading,
 *   error,
 *   getOrganization,
 *   updateOrganization,
 *   createOrganization,
 *   getSettings,
 *   updateSettings
 * } = useOrganization()
 * ```
 */
export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [settings, setSettings] = useState<OrganizationSettingsData | null>(
    null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  /**
   * Get the current organization
   */
  const getOrganization =
    useCallback(async (): Promise<Organization | null> => {
      if (!isAuthenticated) {
        console.log('[useOrganization] Not authenticated, skipping fetch')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/organizations/current', {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useOrganization] Response not OK:',
            response.status,
            errorData
          )
          // Don't throw on 401/404, just return null
          if (response.status === 401 || response.status === 404) {
            setOrganization(null)
            return null
          }
          throw new Error(errorData.detail || 'Erro ao carregar organização')
        }

        const data: Organization | null = await response.json()
        setOrganization(data)
        return data
      } catch (err) {
        console.error('[useOrganization] Error fetching organization:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    }, [isAuthenticated])

  /**
   * Update the current organization
   */
  const updateOrganization = useCallback(
    async (data: UpdateOrganizationData): Promise<Organization | null> => {
      if (!isAuthenticated) {
        setError('Não autenticado')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/organizations/current', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Erro ao atualizar organização')
        }

        const result: Organization = await response.json()
        setOrganization(result)
        return result
      } catch (err) {
        console.error('[useOrganization] Error updating organization:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated]
  )

  /**
   * Create a new organization
   */
  const createOrganization = useCallback(
    async (data: CreateOrganizationData): Promise<Organization | null> => {
      if (!isAuthenticated) {
        setError('Não autenticado')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/organizations/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Erro ao criar organização')
        }

        const result: Organization = await response.json()
        setOrganization(result)
        return result
      } catch (err) {
        console.error('[useOrganization] Error creating organization:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated]
  )

  /**
   * Get organization settings
   */
  const getSettings =
    useCallback(async (): Promise<OrganizationSettingsData | null> => {
      if (!isAuthenticated) {
        console.log(
          '[useOrganization] Not authenticated, skipping settings fetch'
        )
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/organizations/settings', {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useOrganization] Settings response not OK:',
            response.status,
            errorData
          )
          // Don't throw on 401/404, just return null
          if (response.status === 401 || response.status === 404) {
            setSettings(null)
            return null
          }
          throw new Error(errorData.detail || 'Erro ao carregar configurações')
        }

        const data: OrganizationSettingsData = await response.json()
        setSettings(data)
        return data
      } catch (err) {
        console.error('[useOrganization] Error fetching settings:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    }, [isAuthenticated])

  /**
   * Update organization settings
   */
  const updateSettings = useCallback(
    async (
      data: Partial<OrganizationSettingsData>
    ): Promise<OrganizationSettingsData | null> => {
      if (!isAuthenticated) {
        setError('Não autenticado')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        // Merge with current settings to send complete object
        const currentSettings = settings || getDefaultSettings()
        const mergedSettings = { ...currentSettings, ...data }

        const response = await fetchWithRefresh('/api/organizations/settings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mergedSettings)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Erro ao atualizar configurações')
        }

        const result: OrganizationSettingsData = await response.json()
        setSettings(result)
        return result
      } catch (err) {
        console.error('[useOrganization] Error updating settings:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, settings]
  )

  /**
   * Refresh organization data
   */
  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([getOrganization(), getSettings()])
  }, [getOrganization, getSettings])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Auto-fetch organization on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getOrganization()
    }
  }, [isAuthenticated, getOrganization])

  return {
    // State
    organization,
    settings,
    loading,
    error,

    // Actions
    getOrganization,
    updateOrganization,
    createOrganization,
    getSettings,
    updateSettings,
    refresh,
    clearError
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get default organization settings
 */
function getDefaultSettings(): OrganizationSettingsData {
  return {
    enable_cpr_analysis: true,
    enable_cpr_creation: true,
    enable_contracts: true,
    enable_commodities: true,
    default_language: 'pt-BR',
    default_currency: 'BRL',
    require_2fa: false,
    session_timeout_minutes: 480,
    ip_whitelist: [],
    notify_new_users: true,
    notify_usage_alerts: true,
    usage_alert_threshold: 80
  }
}

export default useOrganization
