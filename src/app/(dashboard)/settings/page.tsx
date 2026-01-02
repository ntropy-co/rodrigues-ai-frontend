'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { InternalHeader } from '@/components/layout/InternalHeader'
import {
  User,
  Building2,
  CreditCard,
  Shield,
  Bell,
  Palette,
  ArrowRight,
  LogOut,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/features/chat'
import Link from 'next/link'

// =============================================================================
// Components
// =============================================================================

function SettingSection({
  title,
  items
}: {
  title: string
  items: {
    icon: React.ElementType
    label: string
    desc: string
    href: string
    action?: string
  }[]
}) {
  return (
    <div className="mb-10">
      <h3 className="mb-4 px-1 font-display text-lg font-semibold text-verity-950">
        {title}
      </h3>
      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
        {items.map((item, idx) => {
          const Icon = item.icon
          return (
            <Link
              key={idx}
              href={item.href}
              className={`group flex items-center justify-between p-5 transition-colors hover:bg-sand-50 ${
                idx !== items.length - 1 ? 'border-b border-sand-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sand-100 text-verity-600 transition-colors group-hover:bg-verity-100 group-hover:text-verity-800">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-verity-900">{item.label}</h4>
                  <p className="text-sm text-verity-500">{item.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.action && (
                  <span className="text-xs font-medium text-verity-400 group-hover:text-verity-700">
                    {item.action}
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-verity-300 transition-transform group-hover:translate-x-1 group-hover:text-verity-500" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function UserHero() {
  const { user, logout } = useAuth()

  return (
    <div className="mb-10 flex flex-col items-center justify-between gap-6 rounded-3xl bg-verity-950 p-8 text-white shadow-xl sm:flex-row">
      <div className="flex items-center gap-6">
        <Avatar
          email={user?.email || 'User'}
          className="h-20 w-20 text-2xl ring-4 ring-verity-800"
        />
        <div>
          <h2 className="font-display text-2xl font-semibold">{user?.name}</h2>
          <div className="mt-1 flex items-center gap-2 text-verity-300">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{user?.email}</span>
          </div>
          <div className="mt-2 inline-flex items-center rounded-full bg-verity-800 px-3 py-0.5 text-xs font-medium text-verity-100">
            Plano Enterprise
          </div>
        </div>
      </div>

      <Button
        onClick={logout}
        variant="outline"
        className="w-full border-verity-700 bg-verity-900 text-verity-100 transition-colors hover:border-error-900 hover:bg-error-950 hover:text-error-100 sm:w-auto"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Encerrar Sessão
      </Button>
    </div>
  )
}

// =============================================================================
// Page
// =============================================================================

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <InternalHeader
        title="Configurações"
        subtitle="Gerencie seu perfil e preferências da organização."
        backHref="/dashboard"
        containerClassName="max-w-4xl"
      />

      <div className="mx-auto max-w-4xl px-4 pb-20 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* User Hero */}
          <UserHero />

          {/* Sections */}
          <SettingSection
            title="Conta Pessoal"
            items={[
              {
                icon: User,
                label: 'Meu Perfil',
                desc: 'Alterar nome e avatar',
                href: '/settings/profile'
              },
              {
                icon: LockItem,
                label: 'Segurança',
                desc: 'Senha e autenticação 2FA',
                href: '/settings/security',
                action: 'Recomendado'
              },
              {
                icon: Bell,
                label: 'Notificações',
                desc: 'Alertas de e-mail e push',
                href: '/settings/notifications'
              }
            ]}
          />

          <SettingSection
            title="Organização"
            items={[
              {
                icon: Building2,
                label: 'Detalhes da Empresa',
                desc: 'Logo, nome e endereço',
                href: '/settings/organization'
              },
              {
                icon: User,
                label: 'Membros da Equipe',
                desc: 'Gerenciar acessos e permissões',
                href: '/settings/organization/team',
                action: '3 membros'
              },
              {
                icon: CreditCard,
                label: 'Cobrança',
                desc: 'Faturas e método de pagamento',
                href: '/settings/billing'
              },
              {
                icon: Palette,
                label: 'Aparência',
                desc: 'Tema e personalização',
                href: '/settings/appearance'
              }
            ]}
          />
        </motion.div>
      </div>
    </div>
  )
}

// Icon helper
function LockItem({ className }: { className?: string }) {
  return <Shield className={className} />
}
