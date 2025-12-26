'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthForm } from '@/hooks/useAuthForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem, durations } from '@/lib/animations'

// Placeholder for the agriculture background image
const BACKGROUND_IMAGE = '/images/auth-background.jpg'

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
  const shouldReduceMotion = useReducedMotion()

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
    <>
      {/* 
        Z-Index Stack:
        0: Background Image (Fixed, covers viewport)
        1: Dark Overlay (For contrast)
        2: Glass Card (Centered content)
        3: Text and Form Elements
      */}

      {/* Layer 0: Full-screen Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src={BACKGROUND_IMAGE}
          alt="Paisagem agrícola"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Layer 1: Subtle Dark Overlay for Text Contrast */}
        <div className="absolute inset-0 bg-verity-950/40" />
      </div>

      {/* Layer 2 & 3: Centered Glass Card Container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: durations.slow, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* The Glass Card */}
          <div className="glass-panel rounded-2xl p-6 shadow-2xl sm:p-8 lg:p-10">
            {/* Logo/Branding */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: durations.normal }}
              className="mb-8 text-center"
            >
              <h1 className="font-display text-3xl font-semibold tracking-tight text-verity-900 sm:text-4xl">
                Verity Agro
              </h1>
              <p className="mt-1 text-sm text-verity-600">
                Análise Inteligente de CPR
              </p>
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mb-6 text-center"
            >
              <motion.h2
                variants={staggerItem}
                className="font-display text-2xl font-semibold tracking-tight text-verity-950"
              >
                Bem-vindo
              </motion.h2>
              <motion.p
                variants={staggerItem}
                className="mt-1 text-sm text-verity-700"
              >
                Entre com suas credenciais corporativas
              </motion.p>
            </motion.div>

            {/* Auth Error Alert */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 backdrop-blur-sm">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Erro ao entrar
                      </p>
                      <p className="text-sm text-red-700">{authError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <motion.form
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault()
                handleSubmit(onSubmit)
              }}
              className="space-y-5"
            >
              {/* Email Field */}
              <motion.div variants={staggerItem}>
                <label className="mb-2 block text-sm font-medium text-verity-900">
                  Email corporativo
                </label>
                <Input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange('email', e.target.value)
                  }
                  onBlur={() => handleBlur('email')}
                  placeholder="seu.email@empresa.com.br"
                  className={cn(
                    errors.email &&
                      touched.email &&
                      'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                  )}
                />
                {errors.email && touched.email && (
                  <p className="ml-1 mt-1 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div variants={staggerItem}>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-verity-900">
                    Senha
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-verity-700 underline-offset-2 transition-colors hover:text-verity-900 hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={values.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange('password', e.target.value)
                    }
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    className={cn(
                      'pr-12',
                      errors.password &&
                        touched.password &&
                        'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                    )}
                  />
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
                {errors.password && touched.password && (
                  <p className="ml-1 mt-1 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </motion.div>

              {/* Remember Me */}
              <motion.div
                variants={staggerItem}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id="remember"
                  checked={values.rememberMe}
                  onCheckedChange={(checked: boolean) =>
                    handleChange('rememberMe', checked === true)
                  }
                  className="border-verity-300 data-[state=checked]:border-verity-900 data-[state=checked]:bg-verity-900"
                />
                <label
                  htmlFor="remember"
                  className="cursor-pointer select-none text-sm text-verity-700"
                >
                  Manter conectado
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={staggerItem}>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Validando...
                    </span>
                  ) : (
                    'Entrar na plataforma'
                  )}
                </Button>
              </motion.div>

              {/* Signup CTA */}
              <motion.div variants={staggerItem}>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-verity-200/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="bg-white/60 px-4 text-verity-500 backdrop-blur-sm rounded-full">
                      Ainda não tem conta?
                    </span>
                  </div>
                </div>

                <p className="text-center text-sm text-verity-700">
                  O acesso é exclusivo para convidados.{' '}
                  <Link
                    href="/contact"
                    className="font-medium text-verity-900 underline decoration-verity-900/30 underline-offset-4 transition-all hover:text-verity-800 hover:decoration-verity-900"
                  >
                    Solicitar acesso
                  </Link>
                </p>
              </motion.div>
            </motion.form>
          </div>

          {/* Footer Text (Outside Glass Card) */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-xs text-white/70"
          >
            © {new Date().getFullYear()} Verity Agro. Todos os direitos reservados.
          </motion.p>
        </motion.div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-verity-900">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
