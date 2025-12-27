'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { COMMODITY_INFO, type CommoditySymbol } from '@/lib/commodities'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, RefreshCcw, AlertCircle } from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

type Range = '1mo' | '3mo' | '6mo' | '1y'

interface HistoricalDataPoint {
  date: string
  close: number
  // We can add open/high/low/volume if we want candle sticks later
}

interface QuotesHistoryResponse {
  success: boolean
  data: {
    history: HistoricalDataPoint[]
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(value: number, currency: string = 'USD') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency
  }).format(value)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  }).format(date)
}

// =============================================================================
// Chart Component (SVG)
// =============================================================================

function SimpleLineChart({
  data,
  height = 200,
  cprPrice,
  lineColor = '#2563eb'
}: {
  data: HistoricalDataPoint[]
  height?: number
  cprPrice?: number
  lineColor?: string
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)
  // Hover effect state - moved before early return to satisfy rules of hooks
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null)

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth)
    }
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        Sem dados para exibir
      </div>
    )
  }

  // Calculate scales
  const prices = data.map((d) => d.close)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  // Add padding to Y axis (5%)
  const padding = (maxPrice - minPrice) * 0.05
  const domainMin = Math.max(0, minPrice - padding)
  const domainMax = maxPrice + padding
  const domainRange = domainMax - domainMin || 1

  // Create path
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d.close - domainMin) / domainRange) * height
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  // CPR Line
  let cprY = -1
  if (cprPrice !== undefined && cprPrice > 0) {
    cprY = height - ((cprPrice - domainMin) / domainRange) * height
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const index = Math.min(
      Math.max(0, Math.round((x / width) * (data.length - 1))),
      data.length - 1
    )
    setHoverIndex(index)
  }

  const handleMouseLeave = () => setHoverIndex(null)

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null
  const activeX =
    hoverIndex !== null ? (hoverIndex / (data.length - 1)) * width : 0
  const activeY = activePoint
    ? height - ((activePoint.close - domainMin) / domainRange) * height
    : 0

  return (
    <div ref={containerRef} className="relative select-none" style={{ height }}>
      <svg
        width="100%"
        height={height}
        className="overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid lines (optional - implement simply 3 lines) */}
        {[0, 0.5, 1].map((p) => {
          const y = height * p
          const price = domainMax - domainRange * p
          return (
            <g key={p}>
              <line
                x1="0"
                y1={y}
                x2="100%"
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="4 4"
              />
              <text
                x="-5"
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#6b7280"
                className="hidden sm:block"
              >
                {price.toFixed(2)}
              </text>
            </g>
          )
        })}

        {/* Main Line */}
        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* CPR Line */}
        {cprY >= 0 && cprY <= height && (
          <g>
            <line
              x1="0"
              y1={cprY}
              x2="100%"
              y2={cprY}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <text
              x="5"
              y={cprY - 5}
              fontSize="10"
              fill="#ef4444"
              fontWeight="bold"
            >
              CPR Ref: {cprPrice?.toFixed(2)}
            </text>
          </g>
        )}

        {/* Active Point */}
        {activePoint && (
          <g>
            <line
              x1={activeX}
              y1={0}
              x2={activeX}
              y2={height}
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <circle
              cx={activeX}
              cy={activeY}
              r="4"
              fill={lineColor}
              stroke="white"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {activePoint && (
        <div
          className="pointer-events-none absolute rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
          style={{
            left: activeX,
            top: Math.min(activeY - 40, height - 50), // Try to keep above, but clamp
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-semibold">{formatDate(activePoint.date)}</div>
          <div>{formatCurrency(activePoint.close)}</div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function QuotesChart() {
  const [symbol, setSymbol] = React.useState<CommoditySymbol>('ZS=F')
  const [range, setRange] = React.useState<Range>('1mo')
  const [cprPriceStr, setCprPriceStr] = React.useState('')

  const cprPrice = cprPriceStr ? parseFloat(cprPriceStr) : undefined

  // Safe access to COMMODITY_INFO
  const commodity = COMMODITY_INFO[symbol] || {
    name: 'Desconhecido',
    unit: '-'
  }

  // Query
  const { data, isLoading, isError, refetch } = useQuery<QuotesHistoryResponse>(
    {
      queryKey: ['quotes-history', symbol, range],
      queryFn: async () => {
        const res = await fetch(
          `/api/quotes/history?symbol=${symbol}&range=${range}`
        )
        if (!res.ok) throw new Error('Falha ao buscar dados')
        return res.json()
      }
    }
  )

  // Derived state
  const history = data?.data?.history || []
  const hasData = history.length > 0

  const lastPoint = hasData ? history[history.length - 1] : null
  const lastPrice = lastPoint?.close || 0
  const previousPrice =
    hasData && history.length > 1
      ? history[history.length - 2].close
      : lastPrice

  const prices = history.map((h) => h.close)
  const minPrice = hasData ? Math.min(...prices) : 0
  const maxPrice = hasData ? Math.max(...prices) : 0
  const avgPrice = hasData
    ? prices.reduce((a, b) => a + b, 0) / prices.length
    : 0

  const variation = lastPrice - previousPrice
  const variationPercent = previousPrice ? (variation / previousPrice) * 100 : 0

  // Comparison Logic
  const cprDiff = cprPrice && lastPrice ? lastPrice - cprPrice : null
  const cprDiffPercent =
    cprPrice && lastPrice ? (cprDiff! / cprPrice) * 100 : null
  const isCprBetter = cprDiff !== null && cprDiff > 0 // Higher market price is usually "better" for seller

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl">Histórico de Cotações</CardTitle>
          <p className="text-sm text-muted-foreground">
            Acompanhe a variação do {commodity.name} ({commodity.unit})
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={symbol}
            onValueChange={(v) => setSymbol(v as CommoditySymbol)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Commodity" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COMMODITY_INFO).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  {info.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1mo">1 Mês</SelectItem>
              <SelectItem value="3mo">3 Meses</SelectItem>
              <SelectItem value="6mo">6 Meses</SelectItem>
              <SelectItem value="1y">1 Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoading ? (
            Array(4)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : (
            <>
              <StatBox
                label="Último Fechamento"
                value={formatCurrency(lastPrice)}
                subValue={`${variation > 0 ? '+' : ''}${variationPercent.toFixed(2)}%`}
                subColor={variation >= 0 ? 'text-green-600' : 'text-red-600'}
                icon={variation >= 0 ? TrendingUp : TrendingDown}
              />
              <StatBox
                label="Média do Período"
                value={formatCurrency(avgPrice)}
              />
              <StatBox label="Mínimo" value={formatCurrency(minPrice)} />
              <StatBox label="Máximo" value={formatCurrency(maxPrice)} />
            </>
          )}
        </div>

        {/* Chart Area */}
        <div className="min-h-[250px] w-full rounded-lg border bg-card p-4">
          {isLoading ? (
            <div className="flex h-[200px] w-full items-end gap-2">
              {Array(20)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    key={i}
                    className="w-full"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
            </div>
          ) : isError ? (
            <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-destructive">
              <AlertCircle size={24} />
              <p>Erro ao carregar dados</p>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1 text-xs underline"
              >
                <RefreshCcw size={12} /> Tentar novamente
              </button>
            </div>
          ) : (
            <SimpleLineChart data={history} cprPrice={cprPrice} />
          )}
        </div>

        {/* CPR Comparison Section */}
        <div className="flex flex-col gap-4 rounded-md bg-secondary/20 p-4 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Comparar com Preço CPR
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0.00"
                className="w-32 bg-background"
                value={cprPriceStr}
                onChange={(e) => setCprPriceStr(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">
                {commodity.unit}
              </span>
            </div>
          </div>

          {cprPrice && lastPrice > 0 && (
            <div className="flex flex-1 items-center gap-4 rounded-md border bg-background p-3 shadow-sm">
              <div>
                <p className="text-xs text-muted-foreground">
                  Diferença (Mercado - CPR)
                </p>
                <div
                  className={cn(
                    'text-lg font-bold',
                    isCprBetter ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {cprDiff && cprDiff > 0 ? '+' : ''}
                  {formatCurrency(cprDiff || 0)}
                </div>
              </div>
              <div className="text-sm">
                {isCprBetter ? (
                  <span className="text-green-700">
                    Mercado está pagando <b>{cprDiffPercent?.toFixed(1)}%</b>{' '}
                    acima da sua CPR.
                  </span>
                ) : (
                  <span className="text-red-700">
                    Mercado está{' '}
                    <b>{Math.abs(cprDiffPercent || 0).toFixed(1)}%</b> abaixo da
                    sua CPR.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface StatBoxProps {
  label: string
  value: string
  subValue?: string
  subColor?: string
  icon?: React.ComponentType<{ className?: string }>
}

function StatBox({
  label,
  value,
  subValue,
  subColor,
  icon: Icon
}: StatBoxProps) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-end gap-2">
        <div className="text-lg font-semibold">{value}</div>
        {subValue && (
          <div
            className={cn('flex items-center text-xs font-medium', subColor)}
          >
            {Icon && <Icon className="mr-1 h-3 w-3" />}
            {subValue}
          </div>
        )}
      </div>
    </div>
  )
}
