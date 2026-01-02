import { RefreshCw } from 'lucide-react'

interface RefreshIndicatorProps {
  /** Progresso do pull (0-1) */
  progress: number
  /** Se está refreshing */
  isRefreshing: boolean
  /** Distância do pull em pixels */
  pullDistance: number
}

/**
 * Indicador visual de pull-to-refresh
 * Mostra progresso circular e spinner quando refreshing
 */
export function RefreshIndicator({
  progress,
  isRefreshing,
  pullDistance
}: RefreshIndicatorProps) {
  // Não mostrar se não há pull
  if (pullDistance === 0 && !isRefreshing) return null

  // Calcular rotação do ícone baseado no progresso
  const rotation = progress * 360

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 transition-transform duration-200"
      style={{
        transform: `translateX(-50%) translateY(${Math.min(pullDistance - 30, 50)}px)`
      }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg ring-1 ring-border">
        <RefreshCw
          className={`h-5 w-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
            transition: isRefreshing ? undefined : 'transform 0.1s ease-out'
          }}
        />
      </div>

      {/* Texto de ajuda */}
      {!isRefreshing && pullDistance > 0 && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {progress >= 1 ? 'Solte para atualizar' : 'Puxe para atualizar'}
        </p>
      )}
    </div>
  )
}
