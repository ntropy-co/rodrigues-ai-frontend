'use client'

import dynamic from 'next/dynamic'

// Dynamic import with ssr: false must be in a Client Component
const WebVitalsReporter = dynamic(
  () => import('./WebVitalsReporter').then((m) => m.WebVitalsReporter),
  { ssr: false }
)

export function WebVitalsReporterWrapper() {
  return <WebVitalsReporter />
}
