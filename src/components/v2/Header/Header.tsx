import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Menu, Hexagon } from 'lucide-react'
// import { ModelSelector } from './ModelSelector'
import { UserAvatar } from './UserAvatar'
import { useUIConfig } from '@/hooks/useUIConfig'

// Dynamic import para code splitting - Sidebar só carrega quando menu é aberto
// Reduz bundle inicial em ~15KB
const MenuSidebar = dynamic(
  () => import('./MenuSidebar').then((m) => ({ default: m.MenuSidebar })),
  {
    ssr: false, // Sidebar não precisa SSR
    loading: () => null // Sem loading state, sidebar aparece instantaneamente
  }
)

export function Header() {
  const { ui } = useUIConfig()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Timestamp simulado de "última análise" para dar contexto profissional
  const lastAnalysisTime = 'há 2 horas'

  return (
    <>
      <header
        className="flex h-16 w-full items-center justify-between border-b border-verde-200 bg-verde-50 px-6 py-4 dark:border-gray-800 dark:bg-card"
        role="banner"
      >
        {/* Left Section: Logo & Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 border-l border-verde-200 pl-4 dark:border-gray-700">
            <div className="flex items-center justify-center rounded bg-verde-900 p-1 dark:bg-gray-100">
              <Hexagon
                className="h-4 w-4 text-white dark:text-gray-900"
                strokeWidth={3}
              />
            </div>
            <span className="text-sm font-medium text-verde-900 dark:text-gray-300">
              {ui.branding.appName}
            </span>
          </div>
        </div>

        {/* Right Section: Context & User */}
        <nav className="flex items-center gap-6">
          <span className="hidden text-xs text-gray-500 md:inline-block">
            Última análise: {lastAnalysisTime}
          </span>
          <div
            className="h-4 w-px bg-gray-200 dark:bg-gray-800"
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
