'use client'

import type { FC } from 'react'

export const ToolFallback: FC = () => {
  return (
    <div className="mt-2 flex items-center gap-2 rounded-lg border border-verity-200 bg-sand-100 px-3 py-2 text-sm text-verity-600 dark:border-verity-800 dark:bg-verity-950 dark:text-verity-400">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-verity-400 border-t-transparent" />
      <span>Processando...</span>
    </div>
  )
}
