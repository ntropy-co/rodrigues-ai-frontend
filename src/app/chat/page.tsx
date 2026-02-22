'use client'

import { Suspense } from 'react'
import { ChatLayout } from '@/features/chat'

// TODO: REVERTER — Auth desabilitada temporariamente para preview visual
export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-verity-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-verity-600 border-t-transparent"></div>
        </div>
      }
    >
      <ChatLayout />
    </Suspense>
  )
}
