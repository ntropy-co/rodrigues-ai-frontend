'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdminUsers } from '@/features/organization'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, UserCheck, UserX, Clock } from 'lucide-react'

interface StatsData {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  pendingUsers: number
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading
}: {
  title: string
  value: number | string
  icon: React.ElementType
  description?: string
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-verity-500 dark:text-verity-300">
          {title}
        </CardTitle>
        <Icon className="text-sand-500 h-4 w-4" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold tabular-nums text-verity-900 dark:text-white">
            {value}
          </div>
        )}
        {description && (
          <p className="text-sand-500 text-xs tabular-nums dark:text-verity-300">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const { listUsers, loading } = useAdminUsers()
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    pendingUsers: 0
  })
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setFetchError(null)

      // Fetch all users to calculate stats
      const result = await listUsers({ limit: 1000 })

      if (result) {
        const users = result.users
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.status === 'active').length,
          inactiveUsers: users.filter((u) => u.status === 'inactive').length,
          pendingUsers: users.filter((u) => u.status === 'pending').length
        })
      } else {
        setFetchError('Não foi possível carregar estatísticas')
      }
    }

    fetchStats()
  }, [listUsers])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-verity-900 dark:text-white">
          Dashboard Administrativo
        </h1>
        <p className="text-sand-500 mt-1 text-sm dark:text-verity-300">
          Visão geral do sistema e usuários
        </p>
      </div>

      {/* Error Message */}
      {fetchError && (
        <div className="rounded-md bg-error-50 p-4 dark:bg-error-900/20">
          <p className="text-sm text-error-600 dark:text-error-400">
            {fetchError}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Usuários Ativos"
          value={stats.activeUsers}
          icon={UserCheck}
          description={`${((stats.activeUsers / stats.totalUsers) * 100 || 0).toFixed(0)}% do total`}
          loading={loading}
        />
        <StatCard
          title="Usuários Inativos"
          value={stats.inactiveUsers}
          icon={UserX}
          loading={loading}
        />
        <StatCard
          title="Pendentes"
          value={stats.pendingUsers}
          icon={Clock}
          description="Aguardando ativação"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-lg border border-sand-300 p-3 transition-colors hover:bg-sand-50 dark:border-verity-600 dark:hover:bg-verity-800"
            >
              <Users className="h-5 w-5 text-verity-600" />
              <div>
                <div className="font-medium text-verity-900 dark:text-white">
                  Gerenciar Usuários
                </div>
                <div className="text-sand-500 text-sm">
                  Visualize, edite e gerencie usuários
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documentação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-verity-500 dark:text-verity-300">
              Esta é a área administrativa do sistema. Aqui você pode:
            </p>
            <ul className="ml-4 list-disc text-sm text-verity-500 dark:text-verity-300">
              <li>Gerenciar usuários e permissões</li>
              <li>Visualizar estatísticas de uso</li>
              <li>Configurar a organização</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
