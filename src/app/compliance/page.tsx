'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCompliance } from '@/features/compliance'
import { InternalHeader } from '@/components/layout/InternalHeader'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Grade color mapping - Using Verity brand colors
const GRADE_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  A: {
    bg: 'bg-verity-100',
    text: 'text-verity-800',
    border: 'border-verity-300'
  },
  B: {
    bg: 'bg-verity-100',
    text: 'text-verity-700',
    border: 'border-verity-200'
  },
  C: { bg: 'bg-sand-200', text: 'text-verity-600', border: 'border-sand-300' },
  D: { bg: 'bg-sand-300', text: 'text-verity-700', border: 'border-sand-400' },
  F: { bg: 'bg-error-100', text: 'text-error-700', border: 'border-error-200' }
}

export default function CompliancePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { dashboard, isLoading, error, getDashboard } = useCompliance()

  useEffect(() => {
    if (isAuthenticated) {
      getDashboard()
    }
  }, [isAuthenticated, getDashboard])

  // Auth guard
  if (!authLoading && !isAuthenticated) {
    router.push('/login')
    return null
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-sand-100 dark:bg-verity-950">
      <InternalHeader
        title="Compliance"
        subtitle="Verificação de conformidade com Lei 8.929/94"
        backHref="/chat"
        containerClassName="max-w-5xl"
      />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Loading State */}
        {(authLoading || isLoading) && !dashboard && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-verity-600" />
            <p className="mt-4 text-sm text-verity-500">
              Carregando dashboard...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-error-200 bg-error-50 p-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-error-500" />
            <p className="mt-2 text-sm font-medium text-error-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => getDashboard()}
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Dashboard Content */}
        {dashboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-verity-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-verity-100">
                    <FileCheck className="h-5 w-5 text-verity-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-verity-900">
                      {dashboard.total_verified}
                    </p>
                    <p className="text-xs text-verity-500">
                      Documentos verificados
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-verity-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-verity-100">
                    <TrendingUp className="h-5 w-5 text-verity-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-verity-900">
                      {dashboard.compliance_rate.toFixed(0)}%
                    </p>
                    <p className="text-xs text-verity-500">
                      Taxa de conformidade
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-verity-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-verity-100">
                    <ShieldCheck className="h-5 w-5 text-verity-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-verity-900">
                      Lei 8.929/94
                    </p>
                    <p className="text-xs text-verity-500">Base regulatória</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Verifications */}
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-verity-100">
              <div className="flex items-center justify-between border-b border-verity-100 px-5 py-4">
                <h2 className="font-display text-lg font-semibold text-verity-900">
                  Verificações recentes
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => getDashboard()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar
                </Button>
              </div>

              {dashboard.recent_verifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-verity-100 p-4">
                    <ShieldCheck className="h-8 w-8 text-verity-400" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-verity-700">
                    Nenhuma verificação ainda
                  </p>
                  <p className="mt-1 text-xs text-verity-500">
                    Faça upload de um documento para iniciar
                  </p>
                  <Button
                    className="mt-6"
                    onClick={() => router.push('/cpr/analise')}
                  >
                    Analisar CPR
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-verity-100">
                  {dashboard.recent_verifications.map((verification) => {
                    const gradeColor =
                      GRADE_COLORS[verification.grade] || GRADE_COLORS.C
                    return (
                      <div
                        key={verification.id}
                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-verity-50/50"
                      >
                        {/* Grade Badge */}
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg border font-bold',
                            gradeColor.bg,
                            gradeColor.text,
                            gradeColor.border
                          )}
                        >
                          {verification.grade}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-verity-900">
                            Documento {verification.document_id.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-verity-500">
                            Score: {verification.score}/100
                          </p>
                        </div>

                        {/* Date */}
                        <div className="hidden text-xs text-verity-500 sm:block">
                          {formatDate(verification.verified_at)}
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-4 w-4 text-verity-400" />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="rounded-xl bg-gradient-to-r from-verity-900 to-verity-800 p-6 text-center text-white">
              <h3 className="font-display text-lg font-semibold">
                Precisa verificar conformidade?
              </h3>
              <p className="mt-1 text-sm text-verity-200">
                Analise seus documentos CPR e garanta conformidade regulatória
              </p>
              <Button
                variant="secondary"
                className="mt-4 bg-white text-verity-900 hover:bg-verity-50"
                onClick={() => router.push('/cpr/analise')}
              >
                Iniciar análise de CPR
              </Button>
            </div>
          </motion.div>
        )}

        {/* Empty State - No dashboard loaded yet and no error */}
        {!dashboard && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-verity-100 p-4">
              <ShieldCheck className="h-8 w-8 text-verity-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-verity-700">
              Carregue o dashboard para ver suas verificações
            </p>
            <Button className="mt-6" onClick={() => getDashboard()}>
              Carregar dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
