'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react'

// =============================================================================
// Topos & Types
// =============================================================================

export type TourStep = {
  id: string
  targetId?: string // HTML ID to highlight (if any)
  title: string
  message: string
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  action?: 'next' | 'dismiss' | 'link'
  actionLabel?: string
  actionHref?: string
  onEnter?: () => void
}

type TourContextType = {
  isActive: boolean
  currentStepIndex: number
  steps: TourStep[]
  startTour: (tourId: string, steps: TourStep[]) => void
  nextStep: () => void
  endTour: () => void
  hasSeenTour: (tourId: string) => boolean
}

const TourContext = createContext<TourContextType | undefined>(undefined)

// =============================================================================
// Provider
// =============================================================================

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentTourId, setCurrentTourId] = useState<string | null>(null)
  const [steps, setSteps] = useState<TourStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // Load seen tours from localStorage on mount
  const [seenTours, setSeenTours] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem('verity_seen_tours')
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSeenTours(new Set(JSON.parse(stored)))
    }
  }, [])

  const markAsSeen = useCallback((tourId: string) => {
    setSeenTours((prev) => {
      const next = new Set(prev).add(tourId)
      localStorage.setItem(
        'verity_seen_tours',
        JSON.stringify(Array.from(next))
      )
      return next
    })
  }, [])

  const startTour = useCallback((tourId: string, tourSteps: TourStep[]) => {
    setCurrentTourId(tourId)
    setSteps(tourSteps)
    setCurrentStepIndex(0)
    setIsActive(true)

    // Execute onEnter for first step if exists
    if (tourSteps[0]?.onEnter) {
      tourSteps[0].onEnter()
    }
  }, [])

  const endTour = useCallback(() => {
    if (currentTourId) {
      markAsSeen(currentTourId)
    }
    setIsActive(false)
    setCurrentTourId(null)
    setSteps([])
    setCurrentStepIndex(0)
  }, [currentTourId, markAsSeen])

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)

      // Execute onEnter logic
      if (steps[nextIndex]?.onEnter) {
        steps[nextIndex].onEnter()
      }
    } else {
      endTour()
    }
  }, [currentStepIndex, steps, endTour])

  const hasSeenTour = useCallback(
    (tourId: string) => {
      return seenTours.has(tourId)
    },
    [seenTours]
  )

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStepIndex,
        steps,
        startTour,
        nextStep,
        endTour,
        hasSeenTour
      }}
    >
      {children}
    </TourContext.Provider>
  )
}

// =============================================================================
// Hook
// =============================================================================

export function useTour() {
  const context = useContext(TourContext)
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}
