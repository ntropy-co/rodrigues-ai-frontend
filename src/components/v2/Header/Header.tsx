'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { ModelSelector } from './ModelSelector'
import { UserAvatar } from './UserAvatar'
import { MenuSidebar } from './MenuSidebar'
import { useUIConfig } from '@/hooks/useUIConfig'

export function Header() {
  const { ui } = useUIConfig()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  return (
    <>
      <header className="flex h-16 w-full items-center justify-between px-4 py-2 md:h-20 md:px-6">
        {/* Menu - 1/10 */}
        <div className="flex w-10 justify-start">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Menu"
          >
            <Menu className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        {/* Logo e Seletor - 3/10 */}
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-medium text-foreground md:text-xl">
            {ui.branding.appName}
          </h1>
          {ui.features.showModelSelector && <ModelSelector />}
        </div>

        {/* Spacer - 5/10 (flexível) */}
        <div className="flex-1" />

        {/* Actions - 1/10 */}
        <div className="flex w-10 justify-center">
          {ui.features.showProButton && (
            <button className="rounded-full bg-gradient-to-r from-gemini-blue to-gemini-purple px-3 py-1 text-sm font-medium text-white hover:from-gemini-blue-hover hover:to-gemini-purple transition-all">
              PRO
            </button>
          )}
        </div>

        {/* Avatar - 1/10 */}
        <div className="flex w-10 justify-end">
          <UserAvatar />
        </div>
      </header>

      {/* Menu Sidebar */}
      <MenuSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}