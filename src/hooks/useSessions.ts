import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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
  const { token } = useAuth()

  const fetchSessions = useCallback(
    async (projectId?: string | null): Promise<SessionEntry[]> => {
      if (!token) {
        return []
      }

      setLoading(true)
      setError(null)

      try {
        const url = projectId
          ? `/api/sessions?project_id=${projectId}`
          : '/api/sessions'

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
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
    [token]
  )

  const createSession = useCallback(
    async (
      title?: string,
      projectId?: string
    ): Promise<SessionEntry | null> => {
      if (!token) {
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
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
    [token]
  )

  const deleteSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!token) {
        return false
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
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
    [token]
  )

  const updateSession = useCallback(
    async (
      sessionId: string,
      data: { title?: string }
    ): Promise<SessionEntry | null> => {
      if (!token) {
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
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
    [token]
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
