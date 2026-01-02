'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { InternalHeader } from '@/components/v2/Header/InternalHeader'
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
      <div className="min-h-screen">
        <InternalHeader
          title="Simulacao de cotacoes"
          subtitle="Acompanhe variacoes e tendencias do mercado."
          backHref="/chat"
          containerClassName="max-w-4xl"
        />
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-verity-100">
            <QuotesChart />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}
