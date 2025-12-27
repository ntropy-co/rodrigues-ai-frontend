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
} from '@/types/analysis'
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
    return 'text-red-600'
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
              <div className="h-3 w-32 overflow-hidden rounded-full bg-gray-100">
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
          <h3 className="flex items-center gap-2 text-lg font-semibold text-red-700">
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
          <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-600">
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
          ? 'border-red-100 border-l-red-500 bg-red-50/30'
          : 'border-ouro-100 bg-ouro-50/30 border-l-ouro-500'
      )}
    >
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between">
          <span className="text-sm font-semibold uppercase tracking-wide opacity-70">
            {issue.field}
          </span>
          {issue.location && (
            <span className="rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-500">
              {issue.location}
            </span>
          )}
        </div>
        <p
          className={cn(
            'font-medium',
            isCritical ? 'text-red-900' : 'text-ouro-900'
          )}
        >
          {issue.message}
        </p>
        {issue.suggestion && (
          <div className="flex items-start gap-2 rounded bg-white/50 p-2 text-sm text-gray-600">
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
    <Card className="border-blue-100 bg-blue-50/20 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 font-medium text-blue-700">
          <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-xs uppercase tracking-wider">
            {suggestion.field}
          </span>
        </div>
        <p className="font-medium text-gray-800">{suggestion.message}</p>

        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          {suggestion.current && (
            <div className="rounded border border-red-100 bg-red-50/50 p-2">
              <span className="mb-1 block text-xs text-red-600">Atual:</span>
              <span className="text-gray-600 line-through decoration-red-300">
                {suggestion.current}
              </span>
            </div>
          )}
          {suggestion.suggested && (
            <div className="rounded border border-green-100 bg-green-50/50 p-2">
              <span className="mb-1 block text-xs text-green-600">
                Sugerido:
              </span>
              <span className="text-gray-800">{suggestion.suggested}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
