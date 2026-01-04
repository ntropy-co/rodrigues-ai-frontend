'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isValidProjectId } from '@/lib/api/bff-utils'
import type { SessionEntry } from '@/features/chat'
import { chatApi } from '../api'

export function useSessions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSessions = useCallback(
    async (projectId?: string | null): Promise<SessionEntry[]> => {
      if (!user) return []

      if (projectId && !isValidProjectId(projectId)) {
        setError('Invalid project_id format')
        return []
      }

      setLoading(true)
      setError(null)

      try {
        return await chatApi.getSessions(projectId)
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
      if (!user) return null

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
        return await chatApi.createSession(title, projectId)
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
      if (!user) return false

      setLoading(true)
      setError(null)

      try {
        await chatApi.deleteSession(sessionId)
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
      data: { title?: string; project_id?: string | null }
    ): Promise<SessionEntry | null> => {
      if (!user) return null

      if (data.title && data.title.length > 200) {
        setError('Title must be 200 characters or less')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        return await chatApi.updateSession(sessionId, data)
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
