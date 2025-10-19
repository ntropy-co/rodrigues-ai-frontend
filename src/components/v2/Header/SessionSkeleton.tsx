'use client'

export function SessionSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
      <div className="flex-shrink-0 mt-1">
        <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
        <div className="h-3 bg-muted-foreground/20 rounded w-full" />
        <div className="h-3 bg-muted-foreground/20 rounded w-1/3" />
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
