'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Plus,
  Clock,
  RefreshCw,
  MoreHorizontal,
  Send,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useInvites, type Invite, type InviteStatus } from '@/hooks/useInvites'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { UserRole } from '@/types/auth'

// Status display configuration
const statusConfig: Record<
  InviteStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  pending: {
    label: 'Pendente',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-amber-600 bg-amber-50'
  },
  accepted: {
    label: 'Aceito',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-600 bg-green-50'
  },
  expired: {
    label: 'Expirado',
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-gray-600 bg-gray-100'
  },
  revoked: {
    label: 'Cancelado',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600 bg-red-50'
  }
}

// Role display configuration
const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  analyst: 'Membro',
  member: 'Membro',
  viewer: 'Visualizador'
}

export default function InvitesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    listInvites,
    createInvite,
    cancelInvite,
    resendInvite,
    loading,
    error
  } = useInvites()

  const [invites, setInvites] = useState<Invite[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<InviteStatus | 'all'>('all')

  // New invite modal state
  const [inviteModal, setInviteModal] = useState(false)
  const [newInviteEmail, setNewInviteEmail] = useState('')
  const [newInviteRole, setNewInviteRole] = useState<UserRole>('analyst')
  const [creating, setCreating] = useState(false)

  // Cancel confirmation dialog
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean
    invite: Invite | null
  }>({ open: false, invite: null })

  // Fetch invites
  const fetchInvites = useCallback(async () => {
    const result = await listInvites()
    setInvites(result)
    setInitialLoading(false)
  }, [listInvites])

  // Guard - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch invites on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchInvites()
    }
  }, [isAuthenticated, fetchInvites])

  // Filter invites
  const filteredInvites =
    statusFilter === 'all'
      ? invites
      : invites.filter((invite) => invite.status === statusFilter)

  // Create new invite
  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newInviteEmail.trim()) {
      toast.error('Por favor, insira um email válido')
      return
    }

    setCreating(true)
    try {
      const result = await createInvite({
        email: newInviteEmail.trim(),
        role: newInviteRole
      })

      if (result) {
        toast.success(`Convite enviado para ${newInviteEmail}`)
        setNewInviteEmail('')
        setNewInviteRole('analyst')
        setInviteModal(false)
        fetchInvites()
      } else {
        toast.error('Erro ao enviar convite')
      }
    } catch (err) {
      console.error('Error creating invite:', err)
      toast.error('Erro ao enviar convite')
    } finally {
      setCreating(false)
    }
  }

  // Resend invite
  const handleResend = async (invite: Invite) => {
    const success = await resendInvite(invite.id)
    if (success) {
      toast.success(`Convite reenviado para ${invite.email}`)
      fetchInvites()
    } else {
      toast.error('Erro ao reenviar convite')
    }
  }

  // Cancel invite
  const handleCancel = async () => {
    if (!cancelDialog.invite) return

    const success = await cancelInvite(cancelDialog.invite.id)
    if (success) {
      toast.success('Convite cancelado')
      fetchInvites()
    } else {
      toast.error('Erro ao cancelar convite')
    }
    setCancelDialog({ open: false, invite: null })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Check if invite is expired
  const isExpired = (invite: Invite) => {
    return new Date(invite.expires_at) < new Date()
  }

  // Loading state
  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-8 h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
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
      <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50">
        <div className="container mx-auto max-w-4xl px-4 py-8">
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
              <Button variant="outline" className="mt-4" onClick={fetchInvites}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
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
                Convites
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie os convites para novos membros da organização.
              </p>
            </div>
            <Button onClick={() => setInviteModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Convite
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as InviteStatus | 'all')}
          >
            <SelectTrigger className="w-full bg-background sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="accepted">Aceitos</SelectItem>
              <SelectItem value="expired">Expirados</SelectItem>
              <SelectItem value="revoked">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="icon"
            onClick={fetchInvites}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Invites List */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Convites Enviados</CardTitle>
            </div>
            <CardDescription>
              {filteredInvites.length}{' '}
              {filteredInvites.length === 1 ? 'convite' : 'convites'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInvites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Mail className="mb-4 h-12 w-12 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">
                  Nenhum convite encontrado
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm">
                  {statusFilter !== 'all'
                    ? 'Tente ajustar o filtro de status.'
                    : 'Envie convites para adicionar membros à organização.'}
                </p>
                {statusFilter === 'all' && (
                  <Button className="mt-4" onClick={() => setInviteModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Enviar Convite
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {filteredInvites.map((invite) => {
                  const status = statusConfig[invite.status]
                  const expired =
                    isExpired(invite) && invite.status === 'pending'

                  return (
                    <div
                      key={invite.id}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {invite.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{roleLabels[invite.role] || invite.role}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">
                            Enviado em {formatDate(invite.sent_at)}
                          </span>
                          {invite.status === 'pending' && (
                            <>
                              <span>•</span>
                              <span
                                className={expired ? 'text-destructive' : ''}
                              >
                                {expired
                                  ? 'Expirado'
                                  : `Expira em ${formatDate(invite.expires_at)}`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          expired ? 'bg-red-50 text-red-600' : status.color
                        }`}
                      >
                        {expired ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          status.icon
                        )}
                        <span className="hidden sm:inline">
                          {expired ? 'Expirado' : status.label}
                        </span>
                      </div>

                      {/* Actions Menu */}
                      {invite.status === 'pending' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleResend(invite)}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Reenviar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                setCancelDialog({ open: true, invite })
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancelar
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

      {/* New Invite Modal */}
      <Dialog open={inviteModal} onOpenChange={setInviteModal}>
        <DialogContent>
          <form onSubmit={handleCreateInvite}>
            <DialogHeader>
              <DialogTitle>Convidar Membro</DialogTitle>
              <DialogDescription>
                Envie um convite por email para adicionar um novo membro à
                organização.
              </DialogDescription>
            </DialogHeader>

            <div className="my-6 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                  placeholder="nome@empresa.com"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className="text-sm font-medium text-foreground"
                >
                  Permissão
                </label>
                <Select
                  value={newInviteRole}
                  onValueChange={(v) => setNewInviteRole(v as UserRole)}
                >
                  <SelectTrigger id="role" className="bg-background">
                    <SelectValue placeholder="Selecione uma permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex flex-col">
                        <span>Administrador</span>
                        <span className="text-xs text-muted-foreground">
                          Acesso total à organização
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="analyst">
                      <div className="flex flex-col">
                        <span>Membro</span>
                        <span className="text-xs text-muted-foreground">
                          Criar e editar documentos
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div className="flex flex-col">
                        <span>Visualizador</span>
                        <span className="text-xs text-muted-foreground">
                          Apenas visualizar conteúdo
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Convite
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialog.open}
        onOpenChange={(open) =>
          !open && setCancelDialog({ open: false, invite: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Convite</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar o convite para{' '}
              <strong>{cancelDialog.invite?.email}</strong>? O link de convite
              será invalidado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialog({ open: false, invite: null })}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Cancelar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
