'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (POSTHOG_KEY && typeof window !== 'undefined') {
      const isDevelopment = process.env.NODE_ENV === 'development'

      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,

        // Session Replay Configuration
        disable_session_recording: isDevelopment, // Não gravar em development
        session_recording: {
          // Privacidade: mascarar inputs sensíveis
          maskAllInputs: false, // Não mascarar todos (para UX insights)
          maskInputOptions: {
            password: true // Sempre mascarar senhas
          },
          maskTextSelector: '[data-mask]', // Mascarar elementos com data-mask
          recordCrossOriginIframes: false // Não gravar iframes externos
        },

        // Disable debug in production
        loaded: (posthog) => {
          if (isDevelopment) {
            posthog.debug()
          }
        }
      })
    }
  }, [])

  if (!POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}

// Helper functions for tracking events
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.capture(event, properties)
  }
}

export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.identify(userId, properties)
  }
}

export function resetUser() {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.reset()
  }
}
