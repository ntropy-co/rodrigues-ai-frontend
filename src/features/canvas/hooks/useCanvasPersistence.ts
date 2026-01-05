import { useCallback, useEffect } from 'react'
import { useCanvasStore } from '@/features/canvas'

const CANVAS_STORAGE_KEY = 'verity_canvas_'

interface CanvasPersistence {
  content: string
  title: string
  updatedAt: number
}

/**
 * Hook for persisting Canvas content locally and syncing with backend.
 * Uses localStorage as immediate persistence and will sync to backend when available.
 */
export function useCanvasPersistence(sessionId: string | null) {
  const { content, title, updateContent, openCanvas } = useCanvasStore()

  // Load canvas from localStorage on mount
  const loadFromLocal = useCallback(() => {
    if (!sessionId) return null

    try {
      const stored = localStorage.getItem(`${CANVAS_STORAGE_KEY}${sessionId}`)
      if (stored) {
        const parsed: CanvasPersistence = JSON.parse(stored)
        return parsed
      }
    } catch (error) {
      console.warn('[Canvas] Failed to load from localStorage:', error)
    }
    return null
  }, [sessionId])

  // Save canvas to localStorage
  const saveToLocal = useCallback(
    (newContent: string, newTitle: string) => {
      if (!sessionId) return

      try {
        const data: CanvasPersistence = {
          content: newContent,
          title: newTitle,
          updatedAt: Date.now()
        }
        localStorage.setItem(
          `${CANVAS_STORAGE_KEY}${sessionId}`,
          JSON.stringify(data)
        )
      } catch (error) {
        console.warn('[Canvas] Failed to save to localStorage:', error)
      }
    },
    [sessionId]
  )

  // Auto-save on content change (debounced effect)
  useEffect(() => {
    if (!sessionId || !content) return

    const timeoutId = setTimeout(() => {
      saveToLocal(content, title || 'Untitled')
    }, 1000) // Debounce 1 second

    return () => clearTimeout(timeoutId)
  }, [content, title, sessionId, saveToLocal])

  // Restore canvas when session changes
  const restoreCanvas = useCallback(() => {
    const stored = loadFromLocal()
    if (stored) {
      openCanvas(stored.content, stored.title, 'view')
      return true
    }
    return false
  }, [loadFromLocal, openCanvas])

  // Clear canvas for a session
  const clearLocalCanvas = useCallback(() => {
    if (!sessionId) return
    try {
      localStorage.removeItem(`${CANVAS_STORAGE_KEY}${sessionId}`)
    } catch (error) {
      console.warn('[Canvas] Failed to clear localStorage:', error)
    }
  }, [sessionId])

  return {
    restoreCanvas,
    saveToLocal,
    clearLocalCanvas,
    hasLocalCanvas: !!loadFromLocal()
  }
}
