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

  return (
    <>
      <header
        className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-base))]/80 px-4 backdrop-blur-md"
        role="banner"
      >
        {/* Left Section: Toggles & Logo */}
        <div className="flex items-center gap-2">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-verity-600 transition-colors hover:bg-verity-50 hover:text-verity-900"
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
                  ? 'bg-verity-100 text-verity-900'
                  : 'text-verity-600 hover:bg-verity-50 hover:text-verity-900'
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
          <div
            className="mx-2 h-6 w-px bg-[hsl(var(--border-subtle))]"
            aria-hidden="true"
          />

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-lg bg-verity-900 p-1.5">
              <Hexagon className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-base font-semibold text-[hsl(var(--text-primary))]">
              {ui.branding.appName}
            </span>
          </div>
        </div>

        {/* Right Section: Context, Files Toggle & User */}
        <nav className="flex items-center gap-3">
          {/* Files Toggle */}
          {onToggleFiles && (
            <button
              onClick={onToggleFiles}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                isFilesOpen
                  ? 'bg-verity-100 text-verity-900'
                  : 'text-verity-600 hover:bg-verity-50 hover:text-verity-900'
              }`}
              aria-label={isFilesOpen ? 'Fechar arquivos' : 'Abrir arquivos'}
              title="Arquivos"
            >
              <FolderOpen className="h-5 w-5" />
            </button>
          )}

          <div
            className="h-6 w-px bg-[hsl(var(--border-subtle))]"
            aria-hidden="true"
          />
          <UserAvatar />
        </nav>
      </header>

      {/* Menu Sidebar */}
      <MenuSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
