'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LockKeyhole,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { resetPassword } from '@/lib/auth/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { cn } from '@/lib/utils'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    if (password !== confirmPassword) {
      setAuthError('As senhas não coincidem')
      return
    }

    if (!token) {
      setAuthError('Token inválido ou ausente')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword({ token, password })
      setIsSuccess(true)
      // Redirect handled by user click or auto (optional)
      setTimeout(() => router.push('/login'), 5000)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao redefinir senha'
      setAuthError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants
  const inputVariants = {
    focus: { scale: 1.01, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  }

  // Invalid Token State
  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-error-100 bg-white p-8 text-center shadow-xl shadow-error-900/5 lg:p-10"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-50">
          <AlertCircle className="h-8 w-8 text-error-600" />
        </div>
        <h2 className="mb-2 font-display text-2xl font-semibold text-error-950">
          Link Inválido
        </h2>
        <p className="mx-auto mb-8 max-w-xs text-error-700">
          Este link de redefinição de senha é inválido ou expirou.
        </p>
        <Link href="/forgot-password">
          <Button className="h-12 w-full rounded-lg bg-error-900 font-medium text-white hover:bg-error-800">
            Solicitar Novo Link
          </Button>
        </Link>
      </motion.div>
    )
  }

  // Success State
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-verity-100 bg-white p-8 text-center shadow-xl shadow-verity-900/5 lg:p-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-verity-100"
        >
          <CheckCircle className="h-8 w-8 text-verity-600" />
        </motion.div>

        <h2 className="mb-2 font-display text-2xl font-semibold text-verity-950">
          Senha Redefinida!
        </h2>
        <p className="mx-auto mb-8 max-w-xs text-verity-700">
          Sua senha foi atualizada com sucesso. Você será redirecionado em
          instantes.
        </p>

        <Link href="/login">
          <Button className="h-12 w-full rounded-lg bg-verity-900 font-medium text-white hover:bg-verity-800">
            Ir para Login Agora
          </Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="rounded-2xl border border-verity-100 bg-white p-8 shadow-xl shadow-verity-900/5 lg:p-10"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-verity-50 shadow-inner">
          <LockKeyhole className="h-8 w-8 text-verity-800" />
        </div>

        <h2 className="mb-2 font-display text-3xl font-semibold text-verity-950">
          Nova Senha
        </h2>
        <p className="text-verity-700">Defina sua nova senha de acesso</p>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-error-600" />
              <p className="text-sm text-error-700">{authError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password */}
        <div className="space-y-1.5">
          <label className="ml-1 block text-sm font-medium text-verity-950">
            Nova Senha
          </label>
          <div className="relative">
            <motion.div whileFocus="focus" variants={inputVariants}>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="h-12 border-verity-200 bg-verity-50/50 px-4 pr-12 text-verity-950 transition-all placeholder:text-verity-400/70 focus:border-verity-600 focus:bg-white focus:ring-4 focus:ring-verity-600/10"
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-verity-600 transition-colors hover:text-verity-900"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="ml-1 text-xs text-verity-600">Mínimo de 8 caracteres</p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="ml-1 block text-sm font-medium text-verity-950">
            Confirmar Senha
          </label>
          <div className="relative">
            <motion.div whileFocus="focus" variants={inputVariants}>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="h-12 border-verity-200 bg-verity-50/50 px-4 pr-12 text-verity-950 transition-all placeholder:text-verity-400/70 focus:border-verity-600 focus:bg-white focus:ring-4 focus:ring-verity-600/10"
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-verity-600 transition-colors hover:text-verity-900"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-lg bg-verity-900 text-base font-medium text-white shadow-lg shadow-verity-900/20 transition-all hover:bg-verity-800 hover:shadow-xl hover:shadow-verity-900/30"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Redefinindo...
              </span>
            ) : (
              'Redefinir Senha'
            )}
          </Button>
        </motion.div>

        <Link href="/login">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-verity-700 hover:bg-verity-50 hover:text-verity-900"
          >
            Voltar para o login
          </Button>
        </Link>
      </form>
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-verity-900" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
