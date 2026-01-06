'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from './button'
import Icon from './icon'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-xl hover:bg-accent"
      >
        <div className="h-4 w-4" />
      </Button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-8 w-8 rounded-xl transition-colors hover:bg-accent"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Icon type="sun" size="xs" className="text-ouro-500" />
      ) : (
        <Icon type="moon" size="xs" className="text-verity-700" />
      )}
    </Button>
  )
}
