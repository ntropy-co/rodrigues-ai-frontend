'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthForm } from '@/features/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

// Animation Configurations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

function getSafeRedirectPath(value: string | null): string | null {
  if (!value) return null
  if (!value.startsWith('/')) return null
  if (value.startsWith('//')) return null
  if (value.includes('\\')) return null

  try {
    const url = new URL(value, 'http://localhost')
    if (url.origin !== 'http://localhost') return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const redirect = getSafeRedirectPath(searchParams.get('redirect')) || '/chat'

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useAuthForm('login')

  const onSubmit = async () => {
    try {
      setAuthError(null)
      await login(values.email, values.password)
      router.push(redirect)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      setAuthError(message)
      console.error('Login failed', err)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:grid lg:grid-cols-2">
      {/* 
         LEFT COLUMN: Editorial / Brand
         Deep Verity Green with high-end texture/image
      */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-verity-950 p-12 text-white lg:flex">
        {/* Background Image / Texture */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-verity-900 via-verity-950 to-black opacity-80"></div>
          {/* Subtle Grid for Tech feel */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>
          {/* Abstract Organic Shape (Aurora) */}
          <div className="animate-pulse-slow absolute -left-[20%] top-[20%] h-[800px] w-[800px] rounded-full bg-verity-800/30 blur-[120px]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md">
            <span className="font-display text-2xl font-bold">V</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="font-display text-4xl font-medium leading-tight tracking-tight text-white lg:text-5xl">
            "A inteligência que transforma dados em colheita."
          </h2>
          <p className="mt-4 text-lg font-light text-verity-200">
            A plataforma definitiva para análise de crédito e risco no
            agronegócio.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs font-medium text-verity-400">
          <span>© 2026 Verity Agro Intelligence</span>
          <span className="h-1 w-1 rounded-full bg-verity-600"></span>
          <span>São Paulo • Mato Grosso • Goiás</span>
        </div>
      </div>

      {/* 
         RIGHT COLUMN: Functional / Form
         Clean Sand/White background for maximum clarity
      */}
      <div className="flex items-center justify-center bg-sand-50 px-4 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm space-y-8">
          {/* Mobile Header (Only visible on small screens) */}
          <div className="lg:hidden">
            <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-verity-900 text-white">
              <span className="font-display text-xl font-bold">V</span>
            </div>
            <h1 className="font-display text-3xl font-medium text-verity-950">
              Verity Agro
            </h1>
          </div>

          <div className="hidden lg:block">
            <h1 className="font-display text-3xl font-medium tracking-tight text-verity-950">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 text-sm text-verity-600">
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 p-3 text-error-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-600" />
                  <p className="text-sm font-medium">{authError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(onSubmit)
            }}
            className="space-y-5"
          >
            {/* Email */}
            <motion.div variants={fadeInUp} className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-verity-600">
                Email Corporativo
              </label>
              <Input
                type="email"
                name="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="nome@empresa.com"
                className={cn(
                  'h-11 border-sand-300 bg-white text-verity-950 placeholder:text-verity-400 focus:border-verity-600 focus:ring-1 focus:ring-verity-600',
                  errors.email &&
                    touched.email &&
                    'border-error-300 focus:border-error-500 focus:ring-error-500'
                )}
              />
              {errors.email && touched.email && (
                <p className="text-xs text-error-600">{errors.email}</p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={fadeInUp} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-verity-600">
                  Senha
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-verity-600 hover:text-verity-900 hover:underline"
                >
                  Esqueceu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={cn(
                    'h-11 border-sand-300 bg-white pr-10 text-verity-950 placeholder:text-verity-400 focus:border-verity-600 focus:ring-1 focus:ring-verity-600',
                    errors.password &&
                      touched.password &&
                      'border-error-300 focus:border-error-500 focus:ring-error-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-verity-400 hover:text-verity-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-xs text-error-600">{errors.password}</p>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id="remember"
                checked={values.rememberMe}
                onCheckedChange={(c) => handleChange('rememberMe', c === true)}
                className="border-verity-300 data-[state=checked]:bg-verity-900 data-[state=checked]:text-white"
              />
              <label
                htmlFor="remember"
                className="cursor-pointer select-none text-sm font-medium text-verity-700"
              >
                Manter conectado
              </label>
            </motion.div>

            {/* Submit */}
            <motion.div variants={fadeInUp} className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full bg-verity-900 text-white shadow-lg shadow-verity-900/10 transition-all hover:bg-verity-800 hover:shadow-xl hover:shadow-verity-900/20"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Acessar Plataforma <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.form>

          <p className="text-center text-sm text-verity-600">
            Não tem acesso?{' '}
            <Link
              href="/contact"
              className="font-semibold text-verity-900 hover:underline"
            >
              Solicitar convite
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-sand-50">
          <Loader2 className="h-6 w-6 animate-spin text-verity-900" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
