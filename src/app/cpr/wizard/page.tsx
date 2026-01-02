'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { InternalHeader } from '@/components/v2/Header/InternalHeader'

const CPRWizard = dynamic(
  () =>
    import('@/components/v2/CPRWizard/CPRWizard').then((mod) => mod.CPRWizard),
  {
    loading: () => <Skeleton className="h-[600px] w-full rounded-xl" />,
    ssr: false // Wizard is client-heavy and likely behind auth/interaction
  }
)

export default function CPRWizardPage() {
  return (
    <div className="min-h-screen">
      <InternalHeader
        title="Emissao de CPR"
        subtitle="Preencha os dados para gerar a CPR."
        backHref="/chat"
        containerClassName="max-w-5xl"
      />
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <CPRWizard />
      </div>
    </div>
  )
}
