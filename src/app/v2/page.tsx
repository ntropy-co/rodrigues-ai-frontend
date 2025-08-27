'use client'

import { Suspense } from 'react'
import { GeminiLayout } from '@/components/v2/GeminiLayout'

export default function V2() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GeminiLayout />
    </Suspense>
  )
}