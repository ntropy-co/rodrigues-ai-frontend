import { useState, useEffect, useCallback } from 'react'
import type { UserDocument } from '@/components/v2/FileUpload/FileList'

export function useDocuments(userId: string, sessionId?: string) {
  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const fetchDocuments = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const url = new URL(`${apiUrl}/api/v1/documents/user/${userId}`)
      if (sessionId) {
        url.searchParams.append('session_id', sessionId)
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error('Erro ao carregar documentos')
      }

      const data = await response.json()
      setDocuments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [userId, sessionId, apiUrl])

  const removeDocument = async (documentId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao remover documento')
      }

      // Remove from local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
    } catch (err) {
      throw err
    }
  }

  const downloadDocument = async (documentId: string) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/v1/documents/${documentId}/download`
      )

      if (!response.ok) {
        throw new Error('Erro ao baixar documento')
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/i)
      const filename = filenameMatch?.[1] || 'document'

      // Download file
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
      throw err
    }
  }

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    removeDocument,
    downloadDocument
  }
}
