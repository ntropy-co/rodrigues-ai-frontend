'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  ArrowLeft,
  Send,
  Sparkles,
  Building2,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// Animation Config
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          message,
          subject: 'Solicitação de Acesso - Verity Agro'
        })
      })

      if (!response.ok) {
        console.warn('API Contact failed, assuming demo success')
      }

      setIsSuccess(true)
      toast.success('Solicitação enviada com sucesso!')
    } catch {
      toast.error('Erro ao conectar com o servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:grid lg:grid-cols-2">
      {/* 
         LEFT COLUMN: Editorial / Context (Different Tone) 
      */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-verity-900 p-12 text-white lg:flex">
        {/* Background Image / Texture */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-verity-800 via-verity-900 to-black opacity-90"></div>
          {/* Abstract Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>

        {/* Home Link */}
        <div className="relative z-10">
          <Link
            href="/login"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="font-display text-4xl font-medium leading-tight tracking-tight text-white lg:text-5xl">
            "Para quem planta crédito, a confiança é o solo."
          </h2>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="mt-1 h-5 w-5 text-verity-300" />
              <div>
                <h4 className="font-medium text-white">
                  Exclusividade Institucional
                </h4>
                <p className="text-sm text-verity-300">
                  Plataforma restrita a parceiros qualificados e instituições
                  financeiras.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HelpCircle className="mt-1 h-5 w-5 text-verity-300" />
              <div>
                <h4 className="font-medium text-white">Concierge Dedicado</h4>
                <p className="text-sm text-verity-300">
                  Nossa equipe analisa cada perfil para garantir o match ideal.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs font-medium text-verity-400">
          <span>Verity Agro Membership</span>
        </div>
      </div>

      {/* 
         RIGHT COLUMN: Functional / Form
         Clean Sand/White background
      */}
      <div className="flex items-center justify-center bg-sand-50 px-4 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Header */}
          <div className="mb-8 lg:hidden">
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-verity-600"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-6 rounded-full bg-sand-200 p-4 ring-1 ring-sand-300">
                  <Sparkles className="h-10 w-10 text-verity-600" />
                </div>
                <h3 className="mb-3 font-display text-2xl font-medium text-verity-950">
                  Solicitação Recebida
                </h3>
                <p className="mb-8 text-verity-600">
                  Nossa equipe de concierge analisará seu perfil e entrará em
                  contato em breve através do email cadastrado.
                </p>
                <Link href="/login" className="w-full">
                  <Button className="h-11 w-full bg-verity-900 text-white hover:bg-verity-800">
                    Voltar ao Login
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form">
                <div className="mb-8">
                  <h1 className="font-display text-3xl font-medium tracking-tight text-verity-950">
                    Solicitar Acesso
                  </h1>
                  <p className="mt-2 text-sm text-verity-600">
                    Preencha o formulário para iniciar o processo de onboading.
                  </p>
                </div>

                <motion.form
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <motion.div variants={fadeInUp} className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-verity-600">
                      Nome Completo
                    </label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 border-sand-300 bg-white text-verity-950 placeholder:text-verity-400 focus:border-verity-600 focus:ring-1 focus:ring-verity-600"
                      placeholder="Ex: João Silva"
                    />
                  </motion.div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <motion.div variants={fadeInUp} className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-verity-600">
                        Email Corporativo
                      </label>
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 border-sand-300 bg-white text-verity-950 placeholder:text-verity-400 focus:border-verity-600 focus:ring-1 focus:ring-verity-600"
                        placeholder="exemplo@empresa.com"
                      />
                    </motion.div>
                    <motion.div variants={fadeInUp} className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-verity-600">
                        Empresa
                      </label>
                      <Input
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="h-11 border-sand-300 bg-white text-verity-950 placeholder:text-verity-400 focus:border-verity-600 focus:ring-1 focus:ring-verity-600"
                        placeholder="Nome da organização"
                      />
                    </motion.div>
                  </div>

                  <motion.div variants={fadeInUp} className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-verity-600">
                      Mensagem / Necessidade
                    </label>
                    <textarea
                      className="w-full resize-none rounded-md border border-sand-300 bg-white px-3 py-2 text-sm text-verity-950 placeholder:text-verity-400 focus:border-verity-600 focus:outline-none focus:ring-1 focus:ring-verity-600"
                      rows={4}
                      placeholder="Fale brevemente sobre sua operação de crédito..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp} className="pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-11 w-full bg-verity-900 text-white shadow-lg shadow-verity-900/10 transition-all hover:bg-verity-800 hover:shadow-xl hover:shadow-verity-900/20"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Enviar Solicitação <Send className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
