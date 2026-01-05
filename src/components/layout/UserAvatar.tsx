'use client'

import { useState } from 'react'
import { Moon, Sun, LogOut, Settings, Shield } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getInitialLetter } from '@/lib/utils/format'
import type { UserRole } from '@/types/auth'

export function UserAvatar() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { user, logout } = useAuth()

  // Função para extrair a primeira letra do nome do usuário
  const getInitial = (): string => {
    return getInitialLetter(user?.name, user?.email)
  }

  // Função de logout com redirect
  const handleLogout = () => {
    logout()
    setIsOpen(false)
    router.push('/login')
  }

  // Check if user is admin
  const isAdmin = user && (user.role as UserRole) === 'admin'

  const menuItems = [
    // Admin Panel - only visible for admins
    ...(isAdmin
      ? [
          {
            icon: Shield,
            label: 'Administração',
            onClick: () => router.push('/admin'),
            className:
              'text-purple-600 hover-hover:bg-purple-50 dark:text-purple-400 dark:hover-hover:bg-purple-950'
          }
        ]
      : []),
    // Settings - now enabled
    {
      icon: Settings,
      label: 'Configurações',
      onClick: () => router.push('/settings')
    },
    {
      icon: theme === 'dark' ? Sun : Moon,
      label: theme === 'dark' ? 'Modo Claro' : 'Modo Escuro',
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark')
    },
    {
      icon: LogOut,
      label: 'Sair',
      onClick: handleLogout,
      className:
        'text-error-600 hover-hover:bg-error-50 dark:text-error-400 dark:hover-hover:bg-error-950'
    }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full bg-verity-900 font-medium text-white shadow-sm transition-all hover:bg-verity-800 hover-hover:shadow-md"
        aria-label="Menu do usuário"
        title={user?.name || user?.email || 'Usuário'}
      >
        {getInitial()}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-64 origin-top-right rounded-2xl border border-sand-200 bg-white/80 shadow-xl shadow-verity-900/5 ring-1 ring-black/5 backdrop-blur-xl duration-200 animate-in fade-in zoom-in-95">
          {/* User Header Info */}
          <div className="border-b border-sand-200/50 px-5 py-4">
            <p className="font-display text-base font-semibold text-verity-900">
              {user?.name || 'Usuário'}
            </p>
            <p className="truncate text-xs text-verity-500">
              {user?.email || 'Sem email'}
            </p>
          </div>

          <div className="p-1.5">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick()
                    setIsOpen(false)
                  }}
                  className={`flex min-h-[40px] w-full items-center gap-3 rounded-xl px-4 py-2 text-left text-sm font-medium transition-all ${
                    item.className ||
                    'text-verity-700 hover:bg-sand-100/80 hover:text-verity-900'
                  }`}
                >
                  <Icon className="h-4 w-4 opacity-70" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Overlay para fechar o dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}
