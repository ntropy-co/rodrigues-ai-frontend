'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ChatLayout } from '@/components/v2/ChatLayout'

export default function ChatPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-verde-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-verde-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-verde-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-verde-600 border-t-transparent"></div>
        </div>
      }
    >
      <ChatLayout />
    </Suspense>
  )
}
