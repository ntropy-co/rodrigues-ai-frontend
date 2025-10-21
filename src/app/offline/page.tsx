'use client'

import { WifiOff } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        {/* Ícone de offline */}
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <WifiOff className="h-10 w-10 text-muted-foreground" />
        </div>

        {/* Título */}
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Você está offline
        </h1>

        {/* Descrição */}
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          Parece que você perdeu sua conexão com a internet. Verifique sua
          conexão e tente novamente.
        </p>

        {/* Ações */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors active:scale-95 hover-hover:bg-primary/90"
          >
            Tentar novamente
          </button>

          <Link
            href="/"
            className="block w-full rounded-lg border border-border px-6 py-3 text-foreground transition-colors active:scale-95 hover-hover:bg-muted"
          >
            Voltar ao início
          </Link>
        </div>

        {/* Dica sobre cache */}
        <p className="mt-8 text-xs text-muted-foreground">
          Conversas recentes podem estar disponíveis no cache
        </p>
      </div>
    </div>
  )
}
