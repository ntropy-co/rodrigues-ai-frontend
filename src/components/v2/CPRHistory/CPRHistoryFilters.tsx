'use client'

import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { CPRHistoryFilters as FilterType } from '@/hooks/useCPRHistory'

// =============================================================================
// Types
// =============================================================================

export interface CPRHistoryFiltersProps {
  filters: FilterType
  onFiltersChange: (filters: FilterType) => void
}

// =============================================================================
// Component
// =============================================================================

export function CPRHistoryFilters({
  filters,
  onFiltersChange
}: CPRHistoryFiltersProps) {
  const hasActiveFilters =
    (filters.type && filters.type !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    filters.commodity

  const clearFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Type filter */}
      <Select
        value={filters.type || 'all'}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, type: value as FilterType['type'] })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="analise">Análise</SelectItem>
          <SelectItem value="criar">Criação</SelectItem>
          <SelectItem value="simulacao">Simulação</SelectItem>
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={filters.status || 'all'}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, status: value as FilterType['status'] })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="failed">Falhou</SelectItem>
        </SelectContent>
      </Select>

      {/* Commodity filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-verity-500" />
        <Input
          placeholder="Commodity..."
          value={filters.commodity || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, commodity: e.target.value || undefined })
          }
          className="pl-9 w-[160px]"
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-verity-600 hover:text-verity-800"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}

export default CPRHistoryFilters
