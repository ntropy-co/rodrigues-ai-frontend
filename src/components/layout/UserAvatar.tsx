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
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-background shadow-lg">
          <div className="py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick()
                    setIsOpen(false)
                  }}
                  className={`flex min-h-[44px] w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                    item.className || 'text-foreground hover-hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
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
