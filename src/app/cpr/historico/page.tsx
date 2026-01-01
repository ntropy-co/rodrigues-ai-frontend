'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { History, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useCPRHistory } from '@/hooks/useCPRHistory'
import {
  CPRHistoryList,
  CPRHistoryFilters
} from '@/components/v2/CPRHistory'
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

  // Verificar se algum filtro está ativo
  const hasFilters =
    (filters.type && filters.type !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    Boolean(filters.commodity)

  // Lidar com visualização de item
  const handleView = useCallback((item: CPRHistoryItem) => {
    // Navegar baseado no tipo
    if (item.type === 'analise') {
      router.push(`/cpr/analise?session=${item.id}`)
    } else if (item.type === 'criar') {
      router.push(`/cpr/wizard?session=${item.id}`)
    } else if (item.type === 'simulacao') {
      router.push('/cpr/simulator')
    }
  }, [router])

  // Lidar com download
  const handleDownload = useCallback((item: CPRHistoryItem) => {
    if (item.document_url) {
      window.open(item.document_url, '_blank')
    } else {
      toast.error('Documento não disponível')
    }
  }, [])

  // Lidar com exclusão
  const handleDelete = useCallback(async (item: CPRHistoryItem) => {
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
  }, [deleteEntry])

  // Lidar com limpar filtros
  const handleClearFilters = useCallback(() => {
    setFilters({})
  }, [setFilters])

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-verity-100 p-2">
              <History className="h-6 w-6 text-verity-700" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-verity-900">
              Histórico de CPRs
            </h1>
          </div>
          <p className="text-verity-600">
            Visualize e gerencie todas as CPRs analisadas e criadas.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <CPRHistoryFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
  )
}
