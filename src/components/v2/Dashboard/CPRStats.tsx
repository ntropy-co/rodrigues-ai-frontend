'use client'

import { useQuery } from '@tanstack/react-query'
import { FileText, DollarSign } from 'lucide-react'
import { StatsCard } from './StatsCard'
import { cn } from '@/lib/utils'

interface MetricsData {
  totalValue: number // em reais
  totalCount: number
}

interface CPRStatsProps {
  className?: string
}

export function CPRStats({ className }: CPRStatsProps) {
  const { data, isLoading } = useQuery<{ success: boolean; data: MetricsData }>(
    {
      queryKey: ['metrics', 'cpr'],
      queryFn: async () => {
        const response = await fetch('/api/metrics/cpr')
        if (!response.ok) {
          throw new Error('Failed to fetch metrics')
        }
        return response.json()
      },
      refetchInterval: 30000, // Refresh a cada 30s
      staleTime: 10000
    }
  )

  const metrics = data?.data

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      <StatsCard
        title="Valor Total Processado"
        value={metrics ? formatCurrency(metrics.totalValue) : 'R$ 0,00'}
        icon={DollarSign}
        description="Em CPRs analisadas"
        loading={isLoading}
      />
      <StatsCard
        title="CPRs Analisadas"
        value={metrics ? metrics.totalCount : 0}
        icon={FileText}
        description="Documentos processados"
        loading={isLoading}
      />
    </div>
  )
}
