'use client'

import { useCPRHistory } from '@/features/cpr'
import { StatsCard } from './StatsCard'
import { FileText, FilePlus2, Calculator } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface CPRStatsProps {
  className?: string
}

/**
 * CPRStats - Dashboard stats from real CPR History data
 *
 * Displays aggregated metrics:
 * - Total operations
 * - Completed analyses
 * - CPRs created
 * - Pending items
 */
export function CPRStats({ className }: CPRStatsProps) {
  // Fetch all history to calculate stats
  const { items, total, isLoading } = useCPRHistory({ pageSize: 100 })

  // Calculate real stats from data
  const stats = {
    total,
    completed: items.filter((i) => i.status === 'completed').length,
    pending: items.filter((i) => i.status === 'pending').length,
    analyses: items.filter((i) => i.type === 'analise').length,
    created: items.filter((i) => i.type === 'criar').length,
    simulations: items.filter((i) => i.type === 'simulacao').length
  }

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
        <Skeleton className="h-24 rounded-xl bg-sand-200" />
        <Skeleton className="h-24 rounded-xl bg-sand-200" />
        <Skeleton className="h-24 rounded-xl bg-sand-200" />
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
      <StatsCard
        title="Análises"
        value={stats.analyses}
        icon={FileText}
        description={`${stats.completed} finalizadas`}
      />
      <StatsCard
        title="CPRs Criadas"
        value={stats.created}
        icon={FilePlus2}
        description="Documentos emitidos"
      />
      <StatsCard
        title="Simulações"
        value={stats.simulations}
        icon={Calculator}
        description={`${stats.pending} em andamento`}
      />
    </div>
  )
}
