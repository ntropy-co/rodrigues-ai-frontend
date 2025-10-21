'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { GeminiLayout } from '@/components/v2/GeminiLayout'

export default function ChatSessionPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, isLoading } = useAuth()
  const sessionId = params.sessionId as string

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GeminiLayout sessionId={sessionId} />
    </Suspense>
  )
}
