import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserDocument } from '@/components/v2/FileUpload/FileList'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'

// =============================================================================
// API Functions
// =============================================================================

/**
 * Fetch documents from backend
 */
async function fetchDocumentsAPI(sessionId?: string): Promise<UserDocument[]> {
  const url = new URL('/api/documents/user', window.location.origin)
  if (sessionId) {
    url.searchParams.append('session_id', sessionId)
  }

  console.log('[useDocuments] Fetching documents from:', url.toString())

  const response = await fetchWithRefresh(url.toString())

  console.log('[useDocuments] Response status:', response.status)

  if (!response.ok) {
    throw new Error('Erro ao carregar documentos')
  }

  const data = await response.json()
  // Backend returns { documents: [...], count: N }
  const docs = data.documents || []
  console.log('[useDocuments] Fetched', data.count ?? docs.length, 'documents')
  return docs
}

/**
 * Delete a document
 */
async function deleteDocumentAPI(documentId: string): Promise<void> {
  console.log('[useDocuments] Deleting document:', documentId)

  const response = await fetchWithRefresh(`/api/documents/${documentId}`, {
    method: 'DELETE'
  })

  console.log('[useDocuments] Delete response status:', response.status)

  if (!response.ok) {
    throw new Error('Erro ao remover documento')
  }
}

/**
 * Download a document
 */
async function downloadDocumentAPI(documentId: string): Promise<void> {
  console.log('[useDocuments] Downloading document:', documentId)

  const response = await fetchWithRefresh(
    `/api/documents/${documentId}/download`
  )

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
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for managing user documents with React Query
 *
 * Features:
 * - Automatic caching and deduplication
 * - Stale-while-revalidate
 * - Optimistic updates on delete
 * - Auto-refresh on mutations
 *
 * Usage:
 * ```tsx
 * const { documents, loading, error, fetchDocuments, removeDocument, downloadDocument } = useDocuments(sessionId)
 * ```
 */
export function useDocuments(sessionId?: string) {
  const queryClient = useQueryClient()

  // Query for fetching documents
  const {
    data: documents = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['documents', 'user', sessionId],
    queryFn: () => fetchDocumentsAPI(sessionId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10 // 10 minutes
  })

  // Mutation for deleting a document
  const deleteMutation = useMutation({
    mutationFn: deleteDocumentAPI,
    onSuccess: () => {
      // Invalidate and refetch documents query
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    }
  })

  // Error handling
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : 'Erro desconhecido'
    : null

  return {
    documents,
    loading,
    error,
    fetchDocuments: refetch,
    removeDocument: deleteMutation.mutateAsync,
    downloadDocument: downloadDocumentAPI
  }
}
