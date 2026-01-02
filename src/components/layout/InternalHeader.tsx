'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InternalHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  actions?: ReactNode
  className?: string
  containerClassName?: string
}

export function InternalHeader({
  title,
  subtitle,
  backHref = '/chat',
  backLabel = 'Voltar ao chat',
  actions,
  className,
  containerClassName
}: InternalHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-sand-300 bg-sand-200/95 backdrop-blur-xl',
        className
      )}
      role="banner"
    >
      <div
        className={cn(
          'mx-auto flex h-14 w-full items-center justify-between px-4',
          containerClassName || 'max-w-6xl'
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            aria-label={backLabel}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-verity-700 transition-colors hover:bg-verity-50 hover:text-verity-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-semibold text-verity-950">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate text-xs text-verity-600">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  )
}
