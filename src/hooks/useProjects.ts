'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'

/**
 * Project from backend
 */
export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Hook for managing projects
 */
export function useProjects() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchProjects = useCallback(async (): Promise<Project[]> => {
    if (!user) {
      console.log(
        '[useProjects] No authenticated user available, skipping fetch'
      )
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithRefresh('/api/projects', {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn(
          '[useProjects] Response not OK:',
          response.status,
          errorData
        )
        // Don't throw on 401/404, just return empty array
        if (response.status === 401 || response.status === 404) {
          return []
        }
        throw new Error(errorData.detail || 'Erro ao carregar projetos')
      }

      const data: Project[] = await response.json()
      return data
    } catch (err) {
      console.error('[useProjects] Error fetching projects:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return []
    } finally {
      setLoading(false)
    }
  }, [user])

  const createProject = useCallback(
    async (data: {
      title: string
      description?: string
    }): Promise<Project | null> => {
      if (!user) {
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          throw new Error('Erro ao criar projeto')
        }

        const result: Project = await response.json()
        return result
      } catch (err) {
        console.error('[useProjects] Error creating project:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const updateProject = useCallback(
    async (
      id: string,
      data: { title?: string; description?: string }
    ): Promise<Project | null> => {
      if (!user) return null

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          throw new Error('Erro ao atualizar projeto')
        }

        const result: Project = await response.json()
        return result
      } catch (err) {
        console.error('[useProjects] Error updating project:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh(`/api/projects/${id}`, {
          method: 'DELETE'
        })

        if (!response.ok && response.status !== 204) {
          throw new Error('Erro ao deletar projeto')
        }

        return true
      } catch (err) {
        console.error('[useProjects] Error deleting project:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return false
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  return {
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}
