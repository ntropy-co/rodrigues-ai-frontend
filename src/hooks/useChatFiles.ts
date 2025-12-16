'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type {
  ChatFile,
  FileUploadProgress,
  ChatFilesListResponse
} from '@/types/chat-files'
import { getFileCategory, getFileExtension } from '@/lib/utils/file-utils'
import { getAuthToken } from '@/lib/auth/cookies'
import { trackDocumentUpload, trackDocumentDownload } from '@/lib/analytics'

// ============================================================================
// Types
// ============================================================================

export interface UseChatFilesResult {
  // Data
  files: ChatFile[]
  uploadedFiles: ChatFile[]
  generatedFiles: ChatFile[]

  // State
  isLoading: boolean
  error: string | null
  uploadProgress: FileUploadProgress[]

  // Actions
  fetchFiles: () => Promise<void>
  uploadFile: (file: File) => Promise<ChatFile | null>
  removeFile: (fileId: string) => Promise<void>
  downloadFile: (fileId: string) => Promise<void>
  clearError: () => void
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook para gerenciar arquivos associados a uma conversa.
 *
 * Fornece:
 * - Lista de arquivos (uploads e gerados)
 * - Upload com progresso
 * - Download e remoção
 * - Filtros por tipo (uploaded vs generated)
 *
 * @param conversationId - ID da conversa atual (null = sem conversa ativa)
 * @param userId - ID do usuário (para API auth)
 *
 * @example
 * ```tsx
 * const { files, uploadFile, isLoading } = useChatFiles(sessionId, userId)
 * ```
 */
export function useChatFiles(
  conversationId: string | null,
  userId?: string
): UseChatFilesResult {
  // State
  const [files, setFiles] = useState<ChatFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

  // Derived state: filtered files
  const uploadedFiles = useMemo(
    () => files.filter((f) => f.type === 'upload'),
    [files]
  )

  const generatedFiles = useMemo(
    () => files.filter((f) => f.type === 'generated'),
    [files]
  )

  // -------------------------------------------------------------------------
  // Fetch Files
  // -------------------------------------------------------------------------
  const fetchFiles = useCallback(async () => {
    if (!conversationId) {
      setFiles([])
      return
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      // Use relative path for proxy
      const url = new URL('/api/documents/conversation', window.location.origin)
      url.searchParams.append('conversation_id', conversationId)
      if (userId) {
        url.searchParams.append('user_id', userId)
      }

      const token = getAuthToken()
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url.toString(), {
        headers,
        signal: controller.signal
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(
          `Erro ao carregar arquivos: ${response.status} ${errorText}`
        )
      }

      const data: ChatFilesListResponse = await response.json()
      setFiles(data.files || [])
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      console.error('[useChatFiles] Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, userId])

  // -------------------------------------------------------------------------
  // Upload File
  // -------------------------------------------------------------------------
  const uploadFile = useCallback(
    async (file: File): Promise<ChatFile | null> => {
      if (!conversationId) {
        setError('Nenhuma conversa ativa')
        return null
      }

      const uploadId = `upload-${Date.now()}-${Math.random()}`

      // Add to progress tracking
      setUploadProgress((prev) => [
        ...prev,
        {
          uploadId,
          fileName: file.name,
          progress: 0,
          status: 'pending'
        }
      ])

      try {
        // Update status to uploading
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.uploadId === uploadId
              ? { ...p, status: 'uploading', progress: 10 }
              : p
          )
        )

        const formData = new FormData()
        formData.append('file', file)
        formData.append('conversation_id', conversationId)
        if (userId) {
          formData.append('user_id', userId)
        }

        // Simulate progress updates (real implementation would use XMLHttpRequest)
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.uploadId === uploadId ? { ...p, progress: 50 } : p
          )
        )

        const token = getAuthToken()
        const headers: HeadersInit = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers,
          body: formData
        })

        if (!response.ok) {
          throw new Error('Erro ao enviar arquivo')
        }

        setUploadProgress((prev) =>
          prev.map((p) =>
            p.uploadId === uploadId
              ? { ...p, status: 'processing', progress: 80 }
              : p
          )
        )

        const data = await response.json()

        // Create ChatFile from response
        const newFile: ChatFile = {
          id: data.document_id || data.id,
          conversationId,
          type: 'upload',
          fileName: file.name,
          fileExtension: getFileExtension(file.name),
          fileCategory: getFileCategory(getFileExtension(file.name)),
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date(),
          url: data.url || ''
        }

        // Add to files list
        setFiles((prev) => [...prev, newFile])

        // Mark upload as complete
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.uploadId === uploadId
              ? { ...p, status: 'complete', progress: 100, fileId: newFile.id }
              : p
          )
        )

