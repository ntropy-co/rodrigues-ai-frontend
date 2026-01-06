'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Menu,
  Settings,
  HelpCircle,
  LogOut,
  PanelRight,
  FileText,
  LayoutDashboard,
  TrendingUp,
  FilePlus2,
  Calculator,
  History,
  Folder,
  Grid3X3
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Avatar } from '@/components/Avatar'
import { useLayoutStore } from '@/features/chat'
import { useCanvasStore } from '@/features/canvas'
import { useAuth } from '@/contexts/AuthContext'

// Tools configuration for the dropdown
const TOOLS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/quotes', icon: TrendingUp, label: 'Cotações' },
  { href: '/cpr/wizard', icon: FilePlus2, label: 'Nova CPR' },
  { href: '/cpr/simulator', icon: Calculator, label: 'Simulador' },
  { href: '/cpr/historico', icon: History, label: 'Histórico CPR' },
  { href: '/documents', icon: Folder, label: 'Documentos' }
]

export function ChatHeader() {
  const { user, logout } = useAuth()
  const { toggleConversationsSidebar, toggleFilesSidebar } = useLayoutStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sand-300 bg-sand-200/95 px-6 backdrop-blur-xl">
      {/* Esquerda: Menu + Logo */}
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleConversationsSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-sand-200 active:bg-sand-300"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-verity-700" />
        </motion.button>

        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-semibold tracking-tight text-verity-950 sm:block">
            Verity Agro
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Direita: Tools + Canvas + Files + Avatar */}
      <div className="flex items-center gap-2">
        {/* Tools Dropdown */}
        <DropdownMenu open={toolsOpen} onOpenChange={setToolsOpen}>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-verity-700 transition-colors hover:bg-sand-200 active:bg-sand-300"
              aria-label="Ferramentas"
              title="Ferramentas"
            >
              <Grid3X3 className="h-5 w-5" />
            </motion.button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl border border-sand-300 bg-white p-2 shadow-xl shadow-verity-900/10"
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-verity-500">
              Ferramentas
            </DropdownMenuLabel>

            <div className="mt-1 space-y-0.5">
              {TOOLS.map((tool) => (
                <DropdownMenuItem key={tool.href} asChild>
                  <Link
                    href={tool.href}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-verity-800 transition-colors hover:bg-verity-50 hover:text-verity-950"
                  >
                    <tool.icon className="h-4 w-4 text-verity-500" />
                    {tool.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Separator */}
        <div className="hidden h-8 w-px bg-sand-300 sm:block" />

        {/* Canvas Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => useCanvasStore.getState().toggleCanvas()}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-verity-700 transition-colors hover:bg-sand-200 active:bg-sand-300"
          aria-label="Toggle canvas"
          title="Abrir/Fechar Canvas"
        >
          <FileText className="h-5 w-5" />
        </motion.button>

        {/* Files Sidebar Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleFilesSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-verity-700 transition-colors hover:bg-sand-200 active:bg-sand-300"
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
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-verity-600"
            >
              <Avatar email={user?.email || ''} size="lg" showBorder />
            </motion.button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-72 overflow-hidden rounded-2xl border border-sand-200 bg-white p-0 shadow-2xl shadow-verity-900/20"
          >
            {/* Gradient Header */}
            <div className="relative bg-gradient-to-br from-verity-800 via-verity-700 to-verity-900 px-5 py-6">
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />

              <div className="relative flex items-center gap-4">
                <div className="rounded-full bg-white/20 p-0.5 backdrop-blur-sm">
                  <Avatar email={user?.email || ''} size="xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-semibold text-white">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="truncate text-sm text-white/70">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <DropdownMenuItem asChild>
                <Link
                  href="/settings/organization"
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-verity-800 transition-all hover:bg-verity-50 hover:text-verity-950"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-verity-100">
                    <Settings className="h-4 w-4 text-verity-600" />
                  </div>
                  <div>
                    <p className="font-medium">Configurações</p>
                    <p className="text-xs text-verity-500">
                      Gerencie sua conta
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/contact"
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-verity-800 transition-all hover:bg-verity-50 hover:text-verity-950"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-verity-100">
                    <HelpCircle className="h-4 w-4 text-verity-600" />
                  </div>
                  <div>
                    <p className="font-medium">Ajuda e Suporte</p>
                    <p className="text-xs text-verity-500">Central de ajuda</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </div>

            {/* Logout section */}
            <div className="border-t border-sand-200 p-2">
              <DropdownMenuItem
                onClick={logout}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-error-600 transition-all hover:bg-error-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-100">
                  <LogOut className="h-4 w-4 text-error-500" />
                </div>
                Sair da conta
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
