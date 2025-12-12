'use client'

interface AvatarProps {
  email: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl'
}

const colorMap: Record<string, string> = {
  A: 'bg-gradient-to-br from-verde-900 to-verde-800',
  B: 'bg-gradient-to-br from-verde-800 to-verde-700',
  C: 'bg-gradient-to-br from-verde-700 to-verde-600',
  D: 'bg-gradient-to-br from-verde-600 to-verde-500',
  E: 'bg-gradient-to-br from-verde-900 to-verde-800',
  F: 'bg-gradient-to-br from-verde-800 to-verde-700',
  G: 'bg-gradient-to-br from-verde-700 to-verde-600',
  H: 'bg-gradient-to-br from-verde-600 to-verde-500',
  I: 'bg-gradient-to-br from-verde-900 to-verde-800',
  J: 'bg-gradient-to-br from-verde-800 to-verde-700',
  K: 'bg-gradient-to-br from-verde-700 to-verde-600',
  L: 'bg-gradient-to-br from-verde-600 to-verde-500',
  M: 'bg-gradient-to-br from-verde-900 to-verde-800',
  N: 'bg-gradient-to-br from-verde-800 to-verde-700',
  O: 'bg-gradient-to-br from-verde-700 to-verde-600',
  P: 'bg-gradient-to-br from-verde-600 to-verde-500',
  Q: 'bg-gradient-to-br from-verde-900 to-verde-800',
  R: 'bg-gradient-to-br from-verde-800 to-verde-700',
  S: 'bg-gradient-to-br from-verde-700 to-verde-600',
  T: 'bg-gradient-to-br from-verde-600 to-verde-500',
  U: 'bg-gradient-to-br from-verde-900 to-verde-800',
  V: 'bg-gradient-to-br from-verde-800 to-verde-700',
  W: 'bg-gradient-to-br from-verde-700 to-verde-600',
  X: 'bg-gradient-to-br from-verde-600 to-verde-500',
  Y: 'bg-gradient-to-br from-verde-900 to-verde-800',
  Z: 'bg-gradient-to-br from-verde-800 to-verde-700'
}

export function Avatar({
  email,
  size = 'md',
  className = '',
  showBorder = false
}: AvatarProps) {
  const initial = email.charAt(0).toUpperCase()
  const colorClass =
    colorMap[initial] || 'bg-gradient-to-br from-verde-900 to-verde-800'

  return (
    <div
      className={` ${sizeClasses[size]} ${colorClass} ${showBorder ? 'ring-2 ring-white' : ''} flex select-none items-center justify-center rounded-full font-bold text-white shadow-md shadow-verde-900/10 ${className} `}
    >
      {initial}
    </div>
  )
}
