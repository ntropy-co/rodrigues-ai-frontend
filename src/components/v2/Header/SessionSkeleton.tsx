'use client'

export function SessionSkeleton() {
  return (
    <div className="flex animate-pulse items-start gap-3 rounded-lg bg-muted/50 p-3">
      <div className="mt-1 flex-shrink-0">
        <div className="h-4 w-4 rounded bg-muted-foreground/20" />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
        <div className="h-3 w-full rounded bg-muted-foreground/20" />
        <div className="h-3 w-1/3 rounded bg-muted-foreground/20" />
      </div>
    </div>
  )
}

export function SessionSkeletonList() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <SessionSkeleton key={i} />
      ))}
    </div>
  )
}
