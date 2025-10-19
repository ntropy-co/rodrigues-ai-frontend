'use client'

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-muted-foreground">Pensando</span>
      <div className="flex gap-1">
        <div
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: '0ms' }}
        ></div>
        <div
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: '150ms' }}
        ></div>
        <div
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: '300ms' }}
        ></div>
      </div>
    </div>
  )
}
