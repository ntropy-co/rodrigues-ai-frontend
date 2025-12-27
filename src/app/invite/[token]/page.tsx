'use client'

/**
 * Public Invite Acceptance Page
 *
 * Allows users to accept organization invites:
 * - Validates invite token on load
 * - Shows invite details (organization, role)
 * - For new users: full name + password form
 * - For existing users: password confirmation only
 * - Accepts invite and auto-logs user in
 */

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Building2,
  UserPlus,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useInvites, type ValidateInviteResponse } from '@/hooks/useInvites'
import { validatePassword, validateName } from '@/lib/utils/auth-validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PasswordStrengthMeter } from '@/components/v2/Auth/PasswordStrengthMeter'
import { staggerContainer, staggerItem, durations } from '@/lib/animations'

// Background image for auth pages
const BACKGROUND_IMAGE = '/images/auth-background.jpg'

// ============================================================================
// TYPES
// ============================================================================

type InviteState =
  | 'loading'
  | 'valid'
  | 'expired'
  | 'used'
  | 'invalid'
  | 'error'

interface FormState {
  fullName: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  fullName?: string
  password?: string
  confirmPassword?: string
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

function InviteSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-24 rounded-lg border border-verity-100 bg-verity-50" />
      <div className="h-12 rounded-lg bg-verity-50" />
      <div className="h-12 rounded-lg bg-verity-50" />
      <div className="h-12 rounded-lg bg-verity-50" />
    </div>
  )
}

// ============================================================================
// ERROR STATES
// ============================================================================

interface ErrorStateProps {
  state: 'expired' | 'used' | 'invalid' | 'error'
  message?: string
}

function ErrorState({ state, message }: ErrorStateProps) {
  const configs = {
    expired: {
      icon: Clock,
      title: 'Convite Expirado',
      description:
        'Este convite expirou. Solicite um novo link ao administrador da sua organização.',
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    used: {
      icon: CheckCircle2,
      title: 'Convite Já Utilizado',
      description:
        'Este convite já foi aceito. Se você já tem uma conta, faça login.',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    invalid: {
      icon: XCircle,
      title: 'Convite Inválido',
      description:
        'Não foi possível validar este convite. Verifique o link recebido ou solicite um novo.',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    error: {
      icon: AlertCircle,
      title: 'Erro ao Carregar',
      description:
        message || 'Ocorreu um erro ao validar o convite. Tente novamente.',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50'
    }
  }

  const config = configs[state]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.slow }}
      className="rounded-2xl border border-verity-100 bg-white p-8 text-center shadow-xl shadow-verity-900/5 lg:p-10"
    >
      <div
        className={cn(
          'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
          config.bgColor
        )}
      >
        <Icon className={cn('h-8 w-8', config.iconColor)} />
      </div>
      <h2 className="mb-2 font-display text-2xl font-semibold text-verity-950">
        {config.title}
      </h2>
      <p className="mb-6 text-verity-700">{config.description}</p>
      <Link href="/login">
        <Button
          variant="outline"
          className="border-verity-200 text-verity-900 hover:bg-verity-50"
        >
          Ir para Login
        </Button>
      </Link>
    </motion.div>
  )
}

// ============================================================================
// SUCCESS STATE
// ============================================================================

interface SuccessStateProps {
  organizationName: string
  isAutoLoggedIn: boolean
}

function SuccessState({ organizationName, isAutoLoggedIn }: SuccessStateProps) {
  const router = useRouter()

  useEffect(() => {
    if (isAutoLoggedIn) {
      // If auto-logged in, redirect to dashboard
      const timer = setTimeout(() => {
        router.push('/chat')
      }, 2000)
      return () => clearTimeout(timer)
    }
    // If not auto-logged in, don't auto-redirect - let user click the login button
  }, [router, isAutoLoggedIn])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: durations.slow }}
      className="rounded-2xl border border-verity-100 bg-white p-8 text-center shadow-xl shadow-verity-900/5 lg:p-10"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <h2 className="mb-2 font-display text-2xl font-semibold text-verity-950">
        {isAutoLoggedIn ? 'Bem-vindo!' : 'Conta Criada!'}
      </h2>
      <p className="mb-6 text-verity-700">
        Você agora faz parte da <strong>{organizationName}</strong>.
        <br />
        {isAutoLoggedIn
          ? 'Redirecionando para a plataforma...'
          : 'Agora você pode fazer login com suas credenciais.'}
      </p>
      {isAutoLoggedIn ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-verity-600" />
      ) : (
        <Link href="/login">
          <Button className="bg-verity-900 text-white hover:bg-verity-800">
            Fazer Login
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      )}
    </motion.div>
  )
}

// ============================================================================
// MAIN CONTENT
// ============================================================================

