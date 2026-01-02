'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Palette, Save, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/features/organization'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    organization,
    loading: orgLoading,
    error,
    updateOrganization,
    getOrganization
  } = useOrganization()

  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    primary_color: '#1a472a'
  })
  const [saving, setSaving] = useState(false)

  // Populate form when organization loads
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        logo_url: organization.logo_url || '',
        primary_color: organization.primary_color || '#1a472a'
      })
    }
  }, [organization])

  // Guard - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const result = await updateOrganization({
        name: formData.name,
        logo_url: formData.logo_url || undefined,
        primary_color: formData.primary_color || undefined
      })

      if (result) {
        toast.success('Organização atualizada com sucesso!')
      } else {
        toast.error('Erro ao atualizar organização')
      }
    } catch (err) {
      console.error('Error updating organization:', err)
      toast.error('Erro ao atualizar organização')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Loading state
  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen bg-sand-50/50 dark:bg-zinc-900/50">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Skeleton className="mb-8 h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-sand-50/50 dark:bg-zinc-900/50">
        <div className="container mx-auto max-w-3xl px-4 py-8">
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
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => getOrganization()}
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50/50 dark:bg-zinc-900/50">
      <div className="container mx-auto max-w-3xl px-4 py-8">
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Configurações da Organização
          </h1>
          <p className="text-sm text-muted-foreground">
            Personalize as informações e aparência da sua organização.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Organization Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Informações Gerais</CardTitle>
              </div>
              <CardDescription>
                Dados básicos da sua organização.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Nome da Organização
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome da empresa"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="logo_url"
                  className="text-sm font-medium text-foreground"
                >
                  URL do Logo
                </label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) =>
                    handleInputChange('logo_url', e.target.value)
                  }
                  placeholder="https://exemplo.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Insira a URL de uma imagem para usar como logo da organização.
                </p>
              </div>

              {/* Logo Preview */}
              {formData.logo_url && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Pré-visualização do Logo
                  </p>
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.logo_url}
                      alt="Logo preview"
                      className="max-h-16 max-w-16 object-contain"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Branding Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Identidade Visual</CardTitle>
              </div>
              <CardDescription>
                Personalize as cores da sua organização.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="primary_color"
                  className="text-sm font-medium text-foreground"
                >
                  Cor Primária
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) =>
                      handleInputChange('primary_color', e.target.value)
                    }
                    className="h-11 w-14 cursor-pointer rounded-lg border border-input"
                  />
                  <Input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) =>
                      handleInputChange('primary_color', e.target.value)
                    }
                    placeholder="#1a472a"
                    className="w-32"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Esta cor será usada em elementos principais da interface.
                </p>
              </div>

              {/* Color Preview */}
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-foreground">
                  Pré-visualização
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-lg shadow-sm"
                    style={{ backgroundColor: formData.primary_color }}
                  />
                  <div
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: formData.primary_color }}
                  >
                    Botão de Exemplo
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Stats */}
          {organization && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Informações do Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Plano</p>
                    <p className="text-lg font-semibold capitalize">
                      {organization.plan_tier || 'Standard'}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Usuários</p>
                    <p className="text-lg font-semibold">
                      {organization.current_users_count || 0} /{' '}
                      {organization.max_users || 10}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Slug</p>
                    <p className="truncate text-lg font-semibold">
                      {organization.slug || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
