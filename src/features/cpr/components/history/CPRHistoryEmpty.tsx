'use client'

import { motion } from 'framer-motion'
import { FileText, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// =============================================================================
// Types
// =============================================================================

export interface CPRHistoryEmptyProps {
  hasFilters?: boolean
  onClearFilters?: () => void
}

// =============================================================================
// Component
// =============================================================================

export function CPRHistoryEmpty({
  hasFilters = false,
  onClearFilters
}: CPRHistoryEmptyProps) {
  if (hasFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center px-4 py-16 text-center"
      >
        <div className="mb-4 rounded-full bg-verity-100 p-4">
          <Search className="h-8 w-8 text-verity-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-verity-900">
          Nenhum resultado encontrado
        </h3>
        <p className="mb-6 max-w-md text-verity-600">
          Não encontramos CPRs que correspondam aos filtros selecionados. Tente
          ajustar os filtros ou limpar a busca.
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Limpar filtros
          </Button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      <div className="mb-4 rounded-full bg-verity-100 p-4">
        <FileText className="h-8 w-8 text-verity-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-verity-900">
        Nenhuma CPR no histórico
      </h3>
      <p className="mb-6 max-w-md text-verity-600">
        Você ainda não analisou ou criou nenhuma CPR. Comece agora para ver seu
        histórico aqui.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/cpr/analise">
            <Search className="mr-2 h-4 w-4" />
            Analisar CPR
          </Link>
        </Button>
        <Button asChild>
          <Link href="/cpr/wizard">
            <Plus className="mr-2 h-4 w-4" />
            Criar CPR
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}

export default CPRHistoryEmpty
