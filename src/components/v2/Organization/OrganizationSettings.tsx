'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Building2, Upload, X, Check, AlertCircle } from 'lucide-react'
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
import type { Organization } from '@/types/auth'

// ============================================================================
// TYPES
// ============================================================================

interface OrganizationSettingsProps {
  /** Optional className for styling */
  className?: string
  /** Callback when settings are saved successfully */
  onSaveSuccess?: (org: Organization) => void
  /** Callback when an error occurs */
  onError?: (error: string) => void
}

interface OrganizationFormData {
  name: string
  cnpj: string
  logo_url?: string
}

// ============================================================================
// HOOK: useOrganization
// ============================================================================

function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fetchOrganization = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/organizations/current', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao carregar organizacao')
      }

      const data = await response.json()
      setOrganization(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateOrganization = useCallback(
    async (data: Partial<OrganizationFormData>) => {
      setIsSaving(true)
      setError(null)

      try {
        const response = await fetch('/api/organizations/current', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Erro ao atualizar organizacao')
        }

        const updatedOrg = await response.json()
        setOrganization(updatedOrg)
        return updatedOrg
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(message)
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchOrganization()
  }, [fetchOrganization])

  return {
    organization,
    isLoading,
    isSaving,
    error,
    refetch: fetchOrganization,
    updateOrganization
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OrganizationSettings({
  className = '',
  onSaveSuccess,
  onError
}: OrganizationSettingsProps) {
  const { organization, isLoading, isSaving, error, updateOrganization } =
    useOrganization()

  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    cnpj: '',
    logo_url: ''
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Sync form data with organization
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        cnpj: organization.cnpj || '',
        logo_url: ''
      })
      setHasChanges(false)
    }
  }, [organization])

  // Propagate errors
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  const handleInputChange = (
    field: keyof OrganizationFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setSuccessMessage(null)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('Por favor, selecione uma imagem valida (PNG, JPG, etc.)')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      onError?.('A imagem deve ter no maximo 2MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setLogoPreview(reader.result as string)
      setHasChanges(true)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setFormData((prev) => ({ ...prev, logo_url: '' }))
    setHasChanges(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return

    try {
      const dataToSend: Partial<OrganizationFormData> = {}

      if (formData.name !== organization?.name) {
        dataToSend.name = formData.name
      }
      if (formData.cnpj !== organization?.cnpj) {
        dataToSend.cnpj = formData.cnpj
      }
      if (logoPreview) {
        dataToSend.logo_url = logoPreview
      }

      const updatedOrg = await updateOrganization(dataToSend)
      setSuccessMessage('Configuracoes salvas com sucesso!')
      setHasChanges(false)
      onSaveSuccess?.(updatedOrg)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch {
      // Error already handled in hook
    }
  }

  const handleReset = () => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        cnpj: organization.cnpj || '',
        logo_url: ''
      })
      setLogoPreview(null)
      setHasChanges(false)
      setSuccessMessage(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-5 w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-24 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-verity-100">
            <Building2 className="h-5 w-5 text-verity-600" />
          </div>
          <div>
            <CardTitle>Configuracoes da Organizacao</CardTitle>
            <CardDescription>
              Gerencie as informacoes basicas da sua organizacao
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <Check className="h-4 w-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Organization Name */}
          <div className="space-y-2">
            <label
              htmlFor="org-name"
              className="text-sm font-medium text-foreground"
            >
              Nome da Organizacao
            </label>
            <Input
              id="org-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Fazenda Santa Maria Ltda"
              className="w-full"
              disabled={isSaving}
            />
          </div>

          {/* CNPJ */}
          <div className="space-y-2">
            <label
              htmlFor="org-cnpj"
              className="text-sm font-medium text-foreground"
            >
              CNPJ
            </label>
            <Input
              id="org-cnpj"
              value={formData.cnpj}
              onChange={(e) => handleInputChange('cnpj', e.target.value)}
              placeholder="00.000.000/0001-00"
              className="w-full"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              O CNPJ e utilizado para identificacao em documentos e relatorios
            </p>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Logo da Organizacao
            </label>
            <div className="flex items-start gap-4">
              {/* Logo Preview */}
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {logoPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                      aria-label="Remover logo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="logo-upload"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  Enviar Logo
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  PNG, JPG ou GIF. Maximo 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Plan Info (Read-only) */}
          {organization && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Plano Atual
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {organization.plan === 'enterprise'
                      ? 'Enterprise'
                      : 'Trial'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    Convites
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {organization.invitesUsed} / {organization.invitesQuota}{' '}
                    utilizados
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!hasChanges || isSaving}
              className="bg-verity-600 text-white hover:bg-verity-700"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alteracoes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
