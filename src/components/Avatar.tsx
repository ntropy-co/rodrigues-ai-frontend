import { useMemo } from 'react'
import { getInitialLetter } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

interface AvatarProps {
  name?: string
  email?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showBorder?: boolean
  className?: string
  imageUrl?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-9 w-9 text-sm', // Matching the requested design
  xl: 'h-12 w-12 text-lg'
}

export function Avatar({
  name,
  email,
  size = 'md',
  showBorder = false,
  className,
  imageUrl
}: AvatarProps) {
  const initial = useMemo(() => getInitialLetter(name, email), [name, email])

  // Deterministic color based on email/name if needed, currently using Verity green
  const bgColor = 'bg-verde-900'

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full font-medium text-white transition-all',
        bgColor,
        sizeClasses[size],
        showBorder && 'box-content ring-2 ring-white',
        className
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name || 'Avatar'}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  )
}
