'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ChatLayout } from '@/features/chat'

export default function ChatSessionPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, isLoading } = useAuth()
  const sessionId = params.sessionId as string

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="bg-verde-50 flex h-screen items-center justify-center">
        <div className="border-verde-600 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <Suspense
      fallback={
        <div className="bg-verde-50 flex h-screen items-center justify-center">
          <div className="border-verde-600 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      }
    >
      <ChatLayout sessionId={sessionId} />
    </Suspense>
  )
}
