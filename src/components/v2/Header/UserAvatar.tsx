'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Moon, Sun, LogOut, Info } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'

export function UserAvatar() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Get user initial (first letter of name or email)
  const getUserInitial = () => {
    if (!user) return 'U'

    if (user.full_name && user.full_name.trim()) {
      return user.full_name.trim()[0].toUpperCase()
    }

    if (user.email) {
      return user.email[0].toUpperCase()
    }

    return 'U'
  }

  const menuItems = [
    {
      icon: Settings,
      label: 'Configurações',
      onClick: () => console.log('Configurações')
    },
    {
      icon: theme === 'dark' ? Sun : Moon,
      label: theme === 'dark' ? 'Modo Claro' : 'Modo Escuro',
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark')
    },
    {
      icon: Info,
      label: 'Sobre',
      onClick: () => console.log('Sobre')
    },
    {
      icon: LogOut,
      label: 'Sair',
      onClick: handleLogout,
      className: 'text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20'
    }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium shadow-sm hover:shadow-md transition-shadow"
        title={user?.full_name || user?.email || 'Usuário'}
      >
        {getUserInitial()}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg bg-card border border-border shadow-lg">
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
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                    item.className || 'text-foreground hover:bg-muted'
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
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}