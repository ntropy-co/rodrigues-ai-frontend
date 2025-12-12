/**
 * Format a date or timestamp as relative time (e.g., "há 2h", "há 3d")
 * @param dateOrTimestamp - Date object or Unix timestamp in seconds
 */
export function formatRelativeTime(dateOrTimestamp: Date | number): string {
  const date =
    typeof dateOrTimestamp === 'number'
      ? new Date(dateOrTimestamp * 1000)
      : dateOrTimestamp

  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'agora'
  if (minutes < 60) return `há ${minutes}m`
  if (hours < 24) return `há ${hours}h`
  if (days < 7) return `há ${days}d`

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  })
}
