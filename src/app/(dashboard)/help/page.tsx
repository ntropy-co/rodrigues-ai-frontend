'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { InternalHeader } from '@/components/v2/Header/InternalHeader'
import {
  Search,
  BookOpen,
  MessageSquare,
  FileText,
  ShieldCheck,
  Video,
  ArrowRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// =============================================================================
// Animations
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100 }
  }
}

// =============================================================================
// Components
// =============================================================================

function HelpCard({
  icon: Icon,
  title,
  description,
  href
}: {
  icon: React.ElementType
  title: string
  description: string
  href: string
  delay?: number
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 shadow-sm transition-all hover:border-verity-200 hover:shadow-lg hover:shadow-verity-900/5"
    >
      <Link href={href} className="absolute inset-0 z-10" />

      {/* Icon */}
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sand-100 text-verity-700 transition-colors group-hover:bg-verity-50 group-hover:text-verity-900">
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <h3 className="mb-2 font-display text-lg font-semibold text-verity-900">
        {title}
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-verity-600">
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center text-xs font-medium text-verity-500 transition-colors group-hover:text-verity-800">
        Saiba mais
        <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
      </div>

      {/* Decorative Gradient */}
      <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-verity-50/50 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
    </motion.div>
  )
}

function ContactSupportCard() {
  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-3xl bg-verity-900 p-8 text-white shadow-xl"
    >
      {/* Background Effects */}
      <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-verity-800/50 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-verity-500/20 blur-3xl" />

      <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md">
          <div className="mb-4 inline-flex items-center rounded-full border border-verity-700 bg-verity-800/50 px-3 py-1 text-xs font-medium text-verity-100 backdrop-blur-md">
            <span className="relative mr-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Suporte Premium Ativo
          </div>
          <h2 className="mb-2 font-display text-2xl font-semibold">
            Precisa de ajuda especializada?
          </h2>
          <p className="text-verity-200/80">
            Nossa equipe de especialistas em crédito agro está pronta para
            auxiliar em casos complexos ou dúvidas sobre a plataforma.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-white text-verity-950 hover:bg-sand-50"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Falar com Consultor
            </Button>
          </Link>
          <Link href="mailto:suporte@verity.agro">
            <Button
              size="lg"
              variant="outline"
              className="border-verity-700 bg-transparent text-verity-100 hover:bg-verity-800"
            >
              Enviar Email
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// Page
// =============================================================================

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-sand-50">
      <InternalHeader
        title="Central de Ajuda"
        subtitle="Tutoriais, guias e suporte técnico."
        backHref="/dashboard"
        containerClassName="max-w-6xl"
      />

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6">
        {/* Search Hero */}
        <section className="relative mb-12 overflow-hidden rounded-3xl border border-sand-200 bg-white px-6 py-12 text-center shadow-sm sm:px-12">
          {/* Background Texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(#1A3C30 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="mb-6 font-display text-3xl font-medium text-verity-900">
              Como podemos ajudar hoje?
            </h2>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-verity-400" />
              </div>
              <Input
                type="search"
                placeholder="Busque por artigos, tutoriais ou termos (ex: 'Como criar CPR')"
                className="h-14 w-full rounded-2xl border-sand-300 bg-sand-50 pl-12 text-lg shadow-inner transition-all focus:border-verity-500 focus:bg-white focus:ring-4 focus:ring-verity-500/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-verity-600">
              <span className="text-verity-400">Sugestões:</span>
              <button className="rounded-lg bg-sand-100 px-3 py-1 hover:bg-sand-200">
                Criar Nova CPR
              </button>
              <button className="rounded-lg bg-sand-100 px-3 py-1 hover:bg-sand-200">
                Integração Cartório
              </button>
              <button className="rounded-lg bg-sand-100 px-3 py-1 hover:bg-sand-200">
                Assinatura Digital
              </button>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-verity-950">
              Navegar por Tópicos
            </h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <HelpCard
              icon={BookOpen}
              title="Primeiros Passos"
              description="Guia essencial para configurar sua conta e entender o fluxo básico da Verity."
              href="#"
            />
            <HelpCard
              icon={FileText}
              title="Gestão de CPRs"
              description="Aprenda a criar, editar, monitorar e registrar suas Cédulas de Produto Rural."
              href="#"
            />
            <HelpCard
              icon={ShieldCheck}
              title="Segurança e Compliance"
              description="Entenda como protegemos seus dados e garantimos conformidade jurídica."
              href="#"
            />
            <HelpCard
              icon={Video}
              title="Tutoriais em Vídeo"
              description="Assista a demonstrações passo-a-passo das principais funcionalidades."
              href="#"
            />
            <HelpCard
              icon={HelpCircle}
              title="FAQ"
              description="Perguntas frequentes sobre planos, funcionalidades e integrações."
              href="#"
            />
            <HelpCard
              icon={ExternalLink}
              title="API & Desenvolvedores"
              description="Documentação técnica para integrar o Verity ao seu ERP."
              href="#"
            />
          </div>
        </motion.section>

        {/* Contact Banner */}
        <ContactSupportCard />
      </div>
    </div>
  )
}
