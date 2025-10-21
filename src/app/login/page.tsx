'use client'

/**
 * Login Page
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface FormErrors {
  email?: string
  password?: string
  fullName?: string
  confirmPassword?: string
}

export default function LoginPage() {
  const router = useRouter()
  const { login, register, isAuthenticated, isLoading } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Clear errors when switching modes
  useEffect(() => {
    setErrors({})
    setEmail('')
    setPassword('')
    setFullName('')
    setConfirmPassword('')
  }, [mode])

  // Validate email in real-time
  const validateEmail = (value: string): string | undefined => {
    if (!value) return 'Email é obrigatório'
    if (value.length < 3) return 'Email muito curto'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido'
    return undefined
  }

  // Validate password in real-time
  const validatePassword = (
    value: string,
    isRegister = false
  ): string | undefined => {
    if (!value) return 'Senha é obrigatória'
    if (value.length < 8) return 'Senha deve ter no mínimo 8 caracteres'
    if (isRegister) {
      if (!/[A-Z]/.test(value)) return 'Senha deve conter letra maiúscula'
      if (!/[a-z]/.test(value)) return 'Senha deve conter letra minúscula'
      if (!/[0-9]/.test(value)) return 'Senha deve conter número'
    }
    return undefined
  }

  // Validate full name
  const validateFullName = (value: string): string | undefined => {
    if (!value) return 'Nome é obrigatório'
    if (value.length < 2) return 'Nome muito curto'
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) {
      return 'Nome deve conter apenas letras'
    }
    return undefined
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Manual validation before submit
    const newErrors: FormErrors = {}

    // Validate email
    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError

    // Validate password
    const passwordError = validatePassword(password, mode === 'register')
    if (passwordError) newErrors.password = passwordError

    // Register-specific validations
    if (mode === 'register') {
      const fullNameError = validateFullName(fullName)
      if (fullNameError) newErrors.fullName = fullNameError

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem'
      }
    }

    // If there are errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await login(email, password)
        router.push('/')
      } else {
        await register({ email, password, full_name: fullName || undefined })
        router.push('/')
      }
    } catch (error) {
      // Error handling is done in AuthContext with toasts
      console.error('Auth error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle email change with validation
  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (errors.email) {
      const error = validateEmail(value)
      setErrors((prev) => ({ ...prev, email: error }))
    }
  }

  // Handle password change with validation
  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (errors.password) {
      const error = validatePassword(value, mode === 'register')
      setErrors((prev) => ({ ...prev, password: error }))
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
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
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
            <h1 className="text-3xl font-bold text-foreground">Rodrigues AI</h1>
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
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Nome Completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border ${
                    errors.fullName ? 'border-red-500' : 'border-input'
                  } bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50`}
                  placeholder="Seu nome completo"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>
            )}

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
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={isSubmitting}
                className={`w-full rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-input'
                } bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50`}
                placeholder="seu@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
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
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                disabled={isSubmitting}
                className={`w-full rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-input'
                } bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50`}
                placeholder="••••••••"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
              {mode === 'register' && !errors.password && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Mínimo 8 caracteres, com maiúscula, minúscula e número
                </p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-input'
                  } bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-gradient-to-r from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))] py-3 font-medium text-white shadow-md transition-all hover:from-[hsl(var(--gemini-blue-hover))] hover:to-[hsl(var(--gemini-purple))] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
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
