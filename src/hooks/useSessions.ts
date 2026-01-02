import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'
import { isValidProjectId } from '@/lib/api/bff-utils'
import type { SessionEntry } from '@/types/playground'

/**
 * Backend session response structure
 */
interface BackendSession {
  id: string
  user_id: string
  title: string | null
  project_id?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Maps backend session to frontend SessionEntry format
 */
function mapToSessionEntry(session: BackendSession): SessionEntry {
  return {
    session_id: session.id,
    title: session.title || 'Nova Conversa',
    project_id: session.project_id,
    created_at: Math.floor(new Date(session.created_at).getTime() / 1000)
  }
}

export function useSessions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSessions = useCallback(
    async (projectId?: string | null): Promise<SessionEntry[]> => {
      if (!user) {
        return []
      }

      // Validate project_id format if provided
      if (projectId && !isValidProjectId(projectId)) {
        setError('Invalid project_id format')
        return []
      }

      setLoading(true)
      setError(null)

      try {
        const url = projectId
          ? `/api/sessions?project_id=${projectId}`
          : '/api/sessions'

        const response = await fetchWithRefresh(url, {
          method: 'GET'
        })

        if (!response.ok) {
          throw new Error('Erro ao carregar sessões')
        }

        const data: BackendSession[] = await response.json()
        return data.map(mapToSessionEntry)
      } catch (err) {
        console.error('[useSessions] Error fetching sessions:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return []
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const createSession = useCallback(
    async (
      title?: string,
      projectId?: string
    ): Promise<SessionEntry | null> => {
      if (!user) {
        return null
      }

      // Validate inputs before making request
      if (title && title.length > 200) {
        setError('Title must be 200 characters or less')
        return null
      }

      if (projectId && !isValidProjectId(projectId)) {
        setError('Invalid project_id format')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: title,
            project_id: projectId
          })
        })

        if (!response.ok) {
          throw new Error('Erro ao criar sessão')
        }

        const data: BackendSession = await response.json()
        return mapToSessionEntry(data)
      } catch (err) {
        console.error('[useSessions] Error creating session:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const deleteSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!user) {
        return false
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh(`/api/sessions/${sessionId}`, {
          method: 'DELETE'
        })

        if (!response.ok && response.status !== 204) {
          throw new Error('Erro ao deletar sessão')
        }

        return true
      } catch (err) {
        console.error('[useSessions] Error deleting session:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return false
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const updateSession = useCallback(
    async (
      sessionId: string,
      data: { title?: string }
    ): Promise<SessionEntry | null> => {
      if (!user) {
        return null
      }

      // Validate title length if provided
      if (data.title && data.title.length > 200) {
        setError('Title must be 200 characters or less')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          throw new Error('Erro ao atualizar sessão')
        }

        const result: BackendSession = await response.json()
        return mapToSessionEntry(result)
      } catch (err) {
        console.error('[useSessions] Error updating session:', err)
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
    fetchSessions,
    createSession,
    deleteSession,
    updateSession
  }
}
