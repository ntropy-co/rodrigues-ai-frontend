'use client'

import { useEffect } from 'react'
import { useLayoutStore } from '@/stores/layoutStore'
import { BREAKPOINTS } from '@/types/layout'

/**
 * Hook that automatically updates viewport state based on window size.
 * Should be called once at the top level of the chat layout.
 */
export function useResponsiveLayout() {
  const setViewport = useLayoutStore((state) => state.setViewport)

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth

      if (width < BREAKPOINTS.mobile) {
        setViewport('mobile')
      } else if (width < BREAKPOINTS.tablet) {
        setViewport('tablet')
      } else {
        setViewport('desktop')
      }
    }

    // Executar na montagem
    updateViewport()

    // Listener for resize with debounce
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateViewport, 100)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [setViewport])
}
