'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InternalHeader } from '@/components/v2/Header/InternalHeader'
import { toast } from 'sonner'
import { useCPRHistory } from '@/hooks/useCPRHistory'
import { CPRHistoryList, CPRHistoryFilters } from '@/components/v2/CPRHistory'
import type { CPRHistoryItem } from '@/hooks/useCPRHistory'

export default function CPRHistoricoPage() {
  const router = useRouter()

  const {
    items,
    total,
    page,
    pageSize,
    isLoading,
    error,
    filters,
    setFilters,
    setPage,
    deleteEntry,
    refetch
  } = useCPRHistory()

  // Check if any filter is active
  const hasFilters =
    (filters.type && filters.type !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    Boolean(filters.commodity)

  // Handle view item
  const handleView = useCallback(
    (item: CPRHistoryItem) => {
      // Navigate based on type
      if (item.type === 'analise') {
        router.push(`/cpr/analise?session=${item.id}`)
      } else if (item.type === 'criar') {
        router.push(`/cpr/wizard?session=${item.id}`)
      } else if (item.type === 'simulacao') {
        router.push('/cpr/simulator')
      }
    },
    [router]
  )

  // Handle download
  const handleDownload = useCallback((item: CPRHistoryItem) => {
    if (item.document_url) {
      window.open(item.document_url, '_blank')
    } else {
      toast.error('Documento não disponível')
    }
  }, [])

  // Handle delete
  const handleDelete = useCallback(
    async (item: CPRHistoryItem) => {
      const confirmed = window.confirm(
        `Tem certeza que deseja remover "${item.title}"?`
      )
      if (!confirmed) return

      const success = await deleteEntry(item.id)
      if (success) {
        toast.success('Registro removido com sucesso')
      } else {
        toast.error('Erro ao remover registro')
      }
    },
    [deleteEntry]
  )

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({})
  }, [setFilters])

  return (
    <div className="min-h-screen">
      <InternalHeader
        title="Historico de CPRs"
        subtitle="Visualize e gerencie analises e emissoes de CPR."
        backHref="/chat"
        containerClassName="max-w-6xl"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        }
      />

      <div className="container mx-auto max-w-6xl px-4 py-10">
        {/* Filters */}
        <div className="mb-6">
          <CPRHistoryFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* List */}
        <CPRHistoryList
          items={items}
          isLoading={isLoading}
          total={total}
          page={page}
          pageSize={pageSize}
          hasFilters={hasFilters}
          onPageChange={setPage}
          onClearFilters={handleClearFilters}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />

        {/* Summary */}
        {!isLoading && total > 0 && (
          <div className="mt-6 text-center text-sm text-verity-500">
            Total: {total} {total === 1 ? 'registro' : 'registros'}
          </div>
        )}
      </div>
    </div>
  )
}
