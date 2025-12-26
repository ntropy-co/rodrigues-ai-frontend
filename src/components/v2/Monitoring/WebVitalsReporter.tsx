'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { usePathname } from 'next/navigation'
import { track, ANALYTICS_EVENTS } from '@/lib/analytics'

/**
 * WebVitalsReporter Component
 * 
 * Collects Core Web Vitals (LCP, INP, CLS) and reports them using
 * the centralized analytics system. Uses navigator.sendBeacon internally
 * via the analytics provider for reliability.
 */
export function WebVitalsReporter() {
  const pathname = usePathname()

  useReportWebVitals((metric) => {
    // [MANDATORY] Filter for LCP, INP, and CLS
    if (!['LCP', 'INP', 'CLS'].includes(metric.name)) {
        return
    }

    // Logging in Development for visibility
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vital] ${metric.name}:`, {
          id: metric.id,
          value: metric.value,
          rating: metric.rating
      })
    }

    // Send payload using type-safe analytics wrapper
    track(ANALYTICS_EVENTS.WEB_VITAL_REPORTED, {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
      delta: metric.delta,
      navigationType: metric.navigationType,
      route: pathname || (typeof window !== 'undefined' ? window.location.pathname : '/')
    })
  })

  return null
}
