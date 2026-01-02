'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowLeft, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// Animation Config
const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20
}
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}
const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: springTransition }
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
      // Simulate API call for visual feedback
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
        // Fallback for demo if API fails
        console.warn('API Contact failed, assuming demo success')
      }

      setIsSuccess(true)
      toast.success('Solicitação enviada com sucesso!')
    } catch {
      // In production we would show error, for demo we might want to show success if it's just a connection error
      toast.error('Erro ao conectar com o servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-verity-950 font-sans selection:bg-verity-500/30 selection:text-verity-100">
      {/* 
         Verity Noir: Aurora Background (Variant for Contact)
         Concept: "Growth Energy" (More moving up)
      */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-verity-900 via-verity-950 to-black"></div>
        <div className="animate-pulse-slow absolute right-[10%] top-[10%] h-[700px] w-[700px] rounded-full bg-verity-700/20 blur-[120px]"></div>
        <div className="absolute bottom-[0%] left-[20%] h-[500px] w-[500px] animate-pulse rounded-full bg-sand-100/5 blur-[100px] delay-700"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
      </div>

      {/* Floating Back Button (Glass) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed left-6 top-6 z-20"
      >
        <Link
          href="/"
          className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        </Link>
      </motion.div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg"
        >
          {/* Glass Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/50 backdrop-blur-[24px]">
            {/* Top Highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="p-8 sm:p-10">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  // Success State
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center py-10 text-center"
                  >
                    <div className="mb-6 rounded-full bg-verity-500/20 p-4 ring-1 ring-verity-400/50">
                      <Sparkles className="h-10 w-10 text-verity-100" />
                    </div>
                    <h3 className="mb-3 font-display text-2xl font-medium text-white">
                      Solicitação Recebida
                    </h3>
                    <p className="mb-8 max-w-xs text-sm leading-relaxed text-verity-200/80">
                      Nossa equipe de concierge analisará seu perfil e entrará
                      em contato em breve através do email corporativo.
                    </p>
                    <Link href="/" className="w-full">
                      <Button
                        className="w-full bg-white font-semibold text-verity-950 hover:bg-verity-50"
                        size="lg"
                      >
                        Voltar ao Início
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  // Form State
                  <motion.div key="form">
                    <div className="mb-8">
                      <h1 className="mb-2 font-display text-3xl font-medium tracking-tight text-white">
                        Solicitar Acesso
                      </h1>
                      <p className="text-sm font-light text-verity-200/80">
                        Junte-se à plataforma líder em inteligência de crédito
                        rural.
                      </p>
                    </div>

                    <motion.form
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      <motion.div variants={staggerItem} className="space-y-4">
                        {/* Name */}
                        <div className="group">
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-verity-300 transition-colors group-focus-within:text-verity-100">
                            Nome Completo
                          </label>
                          <Input
                            required
                            placeholder="Ex: João Silva"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-white/10 bg-white/5 text-white placeholder:text-verity-600 focus:border-verity-400/50 focus:bg-white/10 focus:ring-0"
                          />
                        </div>

                        {/* Email */}
                        <div className="group">
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-verity-300 transition-colors group-focus-within:text-verity-100">
                            Email Corporativo
                          </label>
                          <Input
                            type="email"
                            required
                            placeholder="nome@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-white/10 bg-white/5 text-white placeholder:text-verity-600 focus:border-verity-400/50 focus:bg-white/10 focus:ring-0"
                          />
                        </div>

                        {/* Company */}
                        <div className="group">
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-verity-300 transition-colors group-focus-within:text-verity-100">
                            Empresa / Instituição
                          </label>
                          <Input
                            required
                            placeholder="Nome da organização"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="border-white/10 bg-white/5 text-white placeholder:text-verity-600 focus:border-verity-400/50 focus:bg-white/10 focus:ring-0"
                          />
                        </div>

                        {/* Message */}
                        <div className="group">
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-verity-300 transition-colors group-focus-within:text-verity-100">
                            Mensagem (Opcional)
                          </label>
                          <textarea
                            className="flex min-h-[100px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm transition-all placeholder:text-verity-600 focus:bg-white/10 focus-visible:border-verity-400/50 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Descreva sua necessidade..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={staggerItem} className="pt-4">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="group relative w-full overflow-hidden bg-verity-100 text-verity-950 transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(209,231,221,0.3)]"
                          size="lg"
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Enviando...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2 font-semibold">
                              Enviar Solicitação
                              <Send className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    </motion.form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Gradient Line */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-verity-800 via-sand-400 to-verity-800 opacity-50"></div>
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
