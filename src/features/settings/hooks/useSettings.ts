'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'

// ============================================================================
// TYPES
// ============================================================================

/**
 * User profile information
 */
export interface UserProfile {
  full_name: string | null
  email: string
  phone_number: string | null
  job_title: string | null
  company_name: string | null
  avatar_url: string | null
  created_at: string
  plan_tier: string
}

/**
 * User profile update payload
 */
export interface UserProfileUpdate {
  full_name?: string
  phone_number?: string
  job_title?: string
  company_name?: string
  avatar_url?: string
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  email_marketing: boolean
  email_product_updates: boolean
  email_security_alerts: boolean
  email_weekly_digest: boolean
  push_enabled: boolean
  push_chat_messages: boolean
  push_document_ready: boolean
}

/**
 * UI/UX preferences
 */
export interface UIPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'pt-BR' | 'en-US' | 'es-ES'
  sidebar_collapsed: boolean
  compact_mode: boolean
  show_tooltips: boolean
}

/**
 * Complete user settings
 */
export interface UserSettings {
  profile: UserProfile
  notifications: NotificationSettings
  ui: UIPreferences
}

/**
 * Settings update payload (for combined update)
 */
export interface UserSettingsUpdate {
  notifications?: NotificationSettings
  ui?: UIPreferences
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email_marketing: false,
  email_product_updates: true,
  email_security_alerts: true,
  email_weekly_digest: false,
  push_enabled: true,
  push_chat_messages: true,
  push_document_ready: true
}

const DEFAULT_UI_PREFERENCES: UIPreferences = {
  theme: 'light',
  language: 'pt-BR',
  sidebar_collapsed: false,
  compact_mode: false,
  show_tooltips: true
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing user settings
 */
export function useSettings() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  /**
   * Fetch all user settings
   */
  const fetchSettings = useCallback(async (): Promise<UserSettings | null> => {
    if (!user) {
      console.log(
        '[useSettings] No authenticated user available, skipping fetch'
      )
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithRefresh('/api/settings', {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn(
          '[useSettings] Response not OK:',
          response.status,
          errorData
        )
        if (response.status === 401 || response.status === 404) {
          return null
        }
        throw new Error(errorData.detail || 'Erro ao carregar configuracoes')
      }

      const data: UserSettings = await response.json()
      return data
    } catch (err) {
      console.error('[useSettings] Error fetching settings:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  /**
   * Fetch user profile only
   */
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) {
      console.log(
        '[useSettings] No authenticated user available, skipping fetch'
      )
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithRefresh('/api/settings/profile', {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn(
          '[useSettings] Response not OK:',
          response.status,
          errorData
        )
        if (response.status === 401 || response.status === 404) {
          return null
        }
        throw new Error(errorData.detail || 'Erro ao carregar perfil')
      }

      const data: UserProfile = await response.json()
      return data
    } catch (err) {
      console.error('[useSettings] Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (data: UserProfileUpdate): Promise<UserProfile | null> => {
      if (!user) {
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/settings/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Erro ao atualizar perfil')
        }

        const result: UserProfile = await response.json()
        return result
      } catch (err) {
        console.error('[useSettings] Error updating profile:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  /**
   * Update notification settings
   */
  const updateNotifications = useCallback(
    async (
      data: NotificationSettings
    ): Promise<NotificationSettings | null> => {
      if (!user) {
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/settings/notifications', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Erro ao atualizar notificacoes')
        }

        const result: NotificationSettings = await response.json()
        return result
      } catch (err) {
        console.error('[useSettings] Error updating notifications:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  /**
   * Update UI preferences
   */
  const updateUIPreferences = useCallback(
    async (data: UIPreferences): Promise<UIPreferences | null> => {
      if (!user) {
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/settings/ui', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.detail || 'Erro ao atualizar preferencias de UI'
          )
        }

        const result: UIPreferences = await response.json()
        return result
      } catch (err) {
        console.error('[useSettings] Error updating UI preferences:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  /**
   * Update all settings at once (notifications and UI)
   */
  const updateSettings = useCallback(
    async (data: UserSettingsUpdate): Promise<UserSettings | null> => {
      if (!user) {
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/settings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Erro ao atualizar configuracoes')
        }

        const result: UserSettings = await response.json()
        return result
      } catch (err) {
        console.error('[useSettings] Error updating settings:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  return {
    loading,
    error,
    fetchSettings,
    fetchProfile,
    updateProfile,
    updateNotifications,
    updateUIPreferences,
    updateSettings,
    // Export defaults for form initialization
    DEFAULT_NOTIFICATION_SETTINGS,
    DEFAULT_UI_PREFERENCES
  }
}
