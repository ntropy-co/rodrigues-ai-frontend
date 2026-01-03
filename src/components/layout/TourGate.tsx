'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useTour } from '@/contexts/TourContext'

const TourOverlay = dynamic(
  () => import('@/features/tour').then((mod) => mod.TourOverlay),
  { ssr: false }
)

const VerityGuide = dynamic(
  () => import('@/features/tour').then((mod) => mod.VerityGuide),
  { ssr: false }
)

const TOUR_ROUTES = [
  /^\/dashboard/,
  /^\/admin/,
  /^\/cpr/,
  /^\/chat/,
  /^\/analysis/,
  /^\/documents/,
  /^\/settings/,
  /^\/help/,
  /^\/compliance/,
  /^\/quotes/
]

export function TourGate() {
  const pathname = usePathname() || '/'
  const { isActive } = useTour()
  const isEligible = TOUR_ROUTES.some((route) => route.test(pathname))

  if (!isEligible) return null

  return (
    <>
      <TourOverlay />
      {isActive ? <VerityGuide /> : null}
    </>
  )
}
