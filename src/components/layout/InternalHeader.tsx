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
        'sticky top-0 z-30 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-base))]/95 backdrop-blur-xl',
        className
      )}
      role="banner"
    >
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-4 px-4 py-6 md:flex-row md:items-start md:justify-between',
          containerClassName || 'max-w-6xl'
        )}
      >
        <div className="flex min-w-0 items-start gap-3">
          <Link
            href={backHref}
            aria-label={backLabel}
            className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--text-secondary))] shadow-sm transition-all hover:border-[hsl(var(--border-strong))] hover:text-[hsl(var(--text-primary))]"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 space-y-1">
            <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))] sm:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="line-clamp-2 text-sm text-[hsl(var(--text-secondary))]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex flex-shrink-0 items-center gap-3 pl-12 md:pl-0">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}
