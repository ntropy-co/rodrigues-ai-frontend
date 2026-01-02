'use client'

import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Info,
  Lightbulb
} from 'lucide-react'
import {
  AnalysisResultData,
  AnalysisIssue,
  AnalysisSuggestion
} from '@/features/cpr'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AnalysisResultProps {
  data: AnalysisResultData
  onExportPDF?: () => void
}

export function AnalysisResult({ data, onExportPDF }: AnalysisResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-verity-600'
    if (score >= 70) return 'text-ouro-500' // Using yellow/gold for warning
    return 'text-error-600'
  }

  const criticalIssues = data.issues.filter((i) => i.type === 'critical')
  const alertIssues = data.issues.filter((i) => i.type === 'alert')
  // const suggestionIssues = data.issues.filter((i) => i.type === 'suggestion') // Usually mapped to suggestions array

  return (
    <div className="space-y-6">
      {/* Header / Score Card */}
      <Card className="overflow-hidden border-verity-100 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold text-verity-950">
                Resultado da Análise
              </h2>
              <p className="mt-1 text-verity-700">
                Documento analisado em{' '}
                {new Date(data.processedAt).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium uppercase tracking-wider text-verity-600">
                  Compliance Score
                </span>
                <span
                  className={cn(
                    'font-mono text-4xl font-bold tracking-tight',
                    getScoreColor(data.score)
                  )}
                >
                  {data.score}/100
                </span>
              </div>
              <div className="h-3 w-32 overflow-hidden rounded-full bg-sand-200">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000',
                    getScoreColor(data.score).replace('text-', 'bg-')
                  )}
                  style={{ width: `${data.score}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Critical Issues */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-error-700">
            <XCircle className="h-5 w-5" />
            Erros Críticos ({criticalIssues.length})
          </h3>
          {criticalIssues.length === 0 ? (
            <Card className="border-verity-100 bg-verity-50/50">
              <CardContent className="flex items-center gap-3 p-6 text-verity-700">
                <CheckCircle className="h-5 w-5 text-verity-600" />
                <p>Nenhum erro crítico encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {criticalIssues.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} />
              ))}
            </div>
          )}
        </div>

        {/* Alerts / Improvements */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-ouro-600">
            <AlertTriangle className="h-5 w-5" />
            Alertas ({alertIssues.length})
          </h3>
          {alertIssues.length === 0 ? (
            <Card className="border-verity-100 bg-white">
              <CardContent className="flex items-center gap-3 p-6 text-verity-700">
                <CheckCircle className="h-5 w-5 text-verity-600" />
                <p>Nenhum alerta de atenção.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alertIssues.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {data.suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-verity-600">
            <Lightbulb className="h-5 w-5" />
            Sugestões de Melhoria ({data.suggestions.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {data.suggestions.map((suggestion, idx) => (
              <SuggestionCard key={idx} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-4">
        {onExportPDF && (
          <Button
            onClick={onExportPDF}
            variant="outline"
            className="gap-2 border-verity-200 text-verity-700 hover:bg-verity-50"
          >
            <Download className="h-4 w-4" />
            Baixar Relatório PDF
          </Button>
        )}
      </div>
    </div>
  )
}

function IssueCard({ issue }: { issue: AnalysisIssue }) {
  const isCritical = issue.type === 'critical'
  return (
    <Card
      className={cn(
        'border-l-4 shadow-sm',
        isCritical
          ? 'border-error-100 border-l-error-500 bg-error-50/30'
          : 'border-ouro-100 border-l-ouro-500 bg-ouro-50/30'
      )}
    >
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between">
          <span className="text-sm font-semibold uppercase tracking-wide opacity-70">
            {issue.field}
          </span>
          {issue.location && (
            <span className="text-sand-500 rounded border border-sand-300 bg-white px-2 py-0.5 text-xs">
              {issue.location}
            </span>
          )}
        </div>
        <p
          className={cn(
            'font-medium',
            isCritical ? 'text-error-900' : 'text-ouro-900'
          )}
        >
          {issue.message}
        </p>
        {issue.suggestion && (
          <div className="flex items-start gap-2 rounded bg-white/50 p-2 text-sm text-verity-500">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>Sugestão: {issue.suggestion}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SuggestionCard({ suggestion }: { suggestion: AnalysisSuggestion }) {
  return (
    <Card className="border-verity-100 bg-verity-50/20 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 font-medium text-verity-700">
          <span className="rounded border border-verity-200 bg-verity-50 px-1.5 py-0.5 text-xs uppercase tracking-wider">
            {suggestion.field}
          </span>
        </div>
        <p className="font-medium text-verity-800">{suggestion.message}</p>

        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          {suggestion.current && (
            <div className="rounded border border-error-100 bg-error-50/50 p-2">
              <span className="mb-1 block text-xs text-error-600">Atual:</span>
              <span className="text-verity-500 line-through decoration-error-300">
                {suggestion.current}
              </span>
            </div>
          )}
          {suggestion.suggested && (
            <div className="rounded border border-verity-100 bg-verity-50/50 p-2">
              <span className="mb-1 block text-xs text-verity-600">
                Sugerido:
              </span>
              <span className="text-verity-800">{suggestion.suggested}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
