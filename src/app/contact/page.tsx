'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { durations } from '@/lib/animations'
import { useContact } from '@/hooks/useContact'

// Reuse the existing background image constant
const BACKGROUND_IMAGE = '/images/auth-background.jpg'

export default function ContactPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })

  const { loading, error, submitContact } = useContact()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await submitContact({
      name: formData.name,
      email: formData.email,
      subject: `Solicitação de acesso - ${formData.company}`,
      message: formData.message
    })

    if (result.success) {
      setIsSuccess(true)
    }
  }

  return (
    <>
      {/* Background Layer */}
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

      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: durations.slow, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="glass-panel rounded-2xl p-6 shadow-2xl sm:p-8 lg:p-10">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-verity-900 sm:text-3xl">
                Solicitar Acesso
              </h1>
              <p className="mt-1 text-sm text-verity-600">
                Preencha o formulário abaixo para entrar em contato com nossa
                equipe.
              </p>
            </div>

            {isSuccess ? (
              // Success State
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-verity-900">
                  Solicitação Enviada!
                </h3>
                <p className="mb-6 text-sm text-verity-600">
                  Nossa equipe analisará sua solicitação e entrará em contato em
                  breve através do email fornecido.
                </p>
                <Link href="/login" className="w-full">
                  <Button className="w-full" size="lg">
                    Voltar para Login
                  </Button>
                </Link>
              </motion.div>
            ) : (
              // Form State
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-verity-900">
                    Nome Completo
                  </label>
                  <Input
                    required
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-verity-900">
                    Email Corporativo
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="nome@empresa.com.br"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-verity-900">
                    Empresa
                  </label>
                  <Input
                    required
                    placeholder="Nome da sua empresa"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-verity-900">
                    Mensagem
                  </label>
                  <textarea
                    required
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descreva seu interesse na plataforma..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Solicitação'
                  )}
                </Button>

                <div className="mt-4 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-xs font-medium text-verity-600 hover:text-verity-900"
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Voltar para o login
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Footer Text */}
          <p className="mt-6 text-center text-xs text-white/70">
            © {new Date().getFullYear()} Verity Agro. Todos os direitos
            reservados.
          </p>
        </motion.div>
      </div>
    </>
  )
}
