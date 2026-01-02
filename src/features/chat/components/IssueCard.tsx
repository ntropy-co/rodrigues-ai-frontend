'use client'

import { AlertTriangle, AlertCircle, Info, Wrench } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type IssueSeverity = 'high' | 'medium' | 'low'

export interface AnalysisIssue {
  id: string
  severity: IssueSeverity
  title: string
  description: string
  location: string
  suggestion?: string
}

interface IssueCardProps {
  issue: AnalysisIssue
  isSelected?: boolean
  onSelect?: () => void
  onFix?: () => void
}

const severityConfig = {
  high: {
    icon: AlertTriangle,
    label: 'Alta',
    bgColor: 'bg-error-50',
    borderColor: 'border-error-200',
    iconColor: 'text-error-500',
    badgeBg: 'bg-error-100',
    badgeText: 'text-error-700'
  },
  medium: {
    icon: AlertCircle,
    label: 'Média',
    bgColor: 'bg-ouro-50',
    borderColor: 'border-ouro-200',
    iconColor: 'text-ouro-500',
    badgeBg: 'bg-ouro-100',
    badgeText: 'text-ouro-700'
  },
  low: {
    icon: Info,
    label: 'Baixa',
    bgColor: 'bg-verity-50',
    borderColor: 'border-verity-200',
    iconColor: 'text-verity-500',
    badgeBg: 'bg-verity-100',
    badgeText: 'text-verity-700'
  }
}

export function IssueCard({
  issue,
  isSelected,
  onSelect,
  onFix
}: IssueCardProps) {
  const config = severityConfig[issue.severity]
  const Icon = config.icon

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={cn(
        'cursor-pointer rounded-lg border-2 p-4 transition-all',
        config.bgColor,
        config.borderColor,
        isSelected && 'ring-2 ring-verity-500 ring-offset-2'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5 rounded-full p-1.5', config.badgeBg)}>
            <Icon className={cn('h-4 w-4', config.iconColor)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-verity-900">{issue.title}</h3>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  config.badgeBg,
                  config.badgeText
                )}
              >
                {config.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-verity-700">{issue.description}</p>
            <p className="mt-2 text-xs text-verity-500">{issue.location}</p>

            {issue.suggestion && (
              <div className="mt-3 rounded-md bg-white/60 p-2 text-sm text-verity-700">
                <span className="font-medium">Sugestão: </span>
                {issue.suggestion}
              </div>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onFix?.()
          }}
          className="shrink-0 border-verity-300 text-verity-700 hover:bg-verity-100"
        >
          <Wrench className="mr-1 h-3 w-3" />
          Corrigir
        </Button>
      </div>
    </motion.div>
  )
}
