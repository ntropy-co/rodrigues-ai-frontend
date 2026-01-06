import { useCallback, useEffect, useRef } from 'react'
import { useCanvasStore } from '@/features/canvas'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'

const CANVAS_STORAGE_KEY = 'verity_canvas_'

interface CanvasPersistence {
  content: string
  title: string
  updatedAt: number
}

/**
 * Hook for persisting Canvas content locally and syncing with backend.
 * Uses localStorage as immediate persistence and syncs to backend (debounced).
 */
export function useCanvasPersistence(sessionId: string | null) {
  const { content, title, openCanvas } = useCanvasStore()
  const lastSyncedRef = useRef<string>('')

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

  // Save canvas to backend via PATCH /sessions/:id
  const saveToBackend = useCallback(
    async (newContent: string, newTitle: string) => {
      if (!sessionId) return

      // Skip if no change since last sync
      const hash = `${newContent}||${newTitle}`
      if (hash === lastSyncedRef.current) return

      try {
        const response = await fetchWithRefresh(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            canvas_content: newContent,
            canvas_title: newTitle
          })
        })

        if (response.ok) {
          lastSyncedRef.current = hash
          console.log('[Canvas] Synced to backend')
        } else {
          console.warn('[Canvas] Backend sync failed:', response.status)
        }
      } catch (error) {
        console.warn('[Canvas] Backend sync error:', error)
      }
    },
    [sessionId]
  )

  // Auto-save: localStorage (1s debounce), backend (3s debounce)
  useEffect(() => {
    if (!sessionId || !content) return

    // Immediate local save (1s debounce)
    const localTimeout = setTimeout(() => {
      saveToLocal(content, title || 'Untitled')
    }, 1000)

    // Backend sync (3s debounce - less frequent)
    const backendTimeout = setTimeout(() => {
      saveToBackend(content, title || 'Untitled')
    }, 3000)

    return () => {
      clearTimeout(localTimeout)
      clearTimeout(backendTimeout)
    }
  }, [content, title, sessionId, saveToLocal, saveToBackend])

  // Load from backend on session change
  const loadFromBackend =
    useCallback(async (): Promise<CanvasPersistence | null> => {
      if (!sessionId) return null

      try {
        const response = await fetchWithRefresh(`/api/sessions/${sessionId}`)
        if (response.ok) {
          const session = await response.json()
          if (session.canvas_content) {
            return {
              content: session.canvas_content,
              title: session.canvas_title || 'Untitled',
              updatedAt: Date.now()
            }
          }
        }
      } catch (error) {
        console.warn('[Canvas] Failed to load from backend:', error)
      }
      return null
    }, [sessionId])

  // Restore canvas when session changes (prefer backend, fallback to local)
  const restoreCanvas = useCallback(async () => {
    // Try backend first
    const backendData = await loadFromBackend()
    if (backendData) {
      openCanvas(backendData.content, backendData.title, 'view')
      // Also save to local for offline
      saveToLocal(backendData.content, backendData.title)
      return true
    }

    // Fallback to local
    const stored = loadFromLocal()
    if (stored) {
      openCanvas(stored.content, stored.title, 'view')
      return true
    }
    return false
  }, [loadFromBackend, loadFromLocal, openCanvas, saveToLocal])

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
    saveToBackend,
    clearLocalCanvas,
    hasLocalCanvas: !!loadFromLocal()
  }
}
