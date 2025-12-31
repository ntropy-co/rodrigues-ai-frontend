'use client'

import { AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CPRHistoryCard } from './CPRHistoryCard'
import { CPRHistoryEmpty } from './CPRHistoryEmpty'
import type { CPRHistoryItem } from '@/hooks/useCPRHistory'

// =============================================================================
// Types
// =============================================================================

export interface CPRHistoryListProps {
  items: CPRHistoryItem[]
  isLoading: boolean
  total: number
  page: number
  pageSize: number
  hasFilters: boolean
  onPageChange: (page: number) => void
  onClearFilters: () => void
  onView?: (item: CPRHistoryItem) => void
  onDownload?: (item: CPRHistoryItem) => void
  onDelete?: (item: CPRHistoryItem) => void
}

// =============================================================================
// Skeleton
// =============================================================================

function CPRHistoryCardSkeleton() {
  return (
    <div className="border border-verity-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Component
// =============================================================================

export function CPRHistoryList({
  items,
  isLoading,
  total,
  page,
  pageSize,
  hasFilters,
  onPageChange,
  onClearFilters,
  onView,
  onDownload,
  onDelete
}: CPRHistoryListProps) {
  // Loading state
  if (isLoading && items.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CPRHistoryCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <CPRHistoryEmpty
        hasFilters={hasFilters}
        onClearFilters={hasFilters ? onClearFilters : undefined}
      />
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize)
  const startItem = page * pageSize + 1
  const endItem = Math.min((page + 1) * pageSize, total)

  return (
    <div className="space-y-4">
      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <CPRHistoryCard
              key={item.id}
              item={item}
              onView={onView}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Loading overlay for page changes */}
      {isLoading && items.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-verity-600" />
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-verity-200">
          <p className="text-sm text-verity-600">
            Mostrando {startItem} a {endItem} de {total} resultados
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm text-verity-600 px-2">
              Página {page + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1 || isLoading}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CPRHistoryList
