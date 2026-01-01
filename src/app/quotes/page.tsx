'use client'

import React from 'react'
import Link from 'next/link'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

// Lazy load the chart component
const QuotesChart = dynamic(
  () =>
    import('@/components/v2/QuotesChart/QuotesChart').then(
      (mod) => mod.QuotesChart
    ),
  {
    loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
    ssr: false
  }
)

// Create a client
const queryClient = new QueryClient()

export default function QuotesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto max-w-4xl py-6">
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
          <h1 className="text-2xl font-bold">Simulação de Cotações</h1>
        </div>
        <QuotesChart />
      </div>
    </QueryClientProvider>
  )
}
