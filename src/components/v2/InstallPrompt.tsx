'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Mostrar prompt após 30s de uso (engajamento)
      setTimeout(() => {
        const hasInstalled = localStorage.getItem('pwa-installed')
        const hasDismissed = localStorage.getItem('pwa-dismissed')

        if (!hasInstalled && !hasDismissed) {
          setShowPrompt(true)
        }
      }, 30000) // 30 segundos
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Detectar quando app foi instalado
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa-installed', 'true')
      setShowPrompt(false)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-8 md:w-96">
      <div className="rounded-xl border border-border bg-card p-4 shadow-lg duration-300 animate-in slide-in-from-bottom-4">
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
            <Download className="h-5 w-5 text-primary-foreground" />
          </div>

          {/* Conteúdo */}
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              Instalar Rodrigues AI
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione à sua tela inicial para acesso rápido
            </p>

            {/* Ações */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors active:scale-95 hover-hover:bg-primary/90"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 py-2 text-muted-foreground transition-colors active:scale-95 hover-hover:bg-muted"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
