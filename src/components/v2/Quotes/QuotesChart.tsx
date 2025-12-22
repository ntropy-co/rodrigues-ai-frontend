'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { COMMODITY_INFO, type CommoditySymbol } from '@/lib/quotes'
import { cn } from '@/lib/utils'
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, RefreshCw, TrendingUp } from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

type RangeOption = '1mo' | '3mo' | '6mo' | '1y'

interface QuoteHistoryPoint {
  date: string
  close: number
}

interface HistoricalDataResponse {
  success: boolean
  data: {
    symbol: CommoditySymbol
    range: RangeOption
    history: QuoteHistoryPoint[]
  }
}

// =============================================================================
// Helper: Format Currency
// =============================================================================

const formatCurrency = (value: number, currency = 'USD') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency
  }).format(value)
}

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return dateStr
  }
}

// =============================================================================
// Component: Simple SVG Line Chart
// =============================================================================

interface ChartProps {
  data: QuoteHistoryPoint[]
  width?: number
  height?: number
  cprPrice?: number
  unit?: string
}

const SimpleLineChart = ({ data, height = 300, cprPrice, unit }: ChartProps) => {
  const [hoveredPoint, setHoveredPoint] = useState<QuoteHistoryPoint | null>(null)
  
  // Calculate dimensions and scales
  const padding = { top: 20, right: 20, bottom: 30, left: 50 }
  // We use percentages for width to be responsive, but internal calculations need a base
  // For SVG viewBox we can assume a fixed coordinate system
  const viewBoxWidth = 800
  const viewBoxHeight = height
  
  const innerWidth = viewBoxWidth - padding.left - padding.right
  const innerHeight = viewBoxHeight - padding.top - padding.bottom

  const dates = data.map((d) => new Date(d.date).getTime())
  const prices = data.map((d) => d.close)

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  
  // Add some buffer to Y axis
  const yMin = Math.min(minPrice, cprPrice ?? minPrice) * 0.95
  const yMax = Math.max(maxPrice, cprPrice ?? maxPrice) * 1.05
  const yRange = yMax - yMin || 1

  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)
  const xRange = maxDate - minDate || 1

  // Scalers
  const getX = (dateStr: string) => {
    const d = new Date(dateStr).getTime()
    return padding.left + ((d - minDate) / xRange) * innerWidth
  }

  const getY = (price: number) => {
    return viewBoxHeight - padding.bottom - ((price - yMin) / yRange) * innerHeight
  }

  // Generate Path
  const points = data
    .map((d) => `${getX(d.date)},${getY(d.close)}`)
    .join(' ')

  // Grid lines (5 lines)
  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const val = yMin + (i * yRange) / 4
    const y = getY(val)
    return { y, val }
  })

  // CPR Line
  // Normalize Y for CPR if provided
  const cprY = cprPrice ? getY(cprPrice) : null

  return (
    <div className="w-full relative group">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-auto overflow-visible"
        aria-label="Gráfico de histórico de preços"
      >
        {/* Grid Lines */}
        {gridLines.map(({ y, val }) => (
          <g key={val}>
            <line
              x1={padding.left}
              y1={y}
              x2={viewBoxWidth - padding.right}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 5}
              y={y + 4}
              textAnchor="end"
              className="text-[10px] fill-muted-foreground"
            >
              {val.toFixed(2)}
            </text>
          </g>
        ))}

        {/* CPR Line Reference */}
        {cprY !== null && cprY >= padding.top && cprY <= viewBoxHeight - padding.bottom && (
           <g>
             <line
               x1={padding.left}
               y1={cprY}
               x2={viewBoxWidth - padding.right}
               y2={cprY}
               stroke="#f59e0b" // Amber-500
               strokeWidth="2"
               strokeDasharray="5 5"
             />
             <text
               x={viewBoxWidth - padding.right + 5}
               y={cprY + 4}
               textAnchor="start"
               className="text-[10px] fill-amber-600 font-bold"
             >
               CPR
             </text>
           </g>
        )}

        {/* Main Line */}
        <polyline
          fill="none"
          stroke="#2563eb" // Blue-600
          strokeWidth="2"
          points={points}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Hover Interaction Area overlay */}
        {data.map((point, i) => (
          <rect
            key={i}
            x={getX(point.date) - (innerWidth / data.length) / 2}
            y={padding.top}
            width={innerWidth / data.length}
            height={innerHeight}
            fill="transparent"
            className="cursor-crosshair"
            onMouseEnter={() => setHoveredPoint(point)}
          />
        ))}

        {/* Hover Point Indicator */}
        {hoveredPoint && (
          <g>
            <circle
              cx={getX(hoveredPoint.date)}
              cy={getY(hoveredPoint.close)}
              r="4"
              fill="#2563eb"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1={getX(hoveredPoint.date)}
              y1={padding.top}
              x2={getX(hoveredPoint.date)}
              y2={viewBoxHeight - padding.bottom}
              stroke="#2563eb"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.5"
            />
          </g>
        )}
      </svg>
      
      {/* Tooltip (CSS based or simple overlay) */}
      {hoveredPoint && (
        <div 
          className="absolute bg-background border rounded p-2 text-xs shadow-lg pointer-events-none z-10"
          style={{ 
             top: 0, 
             left: '50%',
             transform: 'translateX(-50%)'
          }}
        >
          <div className="font-semibold">{formatDate(hoveredPoint.date)}</div>
          <div>{formatCurrency(hoveredPoint.close)} {unit && <span className="text-muted-foreground text-[10px]">{unit}</span>}</div>
        </div>
      )}
    </div>
  )
}


// =============================================================================
// Main Component: QuotesChart
// =============================================================================

