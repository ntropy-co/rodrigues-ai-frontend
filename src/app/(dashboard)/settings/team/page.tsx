'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Users,
  Search,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  Eye,
  Loader2,
  UserX,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useAdminUsers,
  type UserSummary,
  type UserRole
} from '@/features/organization'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/features/chat'
import { toast } from 'sonner'

// Role display configuration
const roleConfig: Record<
  UserRole,
  { label: string; icon: React.ReactNode; color: string }
> = {
  admin: {
    label: 'Administrador',
    icon: <ShieldAlert className="h-4 w-4" />,
    color: 'text-error-600 bg-error-50'
  },
  member: {
    label: 'Membro',
    icon: <Shield className="h-4 w-4" />,
    color: 'text-verity-600 bg-verity-50'
  },
  viewer: {
    label: 'Visualizador',
    icon: <Eye className="h-4 w-4" />,
    color: 'text-verity-500 bg-sand-200'
  }
}

export default function TeamMembersPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    isLoading: authLoading,
    user: currentUser
  } = useAuth()
  const {
    listUsers,
    updateUserRole,
    updateUserStatus,
    deactivateUser,
    loading,
    error
  } = useAdminUsers()

  const [users, setUsers] = useState<UserSummary[]>([])
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [initialLoading, setInitialLoading] = useState(true)

  // Dialog states
  const [deactivateDialog, setDeactivateDialog] = useState<{
    open: boolean
    user: UserSummary | null
  }>({ open: false, user: null })
  const [roleDialog, setRoleDialog] = useState<{
    open: boolean
    user: UserSummary | null
    newRole: UserRole | null
  }>({ open: false, user: null, newRole: null })

  // Fetch users
  const fetchUsers = useCallback(async () => {
    const result = await listUsers({
      search: searchQuery || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status:
        statusFilter !== 'all'
          ? (statusFilter as 'active' | 'inactive' | 'pending')
          : undefined,
      limit: 50
    })

    if (result) {
      setUsers(result.users)
      setTotal(result.total)
    }
    setInitialLoading(false)
  }, [listUsers, searchQuery, roleFilter, statusFilter])

  // Guard - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch users on mount and when filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers()
    }
  }, [isAuthenticated, fetchUsers])

  // Handle role change
  const handleRoleChange = async () => {
    if (!roleDialog.user || !roleDialog.newRole) return

    const result = await updateUserRole(roleDialog.user.id, roleDialog.newRole)
    if (result) {
      toast.success(
        `Permissão de ${roleDialog.user.full_name || roleDialog.user.email} atualizada`
      )
      fetchUsers()
    } else {
      toast.error('Erro ao atualizar permissão')
    }
    setRoleDialog({ open: false, user: null, newRole: null })
  }

  // Handle deactivation
  const handleDeactivate = async () => {
    if (!deactivateDialog.user) return

    const success = await deactivateUser(deactivateDialog.user.id)
    if (success) {
      toast.success(
        `${deactivateDialog.user.full_name || deactivateDialog.user.email} foi desativado`
      )
      fetchUsers()
    } else {
      toast.error('Erro ao desativar usuário')
    }
    setDeactivateDialog({ open: false, user: null })
  }

  // Handle status toggle
  const handleStatusToggle = async (user: UserSummary) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    const result = await updateUserStatus(user.id, newStatus)
    if (result) {
      toast.success(
        newStatus === 'active'
          ? `${user.full_name || user.email} foi reativado`
          : `${user.full_name || user.email} foi desativado`
      )
      fetchUsers()
    } else {
      toast.error('Erro ao atualizar status')
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Loading state
  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-sand-50/50 dark:bg-verity-950/50">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <Skeleton className="mb-8 h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-sand-50/50 dark:bg-verity-950/50">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-4 text-muted-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchUsers}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50/50 dark:bg-verity-950/50">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 text-muted-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Equipe
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie os membros da sua organização.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/settings/invites')}
            >
              Convidar Membro
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}
          >
            <SelectTrigger className="w-full bg-background sm:w-[160px]">
              <SelectValue placeholder="Permissão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="member">Membro</SelectItem>
              <SelectItem value="viewer">Visualizador</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full bg-background sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Membros</CardTitle>
            </div>
            <CardDescription className="tabular-nums">
              {total} {total === 1 ? 'membro' : 'membros'} encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Users className="mb-4 h-12 w-12 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">
                  Nenhum membro encontrado
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm">
                  {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Convide membros para sua organização.'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {users.map((user) => {
                  const role = roleConfig[user.role]
                  const isCurrentUser = currentUser?.id === user.id

                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <Avatar email={user.email} size="md" />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-foreground">
                            {user.full_name || 'Sem nome'}
                          </p>
                          {isCurrentUser && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>

                      <div className="hidden sm:block">
                        <p className="text-xs text-muted-foreground">
                          Último acesso
                        </p>
                        <p className="text-sm">
                          {formatDate(user.last_login_at)}
                        </p>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${role.color}`}
                      >
                        {role.icon}
                        <span className="hidden sm:inline">{role.label}</span>
                      </div>

                      {user.status !== 'active' && (
                        <span className="rounded-full bg-ouro-50 px-2 py-1 text-xs font-medium text-ouro-600">
                          {user.status === 'inactive' ? 'Inativo' : 'Pendente'}
                        </span>
                      )}

                      {/* Actions Menu */}
                      {!isCurrentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                setRoleDialog({
                                  open: true,
                                  user,
                                  newRole: 'admin'
                                })
                              }
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Tornar Administrador
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setRoleDialog({
                                  open: true,
                                  user,
                                  newRole: 'member'
                                })
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Tornar Membro
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setRoleDialog({
                                  open: true,
                                  user,
                                  newRole: 'viewer'
                                })
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Tornar Visualizador
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusToggle(user)}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              {user.status === 'active'
                                ? 'Desativar'
                                : 'Reativar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                setDeactivateDialog({ open: true, user })
                              }
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Change Confirmation Dialog */}
      <Dialog
        open={roleDialog.open}
        onOpenChange={(open) =>
          !open && setRoleDialog({ open: false, user: null, newRole: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Permissão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja alterar a permissão de{' '}
              <strong>
                {roleDialog.user?.full_name || roleDialog.user?.email}
              </strong>{' '}
              para{' '}
              <strong>
                {roleDialog.newRole && roleConfig[roleDialog.newRole].label}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRoleDialog({ open: false, user: null, newRole: null })
              }
            >
              Cancelar
            </Button>
            <Button onClick={handleRoleChange} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <Dialog
        open={deactivateDialog.open}
        onOpenChange={(open) =>
          !open && setDeactivateDialog({ open: false, user: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Membro</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover{' '}
              <strong>
                {deactivateDialog.user?.full_name ||
                  deactivateDialog.user?.email}
              </strong>{' '}
              da organização? Esta ação pode ser desfeita reativando o usuário.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeactivateDialog({ open: false, user: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
