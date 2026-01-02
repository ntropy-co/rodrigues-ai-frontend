'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { chatApi, type Project } from '../api'

export type { Project }

/**
 * Hook for managing projects
 */
export function useProjects() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchProjects = useCallback(async (): Promise<Project[]> => {
    if (!user) return []

    setLoading(true)
    setError(null)

    try {
      return await chatApi.getProjects()
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
      if (!user) return null

      setLoading(true)
      setError(null)

      try {
        return await chatApi.createProject(data)
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
        return await chatApi.updateProject(id, data)
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
        await chatApi.deleteProject(id)
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
