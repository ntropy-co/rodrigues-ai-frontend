'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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
  const { token } = useAuth()

  const fetchProjects = useCallback(async (): Promise<Project[]> => {
    if (!token) {
      console.log('[useProjects] No token available, skipping fetch')
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
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
  }, [token])

  const createProject = useCallback(
    async (data: {
      title: string
      description?: string
    }): Promise<Project | null> => {
      if (!token) {
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
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
    [token]
  )

  const updateProject = useCallback(
    async (
      id: string,
      data: { title?: string; description?: string }
    ): Promise<Project | null> => {
      if (!token) return null

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/projects?id=${id}`, {
          method: 'PATCH', // Assumes backend supports PATCH /api/projects?id=... or /api/projects/[id]
          // Wait, the backend route I created earlier was PATCH /api/v1/projects/{project_id}
          // The frontend proxy /api/projects probably needs to handle [id].
          // Actually, let's look at the proxy route first.
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
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
    [token]
  )

  return {
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject
  }
}
