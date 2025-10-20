'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser ? 'bg-gemini-blue/10' : 'bg-muted'
        }`}
      >
        {/* Avatar/Header skeleton */}
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[75%]" />
        </div>
      </div>
    </div>
  )
}

export function MessageSkeletonList() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <MessageSkeleton />
      <MessageSkeleton isUser />
      <MessageSkeleton />
    </div>
  )
}
