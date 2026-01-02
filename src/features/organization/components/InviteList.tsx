'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Loader2,
  Mail,
  MoreVertical,
  RefreshCw,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { Invite, InviteStatus } from '@/types/auth'

// ============================================================================
// TYPES
// ============================================================================

interface InviteListProps {
  /** Optional className for styling */
  className?: string
  /** Callback when an invite is cancelled */
  onInviteCancelled?: (inviteId: string) => void
  /** Callback when an invite is resent */
  onInviteResent?: (invite: Invite) => void
  /** Callback when an error occurs */
  onError?: (error: string) => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<
  InviteStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  pending: {
    label: 'Pendente',
    icon: <Clock className="h-3.5 w-3.5" />,
    color: 'bg-ouro-100 text-ouro-700 border-ouro-200'
  },
  accepted: {
    label: 'Aceito',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: 'bg-verity-100 text-verity-700 border-verity-200'
  },
  expired: {
    label: 'Expirado',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    color: 'bg-error-100 text-error-700 border-error-200'
  },
  revoked: {
    label: 'Cancelado',
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: 'bg-sand-200 text-verity-500 border-sand-300'
  }
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Visualizador',
  analyst: 'Analista'
}

// ============================================================================
// HOOK: useInvites
// ============================================================================

function useInvites() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchInvites = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/organizations/invites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao carregar convites')
      }

      const data = await response.json()
      // Handle both array and object with invites property
      const invitesList = Array.isArray(data) ? data : data.invites || []
      setInvites(invitesList)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelInvite = useCallback(async (inviteId: string) => {
    setActionLoading(inviteId)
    setError(null)

    try {
      const response = await fetch(`/api/organizations/invites/${inviteId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao cancelar convite')
      }

      // Remove from local state
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteId))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      throw err
    } finally {
      setActionLoading(null)
    }
  }, [])

  const resendInvite = useCallback(async (inviteId: string) => {
    setActionLoading(inviteId)
    setError(null)

    try {
      const response = await fetch(
        `/api/organizations/invites/${inviteId}/resend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao reenviar convite')
      }

      const updatedInvite = await response.json()

      // Update in local state
      setInvites((prev) =>
        prev.map((inv) =>
          inv.id === inviteId ? { ...inv, ...updatedInvite } : inv
        )
      )

      return updatedInvite
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      throw err
    } finally {
      setActionLoading(null)
    }
  }, [])

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  return {
    invites,
    isLoading,
    error,
    actionLoading,
    refetch: fetchInvites,
    cancelInvite,
    resendInvite
  }
}

// ============================================================================
// COMPONENT: StatusBadge
// ============================================================================

function StatusBadge({ status }: { status: InviteStatus }) {
  const config = STATUS_CONFIG[status]
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
// COMPONENT: InviteRow
// ============================================================================

interface InviteRowProps {
  invite: Invite
  isLoading: boolean
  onCancel: () => void
  onResend: () => void
}

function InviteRow({ invite, isLoading, onCancel, onResend }: InviteRowProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired =
    invite.status === 'expired' || new Date(invite.expiresAt) < new Date()
  const canResend = invite.status === 'pending' || isExpired
  const canCancel = invite.status === 'pending'

  return (
    <div className="flex items-center justify-between border-b border-border py-4 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Mail className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">{invite.email}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{ROLE_LABELS[invite.role] || invite.role}</span>
            <span>-</span>
            <span>Enviado em {formatDate(invite.sentAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge
          status={
            isExpired && invite.status === 'pending' ? 'expired' : invite.status
          }
        />

        {(canResend || canCancel) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreVertical className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {canResend && (
                <DropdownMenuItem onClick={onResend}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reenviar Convite
                </DropdownMenuItem>
              )}
              {canCancel && (
                <DropdownMenuItem onClick={onCancel} className="text-error-600">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar Convite
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENT: InviteList
// ============================================================================

export function InviteList({
  className = '',
  onInviteCancelled,
  onInviteResent,
  onError
}: InviteListProps) {
  const {
    invites,
    isLoading,
    error,
    actionLoading,
    refetch,
    cancelInvite,
    resendInvite
  } = useInvites()

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Propagate errors
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  const handleCancel = async (inviteId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este convite?')) {
      return
    }
    try {
      await cancelInvite(inviteId)
      setSuccessMessage('Convite cancelado com sucesso')
      onInviteCancelled?.(inviteId)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch {
      // Error already handled in hook
    }
  }

  const handleResend = async (invite: Invite) => {
    try {
      const updated = await resendInvite(invite.id)
      setSuccessMessage('Convite reenviado com sucesso')
      onInviteResent?.(updated)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch {
      // Error already handled in hook
    }
  }

  // Separate invites by status
  const pendingInvites = invites.filter(
    (inv) => inv.status === 'pending' && new Date(inv.expiresAt) >= new Date()
  )
  const expiredInvites = invites.filter(
    (inv) =>
      inv.status === 'expired' ||
      (inv.status === 'pending' && new Date(inv.expiresAt) < new Date())
  )
  const acceptedInvites = invites.filter((inv) => inv.status === 'accepted')
  const revokedInvites = invites.filter((inv) => inv.status === 'revoked')

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-5 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b py-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="mt-1 h-4 w-64" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-verity-100">
              <Send className="h-5 w-5 text-verity-600" />
            </div>
            <div>
              <CardTitle>Convites Enviados</CardTitle>
              <CardDescription>
                Gerencie os convites pendentes e enviados
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-verity-50 p-3 text-sm text-verity-700">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {invites.length === 0 ? (
          <div className="py-8 text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              Nenhum convite enviado ainda
            </p>
            <p className="text-sm text-muted-foreground">
              Convide membros para sua organizacao usando o botao acima
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Pendentes ({pendingInvites.length})
                </h3>
                <div className="rounded-lg border border-border">
                  {pendingInvites.map((invite) => (
                    <InviteRow
                      key={invite.id}
                      invite={invite}
                      isLoading={actionLoading === invite.id}
                      onCancel={() => handleCancel(invite.id)}
                      onResend={() => handleResend(invite)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Expired Invites */}
            {expiredInvites.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Expirados ({expiredInvites.length})
                </h3>
                <div className="rounded-lg border border-border">
                  {expiredInvites.map((invite) => (
                    <InviteRow
                      key={invite.id}
                      invite={invite}
                      isLoading={actionLoading === invite.id}
                      onCancel={() => handleCancel(invite.id)}
                      onResend={() => handleResend(invite)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Invites */}
            {acceptedInvites.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Aceitos ({acceptedInvites.length})
                </h3>
                <div className="rounded-lg border border-border">
                  {acceptedInvites.map((invite) => (
                    <InviteRow
                      key={invite.id}
                      invite={invite}
                      isLoading={actionLoading === invite.id}
                      onCancel={() => handleCancel(invite.id)}
                      onResend={() => handleResend(invite)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Revoked Invites (collapsed by default) */}
            {revokedInvites.length > 0 && (
              <details className="group">
                <summary className="mb-3 cursor-pointer text-sm font-medium text-muted-foreground">
                  Cancelados ({revokedInvites.length})
                </summary>
                <div className="rounded-lg border border-border">
                  {revokedInvites.map((invite) => (
                    <InviteRow
                      key={invite.id}
                      invite={invite}
                      isLoading={actionLoading === invite.id}
                      onCancel={() => handleCancel(invite.id)}
                      onResend={() => handleResend(invite)}
                    />
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
