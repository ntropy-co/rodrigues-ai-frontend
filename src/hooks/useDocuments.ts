import { useState, useEffect, useCallback } from 'react'
import type { UserDocument } from '@/components/v2/FileUpload/FileList'
import { getAuthToken } from '@/lib/auth/cookies'

export function useDocuments(userId: string, sessionId?: string) {
  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      // Use Next.js API Route as proxy to avoid CORS issues
      const url = new URL(
        `/api/documents/user/${userId}`,
        window.location.origin
      )
      if (sessionId) {
        url.searchParams.append('session_id', sessionId)
      }

      console.log('[useDocuments] Fetching documents from:', url.toString())

      const token = getAuthToken()
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url.toString(), { headers })

      console.log('[useDocuments] Response status:', response.status)

      if (!response.ok) {
        throw new Error('Erro ao carregar documentos')
      }

      const data = await response.json()
      // Backend returns { documents: [...], count: N }
      const docs = data.documents || []
      console.log(
        '[useDocuments] Fetched',
        data.count ?? docs.length,
        'documents'
      )
      setDocuments(docs)
    } catch (err) {
      console.error('[useDocuments] Error:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [userId, sessionId])

  const removeDocument = async (documentId: string) => {
    try {
      // Use Next.js API Route as proxy to avoid CORS issues
      console.log('[useDocuments] Deleting document:', documentId)

      const token = getAuthToken()
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers
      })

      console.log('[useDocuments] Delete response status:', response.status)

      if (!response.ok) {
        throw new Error('Erro ao remover documento')
      }

      // Remove from local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
    } catch (err) {
      console.error('[useDocuments] Delete error:', err)
      throw err
    }
  }

  const downloadDocument = async (documentId: string) => {
    try {
      // Use Next.js API Route as proxy to avoid CORS issues
      console.log('[useDocuments] Downloading document:', documentId)

      const token = getAuthToken()
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers
      })

      console.log('[useDocuments] Download response status:', response.status)

      if (!response.ok) {
        throw new Error('Erro ao baixar documento')
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/i)
      const filename = filenameMatch?.[1] || 'document'

      console.log('[useDocuments] Downloading file:', filename)

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

      console.log('[useDocuments] Download complete')
    } catch (err) {
      console.error('[useDocuments] Download error:', err)
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
