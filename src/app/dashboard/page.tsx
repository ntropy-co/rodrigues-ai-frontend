'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CPRStats, StatsCard } from '@/features/dashboard'
import { InternalHeader } from '@/components/layout/InternalHeader'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MessageSquare,
  TrendingUp,
  FilePlus2,
  Calculator,
  History,
  FileText,
  ArrowRight,
  Loader2,
  Upload,
  Sparkles
} from 'lucide-react'
import { useDocuments } from '@/features/documents'
import { useCPRHistory } from '@/features/cpr'
import { cn } from '@/lib/utils'
import { TourTrigger, WELCOME_STEPS } from '@/features/tour'

// =============================================================================
// Zero-UI Components (Atmospheric Design)
// =============================================================================

function SectionHeader({
  title,
  icon: Icon
}: {
  title: string
  icon?: React.ElementType
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-verity-400" />}
      <h2 className="font-display text-lg font-semibold tracking-tight text-verity-900">
        {title}
      </h2>
    </div>
  )
}

// =============================================================================
// Quick Action Card (with Editorial variant styles from PR #256)
// =============================================================================

type QuickActionVariant =
  | 'primary'
  | 'money'
  | 'history'
  | 'docs'
  | 'ai'
  | 'simulator'

// Estilo "Editorial": Fundo Suave + Ícone Forte (no blue/purple)
const variantStyles: Record<QuickActionVariant, string> = {
  primary: 'bg-verity-50 text-verity-700',
  money: 'bg-ouro-50 text-ouro-600',
  history: 'bg-sand-100 text-verity-600',
  docs: 'bg-sand-100 text-verity-600',
  ai: 'bg-verity-100 text-verity-800',
  simulator: 'bg-ouro-50 text-ouro-700'
}

interface QuickActionProps {
  title: string
  description: string
  href: string
  icon: React.ElementType
  layoutId?: string
  variant?: QuickActionVariant
}

