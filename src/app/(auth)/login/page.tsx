'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthForm } from '@/hooks/useAuthForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  luxuryVariants,
  staggerContainer,
  staggerItem,
  easings,
  durations
} from '@/lib/animations'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const redirect = searchParams.get('redirect') || '/chat'
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

  const inputVariants = {
    focus: { scale: 1.01, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Lado Esquerdo - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: durations.verySlow,
          ease: easings.butter
        }}
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-verde-900 via-verde-800 to-verde-900 p-12 lg:flex"
      >
        {/* Pattern animado de fundo */}
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={
            shouldReduceMotion
              ? {}
              : {
                  backgroundPosition: ['0% 0%', '100% 100%']
                }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Logo com float suave */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [-2, 2, -2]
                }
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: easings.silk
          }}
          className="relative z-10"
        >
          <div className="mb-8 flex items-center gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
                Verity Agro
              </h1>
              <p className="font-sans text-sm font-light text-verde-100">
                Análise Inteligente de CPR
              </p>
            </div>
          </div>
        </motion.div>

        {/* Título principal */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-lg"
        >
          <motion.h2
            variants={staggerItem}
            className="mb-6 font-display text-4xl font-semibold leading-tight tracking-tight text-white lg:text-5xl"
          >
            Análise de crédito rural com inteligência artificial
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="mb-8 font-sans text-lg font-light leading-relaxed text-verde-100"
          >
            Decisões mais rápidas e seguras para operações de CPR, com
            conformidade regulatória garantida.
          </motion.p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: durations.slow }}
          className="relative z-10"
        ></motion.div>
      </motion.div>

      {/* Lado Direito - Formulário */}
      <div className="bg-bege flex flex-1 items-center justify-center p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={luxuryVariants}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-verde-100 bg-white p-8 shadow-xl shadow-verde-900/5 lg:p-10">
            {/* Header */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              <motion.h2
                variants={staggerItem}
                className="mb-2 font-display text-3xl font-semibold tracking-tight text-verde-950"
              >
                Bem-vindo
              </motion.h2>
              <motion.p
                variants={staggerItem}
                className="font-sans font-light text-verde-700"
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
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
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

            {/* Formulário */}
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
              <motion.div variants={staggerItem}>
                <label className="mb-2 block font-sans text-sm font-medium text-verde-950">
                  Email corporativo
                </label>
                <motion.div whileFocus="focus" variants={inputVariants}>
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
                      'h-12 w-full rounded-lg border-2 border-verde-200 bg-white px-4 font-sans text-verde-950 transition-all duration-300 placeholder:text-verde-400 focus:border-verde-600 focus:ring-4 focus:ring-verde-600/10',
                      errors.email &&
                        touched.email &&
                        'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                    )}
                  />
                </motion.div>
                {errors.email && touched.email && (
                  <p className="ml-1 mt-1 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </motion.div>

              <motion.div variants={staggerItem}>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block font-sans text-sm font-medium text-verde-950">
                    Senha
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-verde-700 underline-offset-2 transition-colors hover:text-verde-900 hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <motion.div whileFocus="focus" variants={inputVariants}>
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
                        'h-12 w-full rounded-lg border-2 border-verde-200 bg-white px-4 pr-12 font-sans text-verde-950 transition-all duration-300 placeholder:text-verde-400 focus:border-verde-600 focus:ring-4 focus:ring-verde-600/10',
                        errors.password &&
                          touched.password &&
                          'border-red-300 focus:border-red-500 focus:ring-red-500/10'
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
                  className="border-verde-300 data-[state=checked]:border-verde-900 data-[state=checked]:bg-verde-900"
                />
                <label
                  htmlFor="remember"
                  className="cursor-pointer select-none font-sans text-sm text-verde-700"
                >
                  Manter conectado
                </label>
              </motion.div>

              <motion.div variants={staggerItem}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-lg bg-verde-900 font-sans text-base font-medium text-white shadow-lg shadow-verde-900/20 transition-all duration-300 hover:bg-verde-800 hover:shadow-xl hover:shadow-verde-900/30"
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
              </motion.div>

              <motion.div variants={staggerItem}>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-verde-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider">
                    <span className="bg-white px-4 font-medium text-verde-500">
                      Ainda não tem conta?
                    </span>
                  </div>
                </div>

                <p className="text-center font-sans text-sm text-verde-700">
                  O acesso é exclusivo para convidados.{' '}
                  <Link
                    href="/contact"
                    className="font-medium text-verde-900 underline decoration-verde-900/30 underline-offset-4 transition-all hover:text-verde-800 hover:decoration-verde-900"
                  >
                    Solicitar acesso
                  </Link>
                </p>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-bege flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-verde-900" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
