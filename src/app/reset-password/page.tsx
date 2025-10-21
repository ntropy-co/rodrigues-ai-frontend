'use client'

/**
 * Reset Password Page
 */
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { resetPasswordApi } from '@/lib/auth/api'
import { toast } from 'sonner'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (!token) {
      toast.error('Token inválido')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await resetPasswordApi({ token, new_password: password })
      setIsSuccess(true)
      toast.success(response.message)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao redefinir senha'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Missing token - show error
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            {/* Error Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-10 w-10 text-red-600 dark:text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="mb-4 text-center text-2xl font-bold text-foreground">
              Link Inválido ou Expirado
            </h1>

            <p className="mb-6 text-center text-muted-foreground">
              Este link de redefinição de senha é inválido ou já expirou. Por
              favor, solicite um novo link.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/forgot-password')}
                className="w-full bg-gradient-to-r from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))] text-white hover:from-[hsl(var(--gemini-blue-hover))] hover:to-[hsl(var(--gemini-purple))]"
              >
                Solicitar Novo Link
              </Button>

              <Link
                href="/login"
                className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Voltar para login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            {/* Success Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-10 w-10 text-green-600 dark:text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="mb-4 text-center text-2xl font-bold text-foreground">
              Senha Redefinida!
            </h1>

            <p className="mb-6 text-center text-muted-foreground">
              Sua senha foi redefinida com sucesso. Você será redirecionado para
              a página de login...
            </p>

            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))] text-white hover:from-[hsl(var(--gemini-blue-hover))] hover:to-[hsl(var(--gemini-purple))]"
            >
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))]">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Redefinir Senha
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Digite sua nova senha abaixo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Nova Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Mínimo de 8 caracteres
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Confirmar Nova Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-gradient-to-r from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))] py-3 font-medium text-white shadow-md transition-all hover:from-[hsl(var(--gemini-blue-hover))] hover:to-[hsl(var(--gemini-purple))] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Redefinindo...</span>
                </div>
              ) : (
                'Redefinir Senha'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-[hsl(var(--gemini-blue))] hover:text-[hsl(var(--gemini-blue-hover))]"
            >
              ← Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
