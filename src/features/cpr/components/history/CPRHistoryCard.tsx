'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  Search,
  Plus,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  Download,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type {
  CPRHistoryItem,
  CPRHistoryType,
  CPRHistoryStatus
} from '@/features/cpr'

// =============================================================================
// Types
// =============================================================================

export interface CPRHistoryCardProps {
  item: CPRHistoryItem
  onView?: (item: CPRHistoryItem) => void
  onDownload?: (item: CPRHistoryItem) => void
  onDelete?: (item: CPRHistoryItem) => void
}

// =============================================================================
// Constants
// =============================================================================

const TYPE_CONFIG: Record<
  CPRHistoryType,
  { label: string; icon: typeof FileText; color: string }
> = {
  analise: {
    label: 'Análise',
    icon: Search,
    color: 'text-verity-600 bg-verity-50'
  },
  criar: {
    label: 'Criação',
    icon: Plus,
    color: 'text-verity-600 bg-verity-50'
  },
  simulacao: {
    label: 'Simulação',
    icon: TrendingUp,
    color: 'text-purple-600 bg-purple-50'
  }
}

const STATUS_CONFIG: Record<
  CPRHistoryStatus,
  { label: string; icon: typeof CheckCircle2; color: string }
> = {
  completed: {
    label: 'Concluído',
    icon: CheckCircle2,
    color: 'text-verity-600'
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'text-ouro-600'
  },
  failed: {
    label: 'Falhou',
    icon: XCircle,
    color: 'text-error-600'
  }
}

// =============================================================================
// Component
// =============================================================================

export function CPRHistoryCard({
  item,
  onView,
  onDownload,
  onDelete
}: CPRHistoryCardProps) {
  const typeConfig = TYPE_CONFIG[item.type]
  const statusConfig = STATUS_CONFIG[item.status]
  const TypeIcon = typeConfig.icon
  const StatusIcon = statusConfig.icon

  // Format date
  const createdDate = new Date(item.created_at)
  const formattedDate = createdDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
  const formattedTime = createdDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return null
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <Card className="group border-sand-200 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:border-verity-300 hover:bg-white hover:shadow-md dark:bg-verity-900/60 dark:hover:bg-verity-900">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Type icon and content */}
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {/* Type badge */}
              <div
                className={cn(
                  'shrink-0 rounded-xl border border-sand-300 bg-white p-2.5 shadow-sm dark:border-verity-700 dark:bg-verity-800',
                  typeConfig.color.replace('bg-', 'text-') // Keep text color but force white bg
                )}
              >
                <TypeIcon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="truncate font-medium text-verity-900">
                    {item.title}
                  </h3>
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs',
                      statusConfig.color
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-verity-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedDate} às {formattedTime}
                  </span>

                  {item.metadata.commodity && (
                    <span className="capitalize">
                      {item.metadata.commodity}
                    </span>
                  )}

                  {item.metadata.total_value && (
                    <span className="font-medium text-ouro-600">
                      {formatCurrency(item.metadata.total_value)}
                    </span>
                  )}

                  {item.metadata.risk_score !== undefined && (
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-medium',
                        item.metadata.risk_score < 40
                          ? 'bg-verity-100 text-verity-700'
                          : item.metadata.risk_score < 70
                            ? 'bg-ouro-100 text-ouro-700'
                            : 'bg-error-100 text-error-700'
                      )}
                    >
                      Risco: {item.metadata.risk_score}
                    </span>
                  )}

                  {item.metadata.compliance_grade && (
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-medium',
                        item.metadata.compliance_grade === 'A'
                          ? 'bg-verity-100 text-verity-700'
                          : item.metadata.compliance_grade === 'B'
                            ? 'bg-verity-100 text-verity-700'
                            : item.metadata.compliance_grade === 'C'
                              ? 'bg-ouro-100 text-ouro-700'
                              : 'bg-error-100 text-error-700'
                      )}
                    >
                      Nota: {item.metadata.compliance_grade}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(item)}
                  className="h-8 px-2"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(item)}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver detalhes
                    </DropdownMenuItem>
                  )}
                  {item.document_url && onDownload && (
                    <DropdownMenuItem onClick={() => onDownload(item)}>
                      <Download className="mr-2 h-4 w-4" />
                      Baixar documento
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(item)}
                        className="text-error-600 focus:text-error-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CPRHistoryCard
