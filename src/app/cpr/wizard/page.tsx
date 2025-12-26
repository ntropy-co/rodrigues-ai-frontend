import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const CPRWizard = dynamic(
  () => import('@/components/v2/CPRWizard/CPRWizard').then((mod) => mod.CPRWizard),
  {
    loading: () => <Skeleton className="w-full h-[600px] rounded-xl" />,
    ssr: false // Wizard is client-heavy and likely behind auth/interaction
  }
)

export default function CPRWizardPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <CPRWizard />
    </div>
  )
}
