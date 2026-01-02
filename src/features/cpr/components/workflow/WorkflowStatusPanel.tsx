'use client'

/**
 * WorkflowStatusPanel Component
 *
 * Comprehensive status panel showing workflow progress, current step,
 * and real-time updates. Integrates StatusBadge and ProgressBar.
 *
 * Usage:
 * ```tsx
 * <WorkflowStatusPanel
 *   sessionId="abc123"
 *   workflowType="analise_cpr"
 *   pollingInterval={2000}
 * />
 * ```
 */

import { motion } from 'framer-motion'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useCPRWorkflowStatus, type WorkflowType } from '@/features/cpr'
import { WorkflowStatusBadge } from './WorkflowStatusBadge'
import { WorkflowProgressBar } from './WorkflowProgressBar'

// =============================================================================
// Types
// =============================================================================

export interface WorkflowStatusPanelProps {
  /** Session ID for the workflow */
  sessionId: string | null
  /** Type of workflow */
  workflowType: WorkflowType
  /** Polling interval in milliseconds */
  pollingInterval?: number
  /** Auto-start polling */
  autoStart?: boolean
  /** Show progress bar */
  showProgress?: boolean
  /** Show refresh button */
  showRefreshButton?: boolean
  /** Callback on completion */
  onComplete?: () => void
  /** Additional class names */
  className?: string
}

// =============================================================================
// Component
// =============================================================================

export function WorkflowStatusPanel({
  sessionId,
  workflowType,
  pollingInterval = 2000,
  autoStart = true,
  showProgress = true,
  showRefreshButton = true,
  onComplete,
  className
}: WorkflowStatusPanelProps) {
  const { status, isPolling, error, refresh } = useCPRWorkflowStatus({
    sessionId,
    workflowType,
    pollingInterval,
    autoStart,
    onComplete
  })

  if (!sessionId) {
    return null
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          {workflowType === 'analise_cpr' ? 'Análise de CPR' : 'Criação de CPR'}
        </CardTitle>
        <div className="flex items-center gap-2">
          {status && (
            <WorkflowStatusBadge
              state={status.state}
              currentStep={status.currentStep}
              size="sm"
            />
          )}
          {showRefreshButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refresh()}
              disabled={isPolling}
            >
              <RefreshCw
                className={cn('h-4 w-4', isPolling && 'animate-spin')}
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-800"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erro ao buscar status</p>
              <p className="text-xs">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Progress bar */}
        {showProgress && status && (
          <WorkflowProgressBar
            workflowType={workflowType}
            currentStep={status.currentStep}
            showLabels
          />
        )}

        {/* Status message */}
        {status?.text && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-sand-300 bg-sand-50 p-4"
          >
            <p className="text-sm text-verity-600">{status.text}</p>
            <p className="text-sand-500 mt-2 text-xs">
              Última atualização:{' '}
              {status.lastUpdated.toLocaleTimeString('pt-BR')}
            </p>
          </motion.div>
        )}

        {/* Additional data for analise workflow */}
        {workflowType === 'analise_cpr' && status?.extractedData && (
          <div className="rounded-lg border border-sand-300 p-4">
            <h4 className="mb-2 text-sm font-medium text-verity-900">
              Dados Extraídos
            </h4>
            <div className="space-y-1 text-sm text-verity-500">
              {Object.entries(status.extractedData).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document URL for criar workflow */}
        {workflowType === 'criar_cpr' && status?.documentoUrl && (
          <div className="rounded-lg border border-verity-200 bg-verity-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-verity-900">
              Documento Gerado
            </h4>
            <a
              href={status.documentoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-verity-700 underline hover:text-verity-800"
            >
              Baixar CPR
            </a>
          </div>
        )}

        {/* Polling indicator */}
        {isPolling && (
          <div className="text-sand-500 flex items-center justify-center gap-2 text-xs">
            <div className="h-2 w-2 animate-pulse rounded-full bg-verity-500" />
            <span>Atualizando a cada {pollingInterval / 1000}s</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WorkflowStatusPanel