export function QuotesChart() {
  const [symbol, setSymbol] = useState<CommoditySymbol>('ZS=F')
  const [range, setRange] = useState<RangeOption>('1mo')
  const [cprPriceInput, setCprPriceInput] = useState('')

  const cprPrice = cprPriceInput ? parseFloat(cprPriceInput) : undefined

  // Commodity options
  const commodityOptions = useMemo(() => {
    return (Object.entries(COMMODITY_INFO) as [CommoditySymbol, typeof COMMODITY_INFO['ZS=F']][]).map(([key, info]) => ({
      value: key,
      label: info.name,
      unit: info.unit
    }))
  }, [])

  const currentCommodity = COMMODITY_INFO[symbol]

  // Fetch Data
  const { data, isLoading, isError, refetch } = useQuery<HistoricalDataResponse>({
    queryKey: ['quotes-history', symbol, range],
    queryFn: async () => {
      const res = await fetch(`/api/quotes/history?symbol=${encodeURIComponent(symbol)}&range=${range}`)
      if (!res.ok) throw new Error('Falha ao carregar dados')
      return res.json()
    }
  })

  // Statistics
  const history = data?.data?.history || []
  
  const stats = useMemo(() => {
    if (history.length === 0) return null
    const prices = history.map(d => d.close)
    const last = prices[prices.length - 1]
    const first = prices[0]
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    const change = last - first
    const changePercent = (change / first) * 100

    return { last, min, max, avg, change, changePercent }
  }, [history])

  // Comparison Logic
  const comparison = useMemo(() => {
    if (!cprPrice || !stats) return null
    const diff = stats.last - cprPrice
    const diffPercent = (diff / cprPrice) * 100
    return { diff, diffPercent }
  }, [cprPrice, stats])

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Histórico de Cotações</h2>
          <p className="text-sm text-muted-foreground">Acompanhe a evolução de preços das commodities.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" onClick={() => refetch()} title="Atualizar">
             <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
           </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Commodity</label>
            <Select 
              value={symbol} 
              onValueChange={(val) => setSymbol(val as CommoditySymbol)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {commodityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label} ({opt.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <div className="flex bg-muted rounded-md p-1">
              {(['1mo', '3mo', '6mo', '1y'] as RangeOption[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "flex-1 text-sm py-1.5 px-3 rounded-sm transition-all",
                    range === r 
                      ? "bg-background shadow-sm font-medium text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-amber-600">Preço CPR (Alvo)</label>
             <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
               <Input 
                 type="number" 
                 placeholder="Ex: 12.50" 
                 className="pl-7 border-amber-200 focus-visible:ring-amber-500 bg-amber-50/10"
                 value={cprPriceInput}
                 onChange={(e) => setCprPriceInput(e.target.value)}
                 step="0.01"
               />
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Summary Cards */}
         <div className="lg:col-span-1 space-y-4">
            {isLoading ? (
               <Skeleton className="h-32 w-full" />
            ) : stats ? (
              <>
                 <Card>
                    <CardHeader className="pb-2">
                       <CardDescription>Fechamento Atual</CardDescription>
                       <CardTitle className="text-2xl">{formatCurrency(stats.last)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className={cn(
                         "flex items-center text-sm font-medium",
                         stats.change >= 0 ? "text-green-600" : "text-red-600"
                       )}>
                         {stats.change >= 0 ? <ArrowUpIcon className="mr-1 h-4 w-4" /> : <ArrowDownIcon className="mr-1 h-4 w-4" />}
                         {Math.abs(stats.changePercent).toFixed(2)}% ({stats.range})
                       </div>
                       <p className="text-xs text-muted-foreground mt-1">{currentCommodity.unit}</p>
                    </CardContent>
                 </Card>

                 <div className="grid grid-cols-2 gap-2">
                    <Card className="p-3">
                       <div className="text-xs text-muted-foreground">Mínimo</div>
                       <div className="font-semibold">{formatCurrency(stats.min)}</div>
                    </Card>
                    <Card className="p-3">
                       <div className="text-xs text-muted-foreground">Máximo</div>
                       <div className="font-semibold">{formatCurrency(stats.max)}</div>
                    </Card>
                 </div>

                 {comparison && (
                    <Card className={cn(
                      "border-l-4",
                      comparison.diff >= 0 ? "border-l-green-500 bg-green-50/10" : "border-l-red-500 bg-red-50/10"
                    )}>
                      <CardHeader className="p-3 pb-1">
                         <CardDescription className="text-xs font-bold uppercase tracking-wider">Delta vs CPR</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-1">
                         <div className={cn("text-lg font-bold", comparison.diff >= 0 ? "text-green-600" : "text-red-600")}>
                           {comparison.diff > 0 ? '+' : ''}{formatCurrency(comparison.diff)}
                         </div>
                         <div className="text-xs text-muted-foreground">
                            {comparison.diff > 0 ? "Acima do alvo" : "Abaixo do alvo"} ({comparison.diffPercent.toFixed(1)}%)
                         </div>
                      </CardContent>
                    </Card>
                 )}
              </>
            ) : isError ? (
               <div className="text-red-500 text-sm">Erro ao carregar dados.</div>
            ) : null}
         </div>

         {/* Chart Area */}
         <div className="lg:col-span-3">
            <Card className="h-full min-h-[400px]">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gray-500" />
                    Evolução - {currentCommodity.name}
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  {isLoading ? (
                    <div className="w-full h-[300px] flex items-center justify-center">
                       <Skeleton className="w-full h-full" />
                    </div>
                  ) : history.length > 0 ? (
                    <SimpleLineChart 
                       data={history} 
                       height={350} 
                       cprPrice={cprPrice}
                       unit={currentCommodity.unit}
                    />
                  ) : (
                    <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                       Nenhum dado disponível para este período.
                    </div>
                  )}
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}
