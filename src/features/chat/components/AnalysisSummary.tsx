'use client'

import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'

interface AnalysisSummaryProps {
  totalIssues: number
  highCount: number
  mediumCount: number
  lowCount: number
}

export function AnalysisSummary({
  totalIssues,
  highCount,
  mediumCount,
  lowCount
}: AnalysisSummaryProps) {
  return (
    <div className="border-b border-verity-200 bg-verity-50/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-verity-900">
            Resumo da Análise
          </h2>
          <p className="text-sm text-verity-600">
            {totalIssues === 0
              ? 'Nenhum problema encontrado!'
              : `${totalIssues} problema${totalIssues > 1 ? 's' : ''} encontrado${totalIssues > 1 ? 's' : ''}`}
          </p>
        </div>

        {totalIssues === 0 ? (
          <div className="flex items-center gap-2 rounded-full bg-verity-100 px-3 py-1.5 text-verity-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Documento OK</span>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {highCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-error-100">
                  <AlertTriangle className="h-3.5 w-3.5 text-error-500" />
                </div>
                <span className="text-sm font-medium text-error-700">
                  {highCount}
                </span>
              </div>
            )}
            {mediumCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ouro-100">
                  <AlertCircle className="h-3.5 w-3.5 text-ouro-500" />
                </div>
                <span className="text-sm font-medium text-ouro-700">
                  {mediumCount}
                </span>
              </div>
            )}
            {lowCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-verity-100">
                  <Info className="h-3.5 w-3.5 text-verity-500" />
                </div>
                <span className="text-sm font-medium text-verity-700">
                  {lowCount}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
