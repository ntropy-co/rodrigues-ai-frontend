'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

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
    <div className="container mx-auto px-4 py-10">
      <CPRWizard />
    </div>
  )
}
