'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { ChatFile, FileUploadProgress } from '../types'
import { getFileCategory, getFileExtension } from '@/lib/utils/file-utils'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'
import { trackDocumentUpload, trackDocumentDownload } from '@/lib/analytics'
import { chatApi } from '../api'

export interface UseChatFilesResult {
  files: ChatFile[]
  uploadedFiles: ChatFile[]
  generatedFiles: ChatFile[]
  isLoading: boolean
  error: string | null
  uploadProgress: FileUploadProgress[]
  fetchFiles: () => Promise<void>
  uploadFile: (file: File) => Promise<ChatFile | null>
  removeFile: (fileId: string) => Promise<void>
  downloadFile: (fileId: string) => Promise<void>
  clearError: () => void
}

export function useChatFiles(
  conversationId: string | null,
  userId?: string
): UseChatFilesResult {
  const [files, setFiles] = useState<ChatFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])

  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

  const uploadedFiles = useMemo(
    () => files.filter((f) => f.type === 'upload'),
    [files]
  )
  const generatedFiles = useMemo(
    () => files.filter((f) => f.type === 'generated'),
    [files]
  )

  const fetchFiles = useCallback(async () => {
    if (!conversationId) {
      setFiles([])
      return
    }

    if (abortControllerRef.current) abortControllerRef.current.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const transformedFiles = await chatApi.getFiles(
        conversationId,
        userId,
        controller.signal
      )
      setFiles(transformedFiles)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('[useChatFiles] Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, userId])

  const uploadFile = useCallback(
    async (file: File): Promise<ChatFile | null> => {
      if (!conversationId) {
        setError('Nenhuma conversa ativa')
        return null
      }

      const uploadId = `upload-${Date.now()}-${Math.random()}`
      setUploadProgress((prev) => [
        ...prev,
        { uploadId, fileName: file.name, progress: 0, status: 'pending' }
      ])

      try {
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.uploadId === uploadId
              ? { ...p, status: 'uploading', progress: 50 }
              : p
          )
        )

        const data = await chatApi.uploadFile(file, conversationId, userId)

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

        setFiles((prev) => [...prev, newFile])
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.uploadId === uploadId
              ? { ...p, status: 'complete', progress: 100, fileId: newFile.id }
              : p
          )
        )

        trackDocumentUpload({
          document_id: newFile.id,
          file_name: newFile.fileName,
          file_size: newFile.fileSize,
          file_type: newFile.mimeType,
          file_category: newFile.fileCategory,
          conversation_id: conversationId
        })

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

  const removeFile = useCallback(async (fileId: string) => {
    try {
      const response = await fetchWithRefresh(`/api/documents/${fileId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erro ao remover arquivo')
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch (err) {
      console.error('[useChatFiles] Remove error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao remover arquivo')
      throw err
    }
  }, [])

  const downloadFile = useCallback(async (fileId: string) => {
    try {
      const response = await fetchWithRefresh(
        `/api/documents/${fileId}/download`
      )
      if (!response.ok) throw new Error('Erro ao baixar arquivo')

      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/i)
      const filename = filenameMatch?.[1] || 'arquivo'
      const contentType =
        response.headers.get('Content-Type') || 'application/octet-stream'

      trackDocumentDownload(fileId, filename, contentType)

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

  const clearError = useCallback(() => setError(null), [])

  useEffect(() => {
    if (conversationId) fetchFiles()
    else setFiles([])
  }, [conversationId, fetchFiles])

  useEffect(() => {
    const timeouts = timeoutsRef.current
    return () => {
      abortControllerRef.current?.abort()
      timeouts.forEach((id) => clearTimeout(id))
      timeouts.clear()
    }
  }, [])

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
