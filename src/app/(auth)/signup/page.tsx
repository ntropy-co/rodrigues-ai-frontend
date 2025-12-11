'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Mail,
  ArrowRight,
  Info
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuthHook'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useInviteValidation } from '@/hooks/useInviteValidation'
import { validatePassword } from '@/lib/utils/auth-validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { PasswordStrengthMeter } from '@/components/v2/Auth/PasswordStrengthMeter'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

// Skeleton Loader Component
function SignupSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-24 rounded-lg border border-verde-100 bg-verde-50" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-12 rounded-lg bg-verde-50" />
        <div className="h-12 rounded-lg bg-verde-50" />
      </div>
      <div className="h-12 rounded-lg bg-verde-50" />
      <div className="h-12 rounded-lg bg-verde-50" />
      <div className="h-12 rounded-lg bg-verde-50" />
    </div>
  )
}

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('token')

  const { signup, error: authError } = useAuth()
  const {
    invite,
    organization,
    isValid,
    isLoading: isInviteLoading,
    error: inviteError
  } = useInviteValidation(inviteToken)

  const [showPassword, setShowPassword] = useState(false)

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useAuthForm('signup')

  // Auto-fill email from invite
  useEffect(() => {
    if (invite?.email) {
      handleChange('email', invite.email)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invite])

  const onSubmit = async () => {
    if (!inviteToken) return

    try {
      await signup(
        {
          email: values.email,
          password: values.password,
          name: values.name,
          confirmPassword: values.confirmPassword,
          acceptTerms: values.acceptTerms
        },
        inviteToken
      )
      router.push('/chat')
    } catch (err) {
      console.error('Signup failed', err)
    }
  }

  // Animation variants
  const inputVariants = {
    focus: { scale: 1.01, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  }

  // Password strength logic
  const passwordStrength = validatePassword(values.password).strength

  if (isInviteLoading) {
    return (
      <div className="flex min-h-[600px] flex-col justify-center rounded-2xl border border-verde-100 bg-white p-8 shadow-xl shadow-verde-900/5 lg:p-10">
        <div className="mb-8 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-verde-600" />
          <p className="font-medium text-verde-700">Validando seu convite...</p>
        </div>
        <SignupSkeleton />
      </div>
    )
  }

  if (!isValid && !isInviteLoading) {
    return (
      <div className="rounded-2xl border border-verde-100 bg-white p-8 text-center shadow-xl shadow-verde-900/5 lg:p-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="mb-2 font-display text-2xl font-semibold text-verde-950">
          Convite Inválido ou Expirado
        </h2>
        <p className="mb-6 text-verde-700">
          {inviteError ||
            'Não foi possível validar seu convite. Por favor, solicite um novo link ao administrador.'}
        </p>
        <Link href="/login">
          <Button
            variant="outline"
            className="border-verde-200 text-verde-900 hover:bg-verde-50"
          >
            Voltar para Login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="rounded-2xl border border-verde-100 bg-white p-8 shadow-xl shadow-verde-900/5 lg:p-10"
    >
      <div className="mb-6">
        <h2 className="mb-2 font-display text-3xl font-semibold text-verde-950">
          Criar Conta
        </h2>
        <p className="text-verde-700">Complete seu cadastro para acessar</p>
      </div>

      {/* Invite Banner */}
      {organization && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 rounded-lg border border-ouro-600/20 bg-ouro-100/50 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-ouro-600/10">
              <Mail className="h-5 w-5 text-ouro-900" />
            </div>
            <div>
              <p className="mb-0.5 text-sm font-medium text-ouro-900">
                Convite de {organization.name}
              </p>
              <p className="text-xs text-ouro-900/70">
                Você foi convidado como{' '}
                <span className="font-semibold">{invite?.role}</span>.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Auth Error */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{authError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(onSubmit)
        }}
        className="space-y-5"
      >
        {/* Name Field */}
        <div className="space-y-1.5">
          <label className="ml-1 block text-sm font-medium text-verde-950">
            Nome Completo
          </label>
          <motion.div whileFocus="focus" variants={inputVariants}>
            <Input
              name="name"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="João Silva"
              className={cn(
                'h-12 border-verde-200 bg-verde-50/50 px-4 text-verde-950 transition-all placeholder:text-verde-400/70',
                'focus:border-verde-600 focus:bg-white focus:ring-4 focus:ring-verde-600/10',
                errors.name && touched.name && 'border-red-300'
              )}
            />
          </motion.div>
          {errors.name && touched.name && (
            <p className="ml-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email Field (Read-only) */}
        <div className="space-y-1.5">
          <div className="ml-1 flex items-center gap-2">
            <label className="block text-sm font-medium text-verde-950">
              Email corporativo
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 cursor-help text-verde-400" />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="border-verde-800 bg-verde-950 text-xs text-white"
                >
                  O email é definido pelo convite e não pode ser alterado.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            value={values.email}
            readOnly
            disabled
            className="h-12 cursor-not-allowed border-verde-200 bg-verde-100/50 px-4 text-verde-950/70"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="ml-1 block text-sm font-medium text-verde-950">
            Criar Senha
          </label>
          <div className="relative">
            <motion.div whileFocus="focus" variants={inputVariants}>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                className={cn(
                  'h-12 border-verde-200 bg-verde-50/50 px-4 pr-12 text-verde-950 transition-all placeholder:text-verde-400/70',
                  'focus:border-verde-600 focus:bg-white focus:ring-4 focus:ring-verde-600/10',
                  errors.password && touched.password && 'border-red-300'
                )}
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-verde-600 transition-colors hover:text-verde-900"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Strength Meter */}
          {values.password && (
            <PasswordStrengthMeter strength={passwordStrength} />
          )}

          {errors.password && touched.password && (
            <p className="ml-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="ml-1 block text-sm font-medium text-verde-950">
            Confirmar Senha
          </label>
          <motion.div whileFocus="focus" variants={inputVariants}>
            <Input
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="••••••••"
              className={cn(
                'h-12 border-verde-200 bg-verde-50/50 px-4 text-verde-950 transition-all placeholder:text-verde-400/70',
                'focus:border-verde-600 focus:bg-white focus:ring-4 focus:ring-verde-600/10',
                errors.confirmPassword &&
                  touched.confirmPassword &&
                  'border-red-300'
              )}
            />
          </motion.div>
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="ml-1 text-xs text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="ml-1 flex items-start space-x-2 pt-2">
          <Checkbox
            id="terms"
            checked={values.acceptTerms}
            onCheckedChange={(checked) =>
              handleChange('acceptTerms', checked === true)
            }
            className="mt-1 border-verde-300 data-[state=checked]:border-verde-900 data-[state=checked]:bg-verde-900"
          />
          <label
            htmlFor="terms"
            className="cursor-pointer select-none text-sm leading-tight text-verde-700"
          >
            Concordo com os{' '}
            <a href="#" className="underline hover:text-verde-900">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a href="#" className="underline hover:text-verde-900">
              Política de Privacidade
            </a>
            .
          </label>
        </div>
        {errors.acceptTerms && touched.acceptTerms && (
          <p className="ml-1 text-xs text-red-600">{errors.acceptTerms}</p>
        )}

        {/* Submit Button */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="h-12 w-full rounded-lg bg-verde-900 text-base font-medium text-white shadow-lg shadow-verde-900/20 transition-all hover:bg-verde-800 hover:shadow-xl hover:shadow-verde-900/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Criando conta...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Começar a usar
                <ArrowRight className="h-4 w-4 opacity-50" />
              </span>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[600px] flex-col justify-center rounded-2xl border border-verde-100 bg-white p-8 shadow-xl shadow-verde-900/5 lg:p-10">
          <div className="mb-8 text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-verde-600" />
            <p className="font-medium text-verde-700">Carregando...</p>
          </div>
          <SignupSkeleton />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  )
}
