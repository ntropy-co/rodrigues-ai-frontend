'use client'

import Link from 'next/link'
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
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/chat"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-left h-5 w-5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      </div>
      <CPRWizard />
    </div>
  )
}
