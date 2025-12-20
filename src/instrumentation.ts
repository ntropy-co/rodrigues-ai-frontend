import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

function initSentry() {
  if (!SENTRY_DSN) return

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    enabled: process.env.NODE_ENV !== 'development'
  })
}

export function register() {
  // Next.js executa este arquivo no runtime apropriado. Mantemos o init
  // simples e compatível com node/edge.
  initSentry()
}

export const onRequestError = Sentry.captureRequestError
