import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Menu, Hexagon, FolderOpen, MessageSquare } from 'lucide-react'
import { UserAvatar } from './UserAvatar'
import { useUIConfig } from '@/hooks/useUIConfig'

// Dynamic import para code splitting - Sidebar só carrega quando menu é aberto
const MenuSidebar = dynamic(
  () => import('./MenuSidebar').then((m) => ({ default: m.MenuSidebar })),
  {
    ssr: false,
    loading: () => null
  }
)

interface HeaderProps {
  onToggleConversations?: () => void
  onToggleFiles?: () => void
  isConversationsOpen?: boolean
  isFilesOpen?: boolean
}

export function Header({
  onToggleConversations,
  onToggleFiles,
  isConversationsOpen = true,
  isFilesOpen = true
}: HeaderProps) {
  const { ui } = useUIConfig()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const lastAnalysisTime = 'há 2 horas'

  return (
    <>
      <header
        className="flex h-14 w-full items-center justify-between border-b border-verde-100 bg-white px-4 dark:border-gray-800 dark:bg-card"
        role="banner"
      >
        {/* Left Section: Toggles & Logo */}
        <div className="flex items-center gap-2">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-verde-600 transition-colors hover:bg-verde-50 hover:text-verde-900"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Conversations Toggle */}
          {onToggleConversations && (
            <button
              onClick={onToggleConversations}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                isConversationsOpen
                  ? 'bg-verde-100 text-verde-900'
                  : 'text-verde-600 hover:bg-verde-50 hover:text-verde-900'
              }`}
              aria-label={
                isConversationsOpen ? 'Fechar conversas' : 'Abrir conversas'
              }
              title="Conversas"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          )}

          {/* Divider */}
          <div className="mx-2 h-6 w-px bg-verde-200" aria-hidden="true" />

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-lg bg-verde-900 p-1.5">
              <Hexagon className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-base font-semibold text-verde-950">
              {ui.branding.appName}
            </span>
          </div>
        </div>

        {/* Right Section: Context, Files Toggle & User */}
        <nav className="flex items-center gap-3">
          <span className="hidden text-xs text-verde-600 md:inline-block">
            Última análise: {lastAnalysisTime}
          </span>

          {/* Files Toggle */}
          {onToggleFiles && (
            <button
              onClick={onToggleFiles}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                isFilesOpen
                  ? 'bg-verde-100 text-verde-900'
                  : 'text-verde-600 hover:bg-verde-50 hover:text-verde-900'
              }`}
              aria-label={isFilesOpen ? 'Fechar arquivos' : 'Abrir arquivos'}
              title="Arquivos"
            >
              <FolderOpen className="h-5 w-5" />
            </button>
          )}

          <div className="h-6 w-px bg-verde-200" aria-hidden="true" />
          <UserAvatar />
        </nav>
      </header>

      {/* Menu Sidebar */}
      <MenuSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
