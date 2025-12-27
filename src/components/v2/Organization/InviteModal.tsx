'use client'

import { useState } from 'react'
import { Loader2, Mail, UserPlus, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { Invite } from '@/types/auth'

// ============================================================================
// TYPES
// ============================================================================

// Use backend role types (member instead of analyst)
type InviteRole = 'admin' | 'member' | 'viewer'

interface InviteModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void
  /** Callback when invite is sent successfully */
  onInviteSent?: (invite: Invite) => void
  /** Callback when an error occurs */
  onError?: (error: string) => void
  /** Remaining invites quota (optional, for display) */
  remainingQuota?: number
}

interface InviteFormData {
  email: string
  role: InviteRole
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLE_OPTIONS: {
  value: InviteRole
  label: string
  description: string
}[] = [
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Acesso total, pode gerenciar membros e configuracoes'
  },
  {
    value: 'member',
    label: 'Membro',
    description: 'Pode criar e editar documentos, analisar CPRs'
  },
  {
    value: 'viewer',
    label: 'Visualizador',
    description: 'Acesso somente leitura aos documentos'
  }
]

// ============================================================================
// HOOK: useInvites
// ============================================================================

function useInvites() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendInvite = async (data: InviteFormData): Promise<Invite> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/organizations/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          role: data.role
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao enviar convite')
      }

      const result = await response.json()
      return result.invite || result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendInvite,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function InviteModal({
  open,
  onOpenChange,
  onInviteSent,
  onError,
  remainingQuota
}: InviteModalProps) {
  const { sendInvite, isLoading, error, clearError } = useInvites()

  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    role: 'member'
  })
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      onError?.('Por favor, insira um email valido')
      return
    }

    try {
      const invite = await sendInvite(formData)
      setSuccess(true)
      onInviteSent?.(invite)

      // Reset and close after success animation
      setTimeout(() => {
        setFormData({ email: '', role: 'member' })
        setSuccess(false)
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao enviar convite'
      onError?.(message)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ email: '', role: 'member' })
      setSuccess(false)
      clearError()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-verity-100">
              <UserPlus className="h-5 w-5 text-verity-600" />
            </div>
            <div>
              <DialogTitle>Convidar Novo Membro</DialogTitle>
              <DialogDescription>
                Envie um convite por email para adicionar um novo membro a sua
                organizacao.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <Check className="h-4 w-4 flex-shrink-0" />
              <span>Convite enviado com sucesso!</span>
            </div>
          )}

          {/* Quota Warning */}
          {remainingQuota !== undefined && remainingQuota <= 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                Voce atingiu o limite de convites do seu plano. Entre em contato
                para aumentar sua cota.
              </span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label
              htmlFor="invite-email"
              className="text-sm font-medium text-foreground"
            >
              Email do Convidado
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="invite-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="email@empresa.com"
                className="pl-9"
                disabled={isLoading || success}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label
              htmlFor="invite-role"
              className="text-sm font-medium text-foreground"
            >
              Cargo
            </label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value as InviteRole }))
              }
              disabled={isLoading || success}
            >
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {ROLE_OPTIONS.find((o) => o.value === formData.role)?.description}
            </p>
          </div>

          {/* Remaining Quota Info */}
          {remainingQuota !== undefined && remainingQuota > 0 && (
            <p className="text-xs text-muted-foreground">
              Voce tem {remainingQuota} convite{remainingQuota !== 1 ? 's' : ''}{' '}
              restante{remainingQuota !== 1 ? 's' : ''} no seu plano.
            </p>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                success ||
                !formData.email ||
                (remainingQuota !== undefined && remainingQuota <= 0)
              }
              className="bg-verity-600 text-white hover:bg-verity-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : success ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Enviado!
                </>
              ) : (
                'Enviar Convite'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
