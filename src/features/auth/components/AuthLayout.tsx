'use client'

import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="animate-fade-in flex min-h-screen">
      {/* Lado Esquerdo - Branding & Informação */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-verity-900 via-verity-800 to-verity-900 p-12 lg:flex">
        {/* Pattern de fundo sutil */}
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Efeito de luz ambiente */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-transparent to-black/20" />

        {/* Header com logo */}
        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-branco">
                Verity Agro
              </h1>
              <p className="text-sm font-light tracking-wide text-verity-100">
                Análise Inteligente de CPR
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo central - Value proposition */}
        <div className="relative z-10 max-w-lg">
          <h2 className="mb-6 font-display text-4xl font-semibold leading-tight text-branco lg:text-5xl">
            Análise de crédito rural com inteligência artificial
          </h2>
          <p className="mb-8 text-lg font-light leading-relaxed text-verity-100">
            Decisões mais rápidas e seguras para operações de CPR, com
            conformidade regulatória garantida.
          </p>

          {/* Social proof */}
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="font-mono text-xs text-verity-200/80">
            Plataforma enterprise para análise de risco agrícola • Verity v2.0
          </p>
        </div>
      </div>

      {/* Lado Direito - Conteúdo Dinâmico */}
      <div className="bg-bege relative flex flex-1 items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          {children}

          {/* Footer - Termos */}
          <div className="mt-8 space-y-2 text-center">
            <p className="text-xs text-verity-800/60">
              Ao continuar, você concorda com nossos{' '}
              <a
                href="#"
                className="underline transition-colors hover:text-verity-900"
              >
                Termos de Serviço
              </a>{' '}
              e{' '}
              <a
                href="#"
                className="underline transition-colors hover:text-verity-900"
              >
                Política de Privacidade
              </a>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-verity-800/40">
              Secured by Verity Agro Enterprise
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
