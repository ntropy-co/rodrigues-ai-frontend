'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthForm } from '@/hooks/useAuthForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

// Animation Configurations (Spring Physics)
const springTransition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  mass: 1
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

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: springTransition }
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
    <div className="relative min-h-screen w-full overflow-hidden bg-verity-950 font-sans selection:bg-verity-500/30 selection:text-verity-100">
      {/* 
        Verity Noir: Aurora Background 
        Concept: "Financial Northern Lights"
      */}
      <div className="absolute inset-0 z-0">
        {/* Deep Field Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-verity-900 via-verity-950 to-black"></div>

        {/* Animated Aurora Orbs */}
        <div className="animate-pulse-slow absolute -left-[10%] -top-[20%] h-[800px] w-[800px] rounded-full bg-verity-800/20 blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] h-[600px] w-[600px] animate-pulse rounded-full bg-verity-500/10 blur-[100px] delay-1000"></div>

        {/* Grid Texture Overlay (Subtle Tech Feel) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Apple ease
          className="w-full max-w-md"
        >
          {/* Glass Card: Frosted Crystal */}
          {/* border-white/5 for subtle edge, bg-white/5 for body */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/50 backdrop-blur-[24px]">
            {/* Top Highlight Gradient */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="p-8 sm:p-10">
              {/* Branding */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-verity-500/20 text-verity-100 ring-1 ring-white/10 backdrop-blur-md">
                  <span className="font-display text-2xl font-bold">V</span>
                </div>
                <h1 className="text-shadow-sm font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
                  Verity Agro
                </h1>
                <p className="mt-2 text-sm font-light text-verity-200/80">
                  Inteligência Financeira para o Campo
                </p>
              </motion.div>

              {/* Error Alert */}
              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 backdrop-blur-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p className="text-sm font-medium">{authError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
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
                <motion.div variants={staggerItem} className="group">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-verity-300 transition-colors group-focus-within:text-verity-100">
                    Email Corporativo
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="nome@empresa.com" // Placeholder
                    // Dark theme input styles
                    className={cn(
                      'border-white/10 bg-white/5 text-white placeholder:text-verity-500 focus:border-verity-400/50 focus:bg-white/10 focus:ring-0',
                      errors.email &&
                        touched.email &&
                        'border-red-500/50 bg-red-900/10'
                    )}
                  />
                  {errors.email && touched.email && (
                    <p className="mt-1 text-xs text-red-300">{errors.email}</p>
                  )}
                </motion.div>

                {/* Password */}
                <motion.div variants={staggerItem} className="group">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium uppercase tracking-wider text-verity-300 transition-colors group-focus-within:text-verity-100">
                      Senha
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-verity-400 transition-colors hover:text-white hover:underline"
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
                        'border-white/10 bg-white/5 pr-10 text-white placeholder:text-verity-500 focus:border-verity-400/50 focus:bg-white/10 focus:ring-0',
                        errors.password &&
                          touched.password &&
                          'border-red-500/50 bg-red-900/10'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-verity-500 transition-colors hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-1 text-xs text-red-300">
                      {errors.password}
                    </p>
                  )}
                </motion.div>

                {/* Actions */}
                <motion.div
                  variants={staggerItem}
                  className="flex items-center justify-between pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={values.rememberMe}
                      onCheckedChange={(c) =>
                        handleChange('rememberMe', c === true)
                      }
                      className="border-verity-500 data-[state=checked]:bg-verity-400 data-[state=checked]:text-verity-950"
                    />
                    <label
                      htmlFor="remember"
                      className="cursor-pointer select-none text-sm text-verity-300"
                    >
                      Manter conectado
                    </label>
                  </div>
                </motion.div>

                {/* Submit Button (Champagne Gold Touch or Verity Green?) 
                    Decision: Use Verity Green Light for button to pop against dark bg 
                */}
                <motion.div variants={staggerItem} className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full overflow-hidden bg-verity-100 text-verity-950 transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(209,231,221,0.3)]"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Validando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 font-semibold">
                        Acessar Plataforma
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </motion.div>

                {/* Secondary CTA */}
                <motion.div variants={staggerItem} className="pt-4 text-center">
                  <p className="text-sm text-verity-400">
                    Acesso exclusivo para convidados. <br />
                    <Link
                      href="/contact"
                      className="mt-1 inline-block font-medium text-verity-200 transition-colors hover:text-white"
                    >
                      Solicitar acesso →
                    </Link>
                  </p>
                </motion.div>
              </motion.form>
            </div>

            {/* Bottom Gradient Line */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-verity-800 via-verity-400 to-verity-800 opacity-50"></div>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center text-xs font-medium text-verity-600/50"
          >
            © {new Date().getFullYear()} Verity Agro Intelligence
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-verity-950">
          <Loader2 className="h-6 w-6 animate-spin text-verity-500" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
