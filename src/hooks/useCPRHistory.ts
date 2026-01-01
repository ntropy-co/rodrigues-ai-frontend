'use client'

/**
 * useCPRHistory Hook
 *
 * Hook for managing CPR history with React Query.
 * Provides listing, filtering, creating, and deleting CPR history items.
 *
 * Features:
 * - React Query for caching and automatic refetching
 * - Pagination support
 * - Filter by type, status, commodity, and date range
 * - Optimistic updates on mutations
 *
 * Usage:
 * ```tsx
 * const {
 *   items,
 *   total,
 *   isLoading,
 *   error,
 *   filters,
 *   setFilters,
 *   createEntry,
 *   deleteEntry,
 *   refetch
 * } = useCPRHistory()
 *
 * // Apply filters
 * setFilters({ type: 'analise', status: 'completed' })
 *
 * // Criar nova entrada
 * await createEntry({
 *   type: 'analise',
 *   title: 'Análise CPR - Fazenda XYZ',
 *   metadata: { commodity: 'soja', total_value: 150000 }
 * })
 * ```
 */

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'
import { trackEvent } from '@/components/providers/PostHogProvider'

// =============================================================================
// Types
// =============================================================================

export type CPRHistoryType = 'analise' | 'criar' | 'simulacao'
export type CPRHistoryStatus = 'completed' | 'pending' | 'failed'

export interface CPRHistoryMetadata {
  commodity?: string
  quantity?: number
  unit_price?: number
  total_value?: number
  producer?: string
  due_date?: string
  risk_score?: number
  compliance_score?: number
  compliance_grade?: string
}

export interface CPRHistoryItem {
  id: string
  type: CPRHistoryType
  title: string
  status: CPRHistoryStatus
  created_at: string
  updated_at: string
  document_url?: string
  metadata: CPRHistoryMetadata
}

export interface CPRHistoryFilters {
  type?: CPRHistoryType | 'all'
  status?: CPRHistoryStatus | 'all'
  commodity?: string
  dateFrom?: string
  dateTo?: string
}

export interface CPRHistoryListResponse {
  items: CPRHistoryItem[]
  total: number
  page: number
  limit: number
}

export interface CPRHistoryCreateRequest {
  type: CPRHistoryType
  title: string
  status?: CPRHistoryStatus
  document_url?: string
  session_id?: string
  metadata?: CPRHistoryMetadata
}

export interface UseCPRHistoryOptions {
  /** Initial page size */
  pageSize?: number
  /** Enable auto-fetch on mount */
  enabled?: boolean
}

export interface UseCPRHistoryReturn {
  /** List of CPR history items */
  items: CPRHistoryItem[]
  /** Total count of items (for pagination) */
  total: number
  /** Current page (0-indexed) */
  page: number
  /** Items per page */
  pageSize: number
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Current filters */
  filters: CPRHistoryFilters
  /** Update filters */
  setFilters: (filters: CPRHistoryFilters) => void
  /** Change page */
  setPage: (page: number) => void
  /** Create new history entry */
  createEntry: (data: CPRHistoryCreateRequest) => Promise<CPRHistoryItem | null>
  /** Delete history entry */
  deleteEntry: (id: string) => Promise<boolean>
  /** Manually refetch data */
  refetch: () => Promise<void>
  /** Check if there are more pages */
  hasNextPage: boolean
  /** Check if on first page */
  hasPreviousPage: boolean
}

// =============================================================================
// API Functions
// =============================================================================

async function fetchCPRHistory(
  page: number,
  pageSize: number,
  filters: CPRHistoryFilters
): Promise<CPRHistoryListResponse> {
  const url = new URL('/api/cpr/history', window.location.origin)
  url.searchParams.set('skip', String(page * pageSize))
  url.searchParams.set('limit', String(pageSize))

  if (filters.type && filters.type !== 'all') {
    url.searchParams.set('type', filters.type)
  }
  if (filters.status && filters.status !== 'all') {
    url.searchParams.set('status', filters.status)
  }
  if (filters.commodity) {
    url.searchParams.set('commodity', filters.commodity)
  }
  if (filters.dateFrom) {
    url.searchParams.set('date_from', filters.dateFrom)
  }
  if (filters.dateTo) {
    url.searchParams.set('date_to', filters.dateTo)
  }

  console.log('[useCPRHistory] Fetching:', url.toString())

  const response = await fetchWithRefresh(url.toString())

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao carregar histórico')
  }

  return response.json()
}