function InviteContent() {
  const params = useParams()
  const token = params.token as string

  const { refetchUser } = useAuth()
  const {
    validateInvite,
    acceptInvite,
    loading: hookLoading,
    error: hookError
  } = useInvites()

  // State
  const [inviteState, setInviteState] = useState<InviteState>('loading')
  const [inviteData, setInviteData] = useState<ValidateInviteResponse | null>(
    null
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isAutoLoggedIn, setIsAutoLoggedIn] = useState(false)
  const [successOrgName, setSuccessOrgName] = useState<string>('')

  // Form state
  const [form, setForm] = useState<FormState>({
    fullName: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Validate invite on mount
  const doValidation = useCallback(async () => {
    if (!token) {
      setInviteState('invalid')
      return
    }

    try {
      const result = await validateInvite(token)

      if (!result) {
        setInviteState('invalid')
        return
      }

      if (!result.valid) {
        // Determine specific error state
        // The hook returns ValidateInviteResponse which doesn't have status
        // but the backend returns it - we need to check the error message or default to invalid
        setInviteState('invalid')
        return
      }

      setInviteData(result)
      setInviteState('valid')
    } catch (err) {
      console.error('[InvitePage] Validation error:', err)
      setInviteState('error')
    }
  }, [token, validateInvite])

  useEffect(() => {
    doValidation()
  }, [doValidation])

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    // Validate full name (always required for new users)
    const nameValidation = validateName(form.fullName)
    if (!nameValidation.valid) {
      newErrors.fullName = nameValidation.error
    }

    // Validate password
    const passwordValidation = validatePassword(form.password)
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0]
    }

    // Validate confirm password
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  // Handle input change
  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSubmitError(null)

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle input blur
  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      fullName: true,
      password: true,
      confirmPassword: true
    })

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await acceptInvite({
        token,
        password: form.password,
        full_name: form.fullName
      })

      if (!result) {
        setSubmitError(hookError || 'Erro ao aceitar convite. Tente novamente.')
        return
      }

      // Store organization name for success screen
      setSuccessOrgName(inviteData?.organization_name || '')

      // If we got a token, we're authenticated (BFF returns tokens if available)
      if (result.token) {
        // Refetch user to update AuthContext
        try {
          await refetchUser()
          setIsAutoLoggedIn(true)
        } catch (refetchErr) {
          console.warn('[InvitePage] Failed to refetch user:', refetchErr)
          setIsAutoLoggedIn(false)
        }
      } else {
        // Backend just created the user, no auto-login
        setIsAutoLoggedIn(false)
      }

      setIsSuccess(true)
    } catch (err) {
      console.error('[InvitePage] Submit error:', err)
      const message =
        err instanceof Error ? err.message : 'Erro ao aceitar convite'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Password strength
  const passwordStrength = validatePassword(form.password).strength

  // Animation variants
  const inputVariants = {
    focus: { scale: 1.01, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  }

  // Loading state
  if (inviteState === 'loading') {
    return (
      <div className="flex min-h-[600px] flex-col justify-center rounded-2xl border border-verity-100 bg-white p-8 shadow-xl shadow-verity-900/5 lg:p-10">
        <div className="mb-8 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-verity-600" />
          <p className="font-medium text-verity-700">
            Validando seu convite...
          </p>
        </div>
        <InviteSkeleton />
      </div>
    )
  }

  // Error states
  if (inviteState === 'expired') {
    return <ErrorState state="expired" />
  }

  if (inviteState === 'used') {
    return <ErrorState state="used" />
  }

  if (inviteState === 'invalid') {
    return <ErrorState state="invalid" />
  }

  if (inviteState === 'error') {
    return <ErrorState state="error" message={hookError || undefined} />
  }

  // Success state
  if (isSuccess) {
    return (
      <SuccessState
        organizationName={successOrgName || inviteData?.organization_name || ''}
        isAutoLoggedIn={isAutoLoggedIn}
      />
    )
  }

  // Valid invite - show form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.slow }}
      className="rounded-2xl border border-verity-100 bg-white p-8 shadow-xl shadow-verity-900/5 lg:p-10"
    >
      {/* Header */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <motion.h2
          variants={staggerItem}
          className="mb-2 font-display text-3xl font-semibold text-verity-950"
        >
          Aceitar Convite
        </motion.h2>
        <motion.p variants={staggerItem} className="text-verity-700">
          Complete seu cadastro para acessar a plataforma
        </motion.p>
      </motion.div>

      {/* Invite Banner */}
      {inviteData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-ouro-100/50 mb-6 rounded-lg border border-ouro-600/20 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-ouro-600/10">
              <Building2 className="text-ouro-900 h-5 w-5" />
            </div>
            <div>
              <p className="text-ouro-900 mb-0.5 text-sm font-medium">
                {inviteData.organization_name}
              </p>
              <p className="text-ouro-900/70 text-xs">
                Você foi convidado para fazer parte da organização como{' '}
                <span className="font-semibold capitalize">
                  {inviteData.role}
                </span>
                .
              </p>
              <p className="text-ouro-900/60 mt-1 text-xs">
                Email: {inviteData.email}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Auth Error */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name Field */}
        <div className="space-y-1.5">
          <label className="ml-1 block text-sm font-medium text-verity-950">
            Nome Completo
          </label>
          <motion.div whileFocus="focus" variants={inputVariants}>
            <Input
              name="fullName"
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              placeholder="João Silva"
              className={cn(
                'h-12 border-verity-200 bg-verity-50/50 px-4 text-verity-950 transition-all placeholder:text-verity-400/70',
                'focus:border-verity-600 focus:bg-white focus:ring-4 focus:ring-verity-600/10',
                errors.fullName && touched.fullName && 'border-red-300'
              )}
            />
          </motion.div>
          {errors.fullName && touched.fullName && (
            <p className="ml-1 text-xs text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Email Field (Read-only) */}
        {inviteData && (
          <div className="space-y-1.5">
            <label className="ml-1 block text-sm font-medium text-verity-950">
              Email
            </label>
            <Input
              value={inviteData.email}
              readOnly
              disabled
              className="h-12 cursor-not-allowed border-verity-200 bg-verity-100/50 px-4 text-verity-950/70"
            />
            <p className="ml-1 text-xs text-verity-500">
              O email é definido pelo convite e não pode ser alterado.
            </p>
          </div>
        )}

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="ml-1 block text-sm font-medium text-verity-950">
            Criar Senha
          </label>
          <div className="relative">
            <motion.div whileFocus="focus" variants={inputVariants}>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="********"
                className={cn(
                  'h-12 border-verity-200 bg-verity-50/50 px-4 pr-12 text-verity-950 transition-all placeholder:text-verity-400/70',
                  'focus:border-verity-600 focus:bg-white focus:ring-4 focus:ring-verity-600/10',
                  errors.password && touched.password && 'border-red-300'
                )}
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-verity-600 transition-colors hover:text-verity-900"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Strength Meter */}
          {form.password && (
            <PasswordStrengthMeter strength={passwordStrength} />
          )}

          {errors.password && touched.password && (
            <p className="ml-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="ml-1 block text-sm font-medium text-verity-950">
            Confirmar Senha
          </label>
          <div className="relative">
            <motion.div whileFocus="focus" variants={inputVariants}>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={(e) =>
                  handleChange('confirmPassword', e.target.value)
                }
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="********"
                className={cn(
                  'h-12 border-verity-200 bg-verity-50/50 px-4 pr-12 text-verity-950 transition-all placeholder:text-verity-400/70',
                  'focus:border-verity-600 focus:bg-white focus:ring-4 focus:ring-verity-600/10',
                  errors.confirmPassword &&
                    touched.confirmPassword &&
                    'border-red-300'
                )}
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-verity-600 transition-colors hover:text-verity-900"
              aria-label={
                showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="ml-1 text-xs text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="submit"
            disabled={isSubmitting || hookLoading}
            className="h-12 w-full rounded-lg bg-verity-900 text-base font-medium text-white shadow-lg shadow-verity-900/20 transition-all hover:bg-verity-800 hover:shadow-xl hover:shadow-verity-900/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting || hookLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Criando conta...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Aceitar Convite
                <ArrowRight className="h-4 w-4 opacity-50" />
              </span>
            )}
          </Button>
        </motion.div>

        {/* Already have account link */}
        <div className="pt-2 text-center">
          <p className="text-sm text-verity-600">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-medium text-verity-900 underline decoration-verity-900/30 underline-offset-4 transition-all hover:text-verity-800 hover:decoration-verity-900"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </form>
    </motion.div>
  )
}

// ============================================================================
// PAGE WRAPPER
// ============================================================================

export default function InviteAcceptPage() {
  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src={BACKGROUND_IMAGE}
          alt="Paisagem agrícola"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-verity-950/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: durations.slow, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo/Branding */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: durations.normal }}
            className="mb-6 text-center"
          >
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Verity Agro
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Análise Inteligente de CPR
            </p>
          </motion.div>

          <Suspense
            fallback={
              <div className="flex min-h-[600px] flex-col justify-center rounded-2xl border border-verity-100 bg-white p-8 shadow-xl shadow-verity-900/5 lg:p-10">
                <div className="mb-8 text-center">
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-verity-600" />
                  <p className="font-medium text-verity-700">Carregando...</p>
                </div>
                <InviteSkeleton />
              </div>
            }
          >
            <InviteContent />
          </Suspense>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-xs text-white/70"
          >
            &copy; {new Date().getFullYear()} Verity Agro. Todos os direitos
            reservados.
          </motion.p>
        </motion.div>
      </div>
    </>
  )
}
