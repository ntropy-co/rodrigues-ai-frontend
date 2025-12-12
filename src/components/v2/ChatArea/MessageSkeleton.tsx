'use client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Skeleton } from '@/components/ui/skeleton'

export function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 ${
          isUser
            ? 'rounded-tr-sm bg-verde-800/10'
            : 'rounded-tl-sm border-2 border-verde-100 bg-white'
        }`}
      >
        {/* Content skeleton */}
        <div
          className="animate-pulse space-y-2"
          style={{ animationDuration: '2s' }}
        >
          <div
            className={`h-4 rounded ${isUser ? 'bg-verde-200/50' : 'bg-verde-100'} w-3/4`}
          />
          <div
            className={`h-4 rounded ${isUser ? 'bg-verde-200/50' : 'bg-verde-50'} w-1/2`}
          />
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