async function createCPRHistoryEntry(
  data: CPRHistoryCreateRequest
): Promise<CPRHistoryItem> {
  console.log('[useCPRHistory] Creating entry:', data.type, data.title)

  const response = await fetchWithRefresh('/api/cpr/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao criar registro')
  }

  return response.json()
}

async function deleteCPRHistoryEntry(id: string): Promise<void> {
  console.log('[useCPRHistory] Deleting entry:', id)

  const response = await fetchWithRefresh(`/api/cpr/history/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Erro ao remover registro')
  }
}

// =============================================================================
// Hook
// =============================================================================

export function useCPRHistory(
  options: UseCPRHistoryOptions = {}
): UseCPRHistoryReturn {
  const { pageSize: initialPageSize = 20, enabled = true } = options

  const queryClient = useQueryClient()

  // Local state for pagination and filters
  const [page, setPage] = useState(0)
  const [pageSize] = useState(initialPageSize)
  const [filters, setFiltersState] = useState<CPRHistoryFilters>({})

  // Query for fetching history
  const {
    data,
    isLoading,
    error: queryError,
    refetch: queryRefetch
  } = useQuery({
    queryKey: ['cpr', 'history', page, pageSize, filters],
    queryFn: () => fetchCPRHistory(page, pageSize, filters),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5 // 5 minutes
  })

  // Mutation for creating entries
  const createMutation = useMutation({
    mutationFn: createCPRHistoryEntry,
    onSuccess: (newItem) => {
      // Track event
      trackEvent('cpr_history_create', {
        type: newItem.type,
        status: newItem.status
      })

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['cpr', 'history'] })
    }
  })

  // Mutation for deleting entries
  const deleteMutation = useMutation({
    mutationFn: deleteCPRHistoryEntry,
    onSuccess: (_, deletedId) => {
      // Track event
      trackEvent('cpr_history_delete', { id: deletedId })

      // Optimistically remove from cache
      queryClient.setQueryData<CPRHistoryListResponse>(
        ['cpr', 'history', page, pageSize, filters],
        (old) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.filter((item) => item.id !== deletedId),
            total: old.total - 1
          }
        }
      )

      // Invalidate to refetch accurate data
      queryClient.invalidateQueries({ queryKey: ['cpr', 'history'] })
    }
  })

  // Atualizar filtros (retorna à primeira página)
  const setFilters = useCallback((newFilters: CPRHistoryFilters) => {
    setFiltersState(newFilters)
    setPage(0) // Retornar à primeira página quando os filtros mudarem
  }, [])

  // Wrapper para criar entrada
  const createEntry = useCallback(
    async (data: CPRHistoryCreateRequest): Promise<CPRHistoryItem | null> => {
      try {
        return await createMutation.mutateAsync(data)
      } catch (error) {
        console.error('[useCPRHistory] Create error:', error)
        return null
      }
    },
    [createMutation]
  )

  // Wrapper para excluir entrada
  const deleteEntry = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync(id)
        return true
      } catch (error) {
        console.error('[useCPRHistory] Delete error:', error)
        return false
      }
    },
    [deleteMutation]
  )

  // Refetch wrapper
  const refetch = useCallback(async () => {
    await queryRefetch()
  }, [queryRefetch])

  // Pagination helpers
  const total = data?.total ?? 0
  const hasNextPage = (page + 1) * pageSize < total
  const hasPreviousPage = page > 0

  // Error handling
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : 'Erro desconhecido'
    : null

  return {
    items: data?.items ?? [],
    total,
    page,
    pageSize,
    isLoading,
    error,
    filters,
    setFilters,
    setPage,
    createEntry,
    deleteEntry,
    refetch,
    hasNextPage,
    hasPreviousPage
  }
}

export default useCPRHistory