function QuickAction({
  title,
  description,
  href,
  icon: Icon,
  layoutId,
  variant = 'primary'
}: QuickActionProps) {
  return (
    <Link href={href}>
      <motion.div
        layoutId={layoutId}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex h-full flex-col justify-between rounded-xl bg-sand-50 p-4 transition-all hover:bg-white hover:shadow-lg hover:shadow-verity-900/5 dark:bg-verity-900 dark:hover:bg-verity-800"
      >
        <div className="mb-3 flex items-start justify-between">
          <div
            className={cn(
              'rounded-lg p-2 transition-colors',
              variantStyles[variant]
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <ArrowRight className="h-4 w-4 text-verity-300 opacity-0 transition-all group-hover:text-verity-500 group-hover:opacity-100" />
        </div>

        <div>
          <h3 className="font-medium text-verity-900 dark:text-verity-100">
            {title}
          </h3>
          <p className="line-clamp-1 text-xs text-verity-500 group-hover:text-verity-600 dark:text-verity-400">
            {description}
          </p>
        </div>
      </motion.div>
    </Link>
  )
}

// =============================================================================
// Recent Activity (Refactored: Tabular List)
// =============================================================================

function RecentActivity() {
  const { items, isLoading } = useCPRHistory({ pageSize: 5 })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg bg-sand-200" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 rounded-full bg-sand-100 p-3">
          <History className="h-6 w-6 text-verity-300" />
        </div>
        <p className="text-sm font-medium text-verity-600">
          Nenhuma atividade recente
        </p>
        <p className="text-xs text-verity-400">
          Suas operações aparecerão aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="group flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-sand-50 dark:hover:bg-verity-900"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-100 text-verity-600 dark:bg-verity-800 dark:text-verity-300">
              {item.type === 'analise' ? (
                <FileText className="h-4 w-4" />
              ) : item.type === 'criar' ? (
                <FilePlus2 className="h-4 w-4" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-verity-900 dark:text-verity-100">
                {item.title}
              </p>
              <p className="text-xs tabular-nums text-verity-500">
                {new Date(item.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                'hidden rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider sm:inline-block',
                item.status === 'completed' &&
                  'bg-verity-50 text-verity-700 dark:bg-verity-900 dark:text-verity-300',
                item.status === 'pending' &&
                  'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
                item.status === 'failed' &&
                  'bg-error-50 text-error-700 dark:bg-error-950/30 dark:text-error-400'
              )}
            >
              {item.status === 'completed'
                ? 'Finalizado'
                : item.status === 'pending'
                  ? 'Em análise'
                  : 'Erro'}
            </span>
            <ArrowRight className="h-3 w-3 text-verity-300 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// =============================================================================
// Documents Stats (Wrapper)
// =============================================================================

function DocumentsStats() {
  const { documents, loading } = useDocuments()

  return (
    <StatsCard
      title="Documentos"
      value={loading ? '-' : documents.length}
      icon={Upload}
      description="Na fila de processamento"
      loading={loading}
    />
  )
}

// =============================================================================
// Main Dashboard (Bento Grid Layout)
// =============================================================================

const queryClient = new QueryClient()

function DashboardContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  // Redirect logic
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-100">
        <Loader2 className="h-8 w-8 animate-spin text-verity-600" />
      </div>
    )
  }

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="min-h-screen bg-sand-100 pb-20 dark:bg-verity-950">
      <InternalHeader
        title={`${getTimeGreeting()}, ${user?.name?.split(' ')[0] || 'Gestor'}`}
        subtitle="Sua visão de comando para hoje."
        backHref="/chat"
        containerClassName="max-w-7xl"
        actions={<TourTrigger tourId="welcome_v1" steps={WELCOME_STEPS} />}
      />

      <div className="container pointer-events-none mx-auto max-w-7xl px-4 py-8">
        {/* 
            BENTO GRID ARCHITECTURE 
            Using CSS Grid for a modular "Command Center" feed 
            pointer-events-auto added to children to allow interaction while keeping layout rigid
         */}
        <div className="pointer-events-auto grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* COLUMN 1: MAIN STATS (8 Cols) */}
          <div className="space-y-6 md:col-span-8">
            <SectionHeader title="Visão Geral" icon={TrendingUp} />

            <div className="grid gap-4 sm:grid-cols-2">
              <CPRStats className="sm:col-span-2" />
              <DocumentsStats />
            </div>

            {/* Recent Activity Feed */}
            <div className="pt-4">
              <SectionHeader title="Atividade Recente" icon={History} />
              <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm dark:bg-verity-900/50">
                <RecentActivity />
              </div>
            </div>
          </div>

          {/* COLUMN 2: QUICK ACTIONS (4 Cols - Sticky Sidebar feeling) */}
          <div className="md:col-span-4">
            <SectionHeader title="Acesso Rápido" icon={Sparkles} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1 lg:grid-cols-2">
              <QuickAction
                title="Conversar com IA"
                description="Consultoria jurídica"
                href="/chat"
                icon={MessageSquare}
                variant="ai"
              />
              <QuickAction
                title="Nova CPR"
                description="Emissão guiada"
                href="/cpr/wizard"
                icon={FilePlus2}
                variant="primary"
              />
              <QuickAction
                title="Cotações"
                description="Mercado em tempo real"
                href="/quotes"
                icon={TrendingUp}
                variant="money"
              />
              <QuickAction
                title="Simulador"
                description="Calcular custos"
                href="/cpr/simulator"
                icon={Calculator}
                variant="simulator"
              />
              <QuickAction
                title="Meus Documentos"
                description="Gestão de arquivos"
                href="/documents"
                icon={FileText}
                variant="docs"
              />
              <QuickAction
                title="Central de Ajuda"
                description="Tutoriais e suporte"
                href="/help"
                icon={History}
                variant="history"
              />
            </div>

            {/* Contextual Promo Card (Example of Bento flexibility) */}
            <div className="mt-6 rounded-xl bg-gradient-to-br from-verity-800 to-verity-900 p-5 text-white shadow-lg">
              <h3 className="mb-2 font-display text-lg font-medium">
                Precisa de crédito?
              </h3>
              <p className="mb-4 text-sm text-verity-100 opacity-90">
                Nossa IA analisa sua elegibilidade em segundos baseada no seu
                CAR.
              </p>
              <Link
                href="/cpr/wizard"
                className="inline-flex items-center text-sm font-semibold hover:text-ouro-400"
              >
                Verificar agora <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  )
}
