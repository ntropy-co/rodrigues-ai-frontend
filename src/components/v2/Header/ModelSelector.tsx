'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useUIConfig } from '@/hooks/useUIConfig'

export function ModelSelector() {
  const { ui } = useUIConfig()
  const [selectedModel] = useState({
    id: 'rodrigues-ai',
    name: ui.branding.displayModelName,
    description: 'Especialista em crédito agro e CPR'
  })
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
      >
        {selectedModel.name}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 z-50 mt-2 w-48 -translate-x-1/2 rounded-lg bg-popover shadow-lg border border-border">
          <div className="py-2">
            <div className="px-4 py-2 text-center">
              <span className="font-medium text-popover-foreground">{selectedModel.name}</span>
              <div className="text-sm text-muted-foreground mt-1">{selectedModel.description}</div>
            </div>
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