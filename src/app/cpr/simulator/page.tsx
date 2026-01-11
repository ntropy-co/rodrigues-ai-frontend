'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CPRSimulator } from '@/features/cpr'
import { InternalHeader } from '@/components/layout/InternalHeader'
import { FEATURE_FLAGS } from '@/config/feature-flags'

export default function CPRSimulatorPage() {
  const router = useRouter()

  useEffect(() => {
    if (!FEATURE_FLAGS.CPR_SIMULATOR) {
      router.replace('/chat')
    }
  }, [router])

  if (!FEATURE_FLAGS.CPR_SIMULATOR) {
    return null // Evitar flash de conteúdo
  }

  return (
    <div className="min-h-screen">
      <InternalHeader
        title="Simulador de CPR"
        subtitle="Calculo rapido de custos e taxas de CPR financeira."
        backHref="/chat"
        containerClassName="max-w-5xl"
      />
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <CPRSimulator />
      </div>
    </div>
  )
}
