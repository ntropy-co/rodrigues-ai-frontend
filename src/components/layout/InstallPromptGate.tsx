'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useHaptic } from '@/hooks/useHaptic'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const InstallPrompt = dynamic(
  () => import('@/components/ui/InstallPrompt').then((mod) => mod.InstallPrompt),
  { ssr: false }
)

const PROMPT_DELAY_MS = 30000

export function InstallPromptGate() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const { trigger: triggerHaptic } = useHaptic()

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)

      if (timer) {
        clearTimeout(timer)
      }

      timer = setTimeout(() => {
        const hasInstalled = localStorage.getItem('pwa-installed')
        const hasDismissed = localStorage.getItem('pwa-dismissed')

        if (!hasInstalled && !hasDismissed) {
          setShowPrompt(true)
        }
      }, PROMPT_DELAY_MS)
    }

    const handleInstalled = () => {
      localStorage.setItem('pwa-installed', 'true')
      setShowPrompt(false)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', handleInstalled)

      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return

    triggerHaptic('medium')
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true')
      triggerHaptic('success')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }, [deferredPrompt, triggerHaptic])

  const handleDismiss = useCallback(() => {
    triggerHaptic('light')
    localStorage.setItem('pwa-dismissed', 'true')
    setShowPrompt(false)
  }, [triggerHaptic])

  if (!showPrompt) return null

  return <InstallPrompt onInstall={handleInstall} onDismiss={handleDismiss} />
}
