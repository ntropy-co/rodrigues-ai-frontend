'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Loader2,
  Users,
  MoreVertical,
  Shield,
  Eye,
  UserCog,
  UserX,
  AlertCircle,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// ============================================================================
// TYPES
// ============================================================================

type UserRole = 'admin' | 'member' | 'viewer'
type UserStatus = 'active' | 'inactive' | 'pending'

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  last_login_at: string | null
}

interface TeamMembersProps {
  /** Optional className for styling */
  className?: string
  /** Callback when invite modal should open */
  onInviteClick?: () => void
  /** Callback when a member is updated */
  onMemberUpdated?: (member: TeamMember) => void
  /** Callback when an error occurs */
  onError?: (error: string) => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: React.ReactNode; color: string }
> = {
  admin: {
    label: 'Administrador',
    icon: <Shield className="h-3.5 w-3.5" />,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  member: {
    label: 'Membro',
    icon: <UserCog className="h-3.5 w-3.5" />,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  viewer: {
    label: 'Visualizador',
    icon: <Eye className="h-3.5 w-3.5" />,
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string }> = {
  active: {
    label: 'Ativo',
    color: 'bg-green-100 text-green-700'
  },
  inactive: {
    label: 'Inativo',
    color: 'bg-gray-100 text-gray-600'
  },
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-700'
  }
}

// ============================================================================
// HOOK: useAdminUsers
// ============================================================================

function useAdminUsers() {
  const [users, setUsers] = useState<TeamMember[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('limit', '50')
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao carregar usuarios')
      }

      const data = await response.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [search, roleFilter, statusFilter])

  const updateUserRole = useCallback(async (userId: string, role: UserRole) => {
    setIsUpdating(userId)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ role })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao atualizar usuario')
      }

      const updatedUser = await response.json()
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updatedUser } : u))
      )
      return updatedUser
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      throw err
    } finally {
      setIsUpdating(null)
    }
  }, [])

  const updateUserStatus = useCallback(
    async (userId: string, status: 'active' | 'inactive') => {
      setIsUpdating(userId)
      setError(null)

      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ status })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Erro ao atualizar usuario')
        }

        const updatedUser = await response.json()
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...updatedUser } : u))
        )
        return updatedUser
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        throw err
      } finally {
        setIsUpdating(null)
      }
    },
    []
  )

  const deactivateUser = useCallback(
    async (userId: string) => {
      setIsUpdating(userId)
      setError(null)

      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include'
        })

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Erro ao desativar usuario')
        }

        // Refresh the list
        await fetchUsers()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        throw err
      } finally {
        setIsUpdating(null)
      }
    },
    [fetchUsers]
  )

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    total,
    isLoading,
    isUpdating,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    refetch: fetchUsers,
    updateUserRole,
    updateUserStatus,
    deactivateUser
  }
}

// ============================================================================
// COMPONENT: RoleBadge
// ============================================================================

function RoleBadge({ role }: { role: UserRole }) {
  const config = ROLE_CONFIG[role]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

// ============================================================================
// COMPONENT: StatusBadge
// ============================================================================

function StatusBadge({ status }: { status: UserStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  )
}

// ============================================================================
// COMPONENT: MemberRow
// ============================================================================

interface MemberRowProps {
  member: TeamMember
  isUpdating: boolean
  onRoleChange: (role: UserRole) => void
  onStatusChange: (status: 'active' | 'inactive') => void
  onDeactivate: () => void
}

function MemberRow({
  member,
  isUpdating,
  onRoleChange,
  onStatusChange,
  onDeactivate
}: MemberRowProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      {/* User Info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-verity-100 text-sm font-medium text-verity-700">
            {member.full_name
              ? member.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : member.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {member.full_name || 'Sem nome'}
            </p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3">
        <RoleBadge role={member.role} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={member.status} />
      </td>

      {/* Last Login */}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(member.last_login_at)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onRoleChange('admin')}
              disabled={member.role === 'admin'}
            >
              <Shield className="mr-2 h-4 w-4" />
              Tornar Administrador
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onRoleChange('member')}
              disabled={member.role === 'member'}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Tornar Membro
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onRoleChange('viewer')}
              disabled={member.role === 'viewer'}
            >
              <Eye className="mr-2 h-4 w-4" />
              Tornar Visualizador
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {member.status === 'active' ? (
              <DropdownMenuItem
                onClick={() => onStatusChange('inactive')}
                className="text-amber-600"
              >
                <UserX className="mr-2 h-4 w-4" />
                Desativar Usuario
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onStatusChange('active')}
                className="text-green-600"
              >
                <UserCog className="mr-2 h-4 w-4" />
                Reativar Usuario
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDeactivate} className="text-red-600">
              <UserX className="mr-2 h-4 w-4" />
              Remover da Organizacao
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

// ============================================================================
// COMPONENT: TeamMembers
// ============================================================================

export function TeamMembers({
  className = '',
  onInviteClick,
  onMemberUpdated,
  onError
}: TeamMembersProps) {
  const {
    users,
    total,
    isLoading,
    isUpdating,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    updateUserRole,
    updateUserStatus,
    deactivateUser
  } = useAdminUsers()

  // Propagate errors
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const updated = await updateUserRole(userId, role)
      onMemberUpdated?.(updated)
    } catch {
      // Error already handled in hook
    }
  }

  const handleStatusChange = async (
    userId: string,
    status: 'active' | 'inactive'
  ) => {
    try {
      const updated = await updateUserStatus(userId, status)
      onMemberUpdated?.(updated)
    } catch {
      // Error already handled in hook
    }
  }

  const handleDeactivate = async (userId: string) => {
    if (
      !confirm('Tem certeza que deseja remover este usuario da organizacao?')
    ) {
      return
    }
    try {
      await deactivateUser(userId)
    } catch {
      // Error already handled in hook
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="mt-2 h-5 w-72" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-1 h-4 w-56" />
                </div>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-verity-100">
              <Users className="h-5 w-5 text-verity-600" />
            </div>
            <div>
              <CardTitle>Membros da Equipe</CardTitle>
              <CardDescription>
                {total} membro{total !== 1 ? 's' : ''} na organizacao
              </CardDescription>
            </div>
          </div>
          {onInviteClick && (
            <Button
              onClick={onInviteClick}
              className="bg-verity-600 text-white hover:bg-verity-700"
            >
              Convidar Membro
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value as UserRole | 'all')
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cargos</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="member">Membro</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as UserStatus | 'all')
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ultimo Acesso</th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {search || roleFilter !== 'all' || statusFilter !== 'all'
                      ? 'Nenhum membro encontrado com os filtros selecionados'
                      : 'Nenhum membro na organizacao ainda'}
                  </td>
                </tr>
              ) : (
                users.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isUpdating={isUpdating === member.id}
                    onRoleChange={(role) => handleRoleChange(member.id, role)}
                    onStatusChange={(status) =>
                      handleStatusChange(member.id, status)
                    }
                    onDeactivate={() => handleDeactivate(member.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
