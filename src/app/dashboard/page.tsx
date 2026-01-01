'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CPRStats } from '@/components/v2/Dashboard/CPRStats'
import { StatsCard } from '@/components/v2/Dashboard/StatsCard'
import { InternalHeader } from '@/components/v2/Header/InternalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Upload
} from 'lucide-react'
import { useDocuments } from '@/hooks/useDocuments'
import { useCPRHistory } from '@/hooks/useCPRHistory'

// =============================================================================
// Quick Action Card
// =============================================================================

interface QuickActionProps {
  title: string
  description: string
  href: string
  icon: React.ElementType
  color: string
}

function QuickAction({ title, description, href, icon: Icon, color }: QuickActionProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-4 rounded-xl border border-verity-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
      >
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-verity-900">{title}</h3>
          <p className="text-sm text-verity-600">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-verity-400" />
      </motion.div>
    </Link>
  )
}

// =============================================================================
// Recent Activity
// =============================================================================

function RecentActivity() {
  const { items, isLoading } = useCPRHistory({ pageSize: 5 })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <History className="h-10 w-10 text-verity-300" />
        <p className="mt-2 text-sm text-verity-600">Nenhuma atividade recente</p>
        <p className="text-xs text-verity-500">
          Suas análises e CPRs aparecerão aqui
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-lg border border-verity-100 bg-verity-50/50 p-3"
        >
          <div className="rounded-full bg-verity-100 p-2">
            {item.type === 'analise' ? (
              <FileText className="h-4 w-4 text-verity-600" />
            ) : item.type === 'criar' ? (
              <FilePlus2 className="h-4 w-4 text-verity-600" />
            ) : (
              <Calculator className="h-4 w-4 text-verity-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-verity-900">
              {item.title}
            </p>
            <p className="text-xs text-verity-500">
              {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              item.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : item.status === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {item.status === 'completed'
              ? 'Concluído'
              : item.status === 'pending'
                ? 'Pendente'
                : 'Falhou'}
          </span>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// Documents Stats
// =============================================================================

function DocumentsStats() {
  const { documents, loading } = useDocuments()

  return (
    <StatsCard
      title="Documentos Enviados"
      value={loading ? '-' : documents.length}
      icon={Upload}
      description="Arquivos para análise"
      loading={loading}
    />
  )
}

// =============================================================================
// Main Dashboard
// =============================================================================

const queryClient = new QueryClient()

function DashboardContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-verity-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-verity-50/50 to-white">
      <InternalHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'Usuário'}!`}
        subtitle="Aqui está um resumo das suas atividades."
        backHref="/chat"
        containerClassName="max-w-6xl"
      />

      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* Stats Grid */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-verity-900">
            Visão Geral
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CPRStats className="sm:col-span-2" />
            <DocumentsStats />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-verity-900">
            Ações Rápidas
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              title="Conversar com IA"
              description="Análise de documentos"
              href="/chat"
              icon={MessageSquare}
              color="bg-verity-600"
            />
            <QuickAction
              title="Cotações"
              description="Preços de commodities"
              href="/quotes"
              icon={TrendingUp}
              color="bg-blue-600"
            />
            <QuickAction
              title="Nova CPR"
              description="Criar nova cédula"
              href="/cpr/wizard"
              icon={FilePlus2}
              color="bg-green-600"
            />
            <QuickAction
              title="Simulador CPR"
              description="Calcular custos"
              href="/cpr/simulator"
              icon={Calculator}
              color="bg-amber-600"
            />
            <QuickAction
              title="Histórico"
              description="CPRs anteriores"
              href="/cpr/historico"
              icon={History}
              color="bg-purple-600"
            />
            <QuickAction
              title="Meus Documentos"
              description="Arquivos enviados"
              href="/documents"
              icon={FileText}
              color="bg-gray-600"
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </section>
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
