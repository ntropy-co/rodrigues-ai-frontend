'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  KeyRound,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuthHook'
import { useAuthForm } from '@/hooks/useAuthForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const { requestPasswordReset, error: authError } = useAuth()
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useAuthForm('forgot-password')

  const onSubmit = async () => {
    try {
      await requestPasswordReset(values.email)
      setIsSuccess(true)
    } catch (err) {
      console.error('Reset request failed', err)
    }
  }

  // Animation variants
  const inputVariants = {
    focus: { scale: 1.01, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  }

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
          Email Enviado
        </h2>
        <p className="mx-auto mb-8 max-w-xs text-verity-700">
          Enviamos as instruções de recuperação para{' '}
          <strong>{values.email}</strong>. Verifique sua caixa de entrada e
          spam.
        </p>

        <Link href="/login">
          <Button className="h-12 w-full rounded-lg bg-verity-900 font-medium text-white hover:bg-verity-800">
            Voltar para o Login
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
          <KeyRound className="h-8 w-8 text-verity-800" />
        </div>

        <h2 className="mb-2 font-display text-3xl font-semibold text-verity-950">
          Recuperar Senha
        </h2>
        <p className="text-verity-700">
          Digite seu email corporativo para receber as instruções
        </p>
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
        className="space-y-6"
      >
        <div className="space-y-1.5">
          <label className="ml-1 block text-sm font-medium text-verity-950">
            Email corporativo
          </label>
          <motion.div whileFocus="focus" variants={inputVariants}>
            <Input
              type="email"
              name="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="seu.email@empresa.com.br"
              className={cn(
                'h-12 border-verity-200 bg-verity-50/50 px-4 text-verity-950 transition-all placeholder:text-verity-400/70',
                'focus:border-verity-600 focus:bg-white focus:ring-4 focus:ring-verity-600/10',
                errors.email && touched.email && 'border-red-300'
              )}
            />
          </motion.div>
          {errors.email && touched.email && (
            <p className="ml-1 text-xs text-red-600">{errors.email}</p>
          )}
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
                Enviando...
              </span>
            ) : (
              'Enviar instruções'
            )}
          </Button>
        </motion.div>

        <Link href="/login">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-verity-700 hover:bg-verity-50 hover:text-verity-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o login
          </Button>
        </Link>
      </form>
    </motion.div>
  )
}
