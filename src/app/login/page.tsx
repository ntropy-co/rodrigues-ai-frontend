'use client'

/**
 * Login Page
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const { login, register, isAuthenticated, isLoading } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem')
        }
        await register({ email, password, full_name: fullName || undefined })
      }
      router.push('/')
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl bg-card border border-border shadow-lg p-8">
          {/* Logo/Header */}
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Rodrigues AI
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === 'login'
                ? 'Consultor Jurídico de Crédito Rural'
                : 'Criar nova conta'}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 rounded-lg bg-muted p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Registrar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Nome Completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Seu nome completo"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Senha
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="text-xs font-medium text-[hsl(var(--gemini-blue))] hover:text-[hsl(var(--gemini-blue-hover))]"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
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
              {mode === 'register' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Mínimo de 8 caracteres
                </p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Confirmar Senha
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
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))] hover:from-[hsl(var(--gemini-blue-hover))] hover:to-[hsl(var(--gemini-purple))] text-white font-medium py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>
                    {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
                  </span>
                </div>
              ) : mode === 'login' ? (
                'Entrar'
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <p>
                Não tem uma conta?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="font-medium text-[hsl(var(--gemini-blue))] hover:text-[hsl(var(--gemini-blue-hover))]"
                >
                  Registre-se
                </button>
              </p>
            ) : (
              <p>
                Já tem uma conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-medium text-[hsl(var(--gemini-blue))] hover:text-[hsl(var(--gemini-blue-hover))]"
                >
                  Faça login
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Extra info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Especialista em CPR e Crédito Rural</p>
          <p className="mt-1">Consultoria Jurídica Powered by AI</p>
        </div>
      </div>
    </div>
  )
}
