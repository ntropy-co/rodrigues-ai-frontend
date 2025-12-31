'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  useAdminUsers,
  type UserSummary,
  type UserRole,
  type UserStatus
} from '@/hooks/useAdminUsers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserCog,
  Shield,
  UserX,
  UserCheck
} from 'lucide-react'

const ITEMS_PER_PAGE = 10

// Role display configuration
const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Visualizador'
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  member: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
}

// Status display configuration
const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente'
}

const STATUS_COLORS: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
}

// User row skeleton loader
function UserRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-40" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-32" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-20" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-16" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-8 w-8" />
      </td>
    </tr>
  )
}

export default function AdminUsersPage() {
  const {
    listUsers,
    updateUserRole,
    updateUserStatus,
    deactivateUser,
    loading,
    error: hookError
  } = useAdminUsers()

  // State
  const [users, setUsers] = useState<UserSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => Promise<void>
    destructive?: boolean
  }>({
    open: false,
    title: '',
    description: '',
    action: async () => {}
  })

  // Fetch users
  const fetchUsers = useCallback(async () => {
    const skip = (page - 1) * ITEMS_PER_PAGE
    const result = await listUsers({
      skip,
      limit: ITEMS_PER_PAGE,
      search: search || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    })

    if (result) {
      setUsers(result.users)
      setTotal(result.total)
    }
  }, [listUsers, page, search, roleFilter, statusFilter])

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1) // Reset to first page on search
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchUsers()
    setIsRefreshing(false)
    toast.success('Lista atualizada')
  }

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    setConfirmDialog({
      open: true,
      title: 'Alterar função do usuário',
      description: `Tem certeza que deseja alterar a função de ${user.full_name || user.email} para ${ROLE_LABELS[newRole]}?`,
      action: async () => {
        const result = await updateUserRole(userId, newRole)
        if (result) {
          toast.success('Função atualizada com sucesso')
          fetchUsers()
        } else {
          toast.error('Erro ao atualizar função')
        }
      }
    })
  }

  // Handle status toggle
  const handleStatusToggle = async (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const newStatus = user.status === 'active' ? 'inactive' : 'active'

    setConfirmDialog({
      open: true,
      title: newStatus === 'active' ? 'Ativar usuário' : 'Desativar usuário',
      description: `Tem certeza que deseja ${newStatus === 'active' ? 'ativar' : 'desativar'} ${user.full_name || user.email}?`,
      destructive: newStatus === 'inactive',
      action: async () => {
        const result = await updateUserStatus(userId, newStatus)
        if (result) {
          toast.success(
            `Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`
          )
          fetchUsers()
        } else {
          toast.error('Erro ao atualizar status')
        }
      }
    })
  }

  // Handle deactivate
  const handleDeactivate = async (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    setConfirmDialog({
      open: true,
      title: 'Desativar usuário',
      description: `Tem certeza que deseja desativar ${user.full_name || user.email}? O usuário não poderá mais acessar o sistema.`,
      destructive: true,
      action: async () => {
        const success = await deactivateUser(userId)
        if (success) {
          toast.success('Usuário desativado com sucesso')
          fetchUsers()
        } else {
          toast.error('Erro ao desativar usuário')
        }
      }
    })
  }

  // Pagination
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciar Usuários
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {total} usuário{total !== 1 ? 's' : ''} encontrado
            {total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v as UserRole | 'all')
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as funções</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="member">Membro</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as UserStatus | 'all')
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {hookError && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{hookError}</p>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Função
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Criado em
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <>
                    <UserRowSkeleton />
                    <UserRowSkeleton />
                    <UserRowSkeleton />
                    <UserRowSkeleton />
                    <UserRowSkeleton />
                  </>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Nenhum usuário encontrado
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.full_name || '-'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge className={ROLE_COLORS[user.role]}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge className={STATUS_COLORS[user.status]}>
                          {STATUS_LABELS[user.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {/* Role Change */}
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.id, 'admin')}
                              disabled={user.role === 'admin'}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Tornar Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.id, 'member')}
                              disabled={user.role === 'member'}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Tornar Membro
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.id, 'viewer')}
                              disabled={user.role === 'viewer'}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Tornar Visualizador
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Status Toggle */}
                            {user.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => handleDeactivate(user.id)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Desativar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusToggle(user.id)}
                                className="text-green-600 dark:text-green-400"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Ativar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Página {page} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!canGoPrev || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!canGoNext || loading}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await confirmDialog.action()
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }}
              className={
                confirmDialog.destructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : undefined
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