        // Track document upload event
        trackDocumentUpload({
          document_id: newFile.id,
          file_name: newFile.fileName,
          file_size: newFile.fileSize,
          file_type: newFile.mimeType,
          file_category: newFile.fileCategory,
          conversation_id: conversationId
        })

        // Remove from progress after delay (with cleanup tracking)
        const timeoutId = setTimeout(() => {
          setUploadProgress((prev) =>
            prev.filter((p) => p.uploadId !== uploadId)
          )
          timeoutsRef.current.delete(timeoutId)
        }, 2000)
        timeoutsRef.current.add(timeoutId)

        return newFile
      } catch (err) {
        console.error('[useChatFiles] Upload error:', err)

        setUploadProgress((prev) =>
          prev.map((p) =>
            p.uploadId === uploadId
              ? {
                  ...p,
                  status: 'error',
                  error: err instanceof Error ? err.message : 'Erro'
                }
              : p
          )
        )

        setError(err instanceof Error ? err.message : 'Erro ao enviar arquivo')
        return null
      }
    },
    [conversationId, userId]
  )

  // -------------------------------------------------------------------------
  // Remove File
  // -------------------------------------------------------------------------
  const removeFile = useCallback(async (fileId: string) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`/api/documents/${fileId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })

      if (!response.ok) {
        throw new Error('Erro ao remover arquivo')
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch (err) {
      console.error('[useChatFiles] Remove error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao remover arquivo')
      throw err
    }
  }, [])

  // -------------------------------------------------------------------------
  // Download File
  // -------------------------------------------------------------------------
  const downloadFile = useCallback(async (fileId: string) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`/api/documents/${fileId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })

      if (!response.ok) {
        throw new Error('Erro ao baixar arquivo')
      }

      // Get filename from header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/i)
      const filename = filenameMatch?.[1] || 'arquivo'

      // Get file type from Content-Type header
      const contentType =
        response.headers.get('Content-Type') || 'application/octet-stream'

      // Track document download event
      trackDocumentDownload(fileId, filename, contentType)

      // Create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('[useChatFiles] Download error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao baixar arquivo')
      throw err
    }
  }, [])

  // -------------------------------------------------------------------------
  // Clear Error
  // -------------------------------------------------------------------------
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------

  // Fetch files when conversationId changes
  useEffect(() => {
    if (conversationId) {
      fetchFiles()
    } else {
      setFiles([])
    }
  }, [conversationId, fetchFiles])

  // Cleanup on unmount
  useEffect(() => {
    // Copy refs to local variables to avoid stale refs in cleanup
    const controller = abortControllerRef.current
    const timeouts = timeoutsRef.current

    return () => {
      // Cancel any pending fetch requests
      if (controller) {
        controller.abort()
      }

      // Clear all pending timeouts
      timeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId)
      })
      timeouts.clear()
    }
  }, [])

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    files,
    uploadedFiles,
    generatedFiles,
    isLoading,
    error,
    uploadProgress,
    fetchFiles,
    uploadFile,
    removeFile,
    downloadFile,
    clearError
  }
}
