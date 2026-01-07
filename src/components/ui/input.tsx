import * as React from 'react'

import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-sand-300 bg-white px-4 py-2 text-sm text-verity-900 shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-verity-300 focus-visible:border-verity-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verity-400/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-verity-800 dark:bg-verity-900/50 dark:text-verity-50 dark:placeholder:text-verity-600',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
