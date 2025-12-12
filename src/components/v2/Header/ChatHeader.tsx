'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, Settings, HelpCircle, LogOut, PanelRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar } from '@/components/Avatar'
import { useLayoutStore } from '@/stores/layoutStore'
import { useAuth } from '@/contexts/AuthContext'

export function ChatHeader() {
  const { user, logout } = useAuth()
  const { toggleConversationsSidebar, toggleFilesSidebar } = useLayoutStore()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-verde-100 bg-white/95 px-6 backdrop-blur-xl">
      {/* Esquerda: Menu + Logo */}
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleConversationsSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-verde-50 active:bg-verde-100"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-verde-700" />
        </motion.button>

        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-semibold tracking-tight text-verde-950 sm:block">
            Verity Agro
          </span>
        </div>
      </div>

      {/* Spacer para manter layout ou apenas nada se for center */}
      <div className="flex-1" />

      {/* Direita: Status + Files Toggle + Avatar */}
      <div className="flex items-center gap-4">
        {/* Separator */}
        <div className="hidden h-8 w-px bg-verde-100 sm:block" />

        {/* Files Sidebar Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleFilesSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-verde-700 transition-colors hover:bg-verde-50 active:bg-verde-100"
          aria-label="Toggle files sidebar"
        >
          <PanelRight className="h-5 w-5" />
        </motion.button>

        {/* Avatar + Dropdown */}
        <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-verde-600"
            >
              <Avatar email={user?.email || ''} size="lg" showBorder />
            </motion.button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 rounded-xl border-2 border-verde-100 bg-white p-4 shadow-xl shadow-verde-900/15"
          >
            {/* User Info */}
            <div className="mb-4 flex items-center gap-3">
              <Avatar email={user?.email || ''} size="xl" />
              <div>
                <p className="font-sans font-semibold text-verde-950">
                  {user?.name}
                </p>
                <p className="font-sans text-sm text-verde-600">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-1">
              <DropdownMenuItem className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-verde-50">
                <Settings className="h-4 w-4" />
                Configurações
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-verde-50">
                <HelpCircle className="h-4 w-4" />
                Ajuda e Suporte
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-verde-100" />

              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
