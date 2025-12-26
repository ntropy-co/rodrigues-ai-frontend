'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

// Lazy load the chart component
const QuotesChart = dynamic(
  () => import('@/components/v2/QuotesChart/QuotesChart').then((mod) => mod.QuotesChart),
  {
    loading: () => <Skeleton className="w-full h-[400px] rounded-xl" />,
    ssr: false
  }
)

// Create a client
const queryClient = new QueryClient()

export default function QuotesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto max-w-4xl py-10">
        <h1 className="mb-6 text-2xl font-bold">Simulação de Cotações</h1>
        <QuotesChart />
      </div>
    </QueryClientProvider>
  )
}
