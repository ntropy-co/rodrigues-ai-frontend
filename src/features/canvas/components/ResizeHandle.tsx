'use client'

import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ResizeHandleProps {
  onResize: (delta: number) => void
  className?: string
}

export function ResizeHandle({ onResize, className }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      // Negative delta means dragging left (making chat smaller, canvas bigger)
      onResize(-e.movementX)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, onResize])

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        'group relative z-30 flex h-full w-1 cursor-col-resize items-center justify-center bg-sand-200 transition-colors hover:bg-verity-300',
        isDragging && 'bg-verity-500',
        className
      )}
    >
      {/* Visual Handle Indicator */}
      <div
        className={cn(
          'absolute h-12 w-1 rounded-full bg-verity-400 opacity-0 transition-opacity group-hover:opacity-100',
          isDragging && 'bg-verity-600 opacity-100'
        )}
      />
    </div>
  )
}
