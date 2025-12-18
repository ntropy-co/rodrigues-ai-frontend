'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-8">
          <div className="max-w-md text-center">
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Algo deu errado
            </h2>
            <p className="mb-6 text-muted-foreground">
              Ocorreu um erro inesperado. Por favor, tente novamente.
            </p>
            <button
              onClick={() => reset()}
              className="rounded-lg bg-verde-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-verde-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
