'use client'

/**
 * Forgot Password Page
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { forgotPasswordApi } from '@/lib/auth/api'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await forgotPasswordApi({ email })
      setIsSuccess(true)
      toast.success(response.message)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao solicitar redefinição'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

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
              Email Enviado!
            </h1>

            <p className="mb-2 text-center text-muted-foreground">
              Se o email <strong>{email}</strong> estiver cadastrado, você
              receberá instruções para redefinir sua senha.
            </p>

            <p className="mb-6 text-center text-sm text-muted-foreground">
              {process.env.NODE_ENV === 'development' && (
                <>
                  <strong>Modo desenvolvimento:</strong> Verifique o console do
                  backend para o link de redefinição.
                </>
              )}
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))] text-white hover:from-[hsl(var(--gemini-blue-hover))] hover:to-[hsl(var(--gemini-purple))]"
              >
                Voltar para Login
              </Button>

              <button
                onClick={() => setIsSuccess(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Tentar outro email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Esqueceu sua senha?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Digite seu email e enviaremos instruções para redefinir sua senha
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="seu@email.com"
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
                  <span>Enviando...</span>
                </div>
              ) : (
                'Enviar Instruções'
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

        {/* Extra info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Não recebeu o email? Verifique sua caixa de spam</p>
        </div>
      </div>
    </div>
  )
}
