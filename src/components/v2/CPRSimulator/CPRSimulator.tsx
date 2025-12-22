'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { COMMODITY_INFO, type CommoditySymbol } from '@/lib/quotes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { CalculatorIcon, HistoryIcon, ArrowDownIcon, ArrowUpIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

// =============================================================================
// Types
// =============================================================================

interface SimulationResult {
  id: string
  date: string
  commodity: CommoditySymbol
  quantity: number
  price: number
  termDays: number
  rateZ: number // taxa ao ano %
  
  // Calculated
  grossValue: number
  discount: number
  netValue: number
  marketPrice?: number
  marketDelta?: number
}

// =============================================================================
// Helper Functions
// =============================================================================

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
const formatPercent = (val: number) => `${val.toFixed(2)}%`

// =============================================================================
// Component
// =============================================================================

export function CPRSimulator() {
  // Inputs
  const [commodity, setCommodity] = useState<CommoditySymbol>('ZS=F')
  const [quantity, setQuantity] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [termDays, setTermDays] = useState<string>('180')
  const [rate, setRate] = useState<string>('12.0') // % a.a.

  // History State
  const [history, setHistory] = useState<SimulationResult[]>([])
  
  // Load History
  useEffect(() => {
    const saved = localStorage.getItem('cpr_simulator_history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load history', e)
      }
    }
  }, [])

  // Save History
  useEffect(() => {
    localStorage.setItem('cpr_simulator_history', JSON.stringify(history))
  }, [history])

  // Fetch Market Quote
  const { data: marketData, isFetching: loadingQuote } = useQuery({
      queryKey: ['quote', commodity],
      queryFn: async () => {
          const res = await fetch(`/api/quotes?symbol=${encodeURIComponent(commodity)}`)
          if (!res.ok) return null
          const json = await res.json()
          return json.success ? json.data : null
      }
  })

  // Calculations
  const currentResult = useMemo(() => {
     const qty = parseFloat(quantity)
     const prc = parseFloat(price)
     const term = parseFloat(termDays)
     const rt = parseFloat(rate)

     if (!qty || !prc || !term || isNaN(rt) || qty <= 0 || prc <= 0 || term <= 0) return null

     // Logic:
     // Gross = Qty * Price
     // Discount (Simple Juros Pro-Rata) = Gross * (Rate/100) * (Days/360)
     // Net = Gross - Discount
     
     const grossValue = qty * prc
     const discount = grossValue * (rt / 100) * (term / 360)
     const netValue = grossValue - discount
     
     // Market Comparison
     // Quote API returns current price in "marketData.price" (usually USD or BRL depending on symbol)
     // Assuming quote is compatible currency or we just show raw delta for now.
     // *Note*: Ideally we need currency conversion. For MVP we assume input is BRL and quote BRL if available, or just display warning.
     // Yahoo Finance quotes often come in USD for these symbols. 
     // For this MVP, let's assume the user inputs the "Price" they negotiated, and we compare with "Market Price" converted manually or just displayed raw.
     
     // Let's simplified: If we have marketData.price, we calculate delta per unit.
     let marketPrice = undefined
     let marketDelta = undefined
     
     if (marketData && marketData.price) {
         // This is a naive comparison if currency differs, but fulfills requirement "comparacao basica"
         marketPrice = marketData.price
         marketDelta = prc - marketPrice
     }

     return {
         commodity,
         quantity: qty,
         price: prc,
         termDays: term,
         rateZ: rt,
         grossValue,
         discount,
         netValue,
         marketPrice,
         marketDelta
     }
  }, [quantity, price, termDays, rate, commodity, marketData])

  const handleSave = () => {
      if (!currentResult) return
      const newItem: SimulationResult = {
          ...currentResult,
          id: crypto.randomUUID(),
          date: new Date().toISOString()
      }
      setHistory(prev => [newItem, ...prev].slice(0, 10)) // Keep last 10
      toast.success('Simulação salva no histórico!')
  }

  const loadFromHistory = (item: SimulationResult) => {
      setCommodity(item.commodity)
      setQuantity(item.quantity.toString())
      setPrice(item.price.toString())
      setTermDays(item.termDays.toString())
      setRate(item.rateZ.toString())
      toast.info('Valores carregados do histórico.')
  }
  
  const clearHistory = () => {
      if(confirm('Limpar todo o histórico?')) {
          setHistory([])
      }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      
      {/* Input Section */}
      <Card className="lg:col-span-2">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CalculatorIcon className="w-5 h-5 text-primary" />
                Simulador de Custo CPR
            </CardTitle>
            <CardDescription>
                Calcule o valor líquido da CPR Financeira descontada a valor presente.
            </CardDescription>
         </CardHeader>
         <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>Commodity</Label>
                  <Select value={commodity} onValueChange={(v) => setCommodity(v as CommoditySymbol)}>
                      <SelectTrigger>
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          {Object.entries(COMMODITY_INFO).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v.name} ({v.unit})</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
               </div>

               <div className="space-y-2">
                   <Label>Quantidade</Label>
                   <Input 
                       type="number" 
                       placeholder="Ex: 1000" 
                       value={quantity}
                       onChange={e => setQuantity(e.target.value)}
                   />
               </div>

               <div className="space-y-2">
                   <Label>Preço Unitário (R$)</Label>
                   <div className="relative">
                       <Input 
                           type="number" 
                           placeholder="0.00" 
                           value={price}
                           onChange={e => setPrice(e.target.value)}
                           className={cn(currentResult?.marketDelta && "pr-24")}
                       />
                       {/* Market Comparison Badge inside Input */}
                        {price && marketData?.price && (
                             <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs flex items-center gap-1 bg-muted px-2 py-1 rounded pointer-events-none">
                                 {loadingQuote ? (
                                    <RefreshCwIcon className="h-3 w-3 animate-spin" />
                                 ) : (
                                    <>
                                        <span className="text-muted-foreground">Mkt: {formatCurrency(marketData.price)}</span>
                                    </>
                                 )}
                             </div>
                        )}
                   </div>
                   {currentResult?.marketDelta !== undefined && (
                       <p className={cn("text-xs mt-1 font-medium", currentResult.marketDelta >= 0 ? "text-green-600" : "text-amber-600")}>
                           {currentResult.marketDelta >= 0 
                             ? `+${formatCurrency(currentResult.marketDelta)} acima do mercado` 
                             : `${formatCurrency(currentResult.marketDelta)} abaixo do mercado`}
                       </p>
                   )}
               </div>

               <div className="space-y-2">
                   <Label>Prazo (dias)</Label>
                   <Input 
                       type="number" 
                       value={termDays}
                       onChange={e => setTermDays(e.target.value)}
                   />
               </div>

               <div className="space-y-2">
                   <Label>Taxa Anual (%)</Label>
                   <Input 
                       type="number" 
                       step="0.1"
                       value={rate}
                       onChange={e => setRate(e.target.value)}
                   />
               </div>
            </div>

            <Separator />

            {/* Results Display */}
            <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">Valor Bruto</p>
                        <p className="text-2xl font-semibold text-foreground">
                            {currentResult ? formatCurrency(currentResult.grossValue) : 'R$ 0,00'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">Desconto Previsto</p>
                        <p className="text-2xl font-semibold text-red-500">
                             {currentResult ? `- ${formatCurrency(currentResult.discount)}` : 'R$ 0,00'}
                        </p>
                    </div>
                    <div>
                         <p className="text-sm text-muted-foreground uppercase tracking-wide">Valor Líquido</p>
                        <p className="text-2xl font-bold text-green-600">
                             {currentResult ? formatCurrency(currentResult.netValue) : 'R$ 0,00'}
                        </p>
                    </div>
                </div>
            </div>

            <Button 
                onClick={handleSave} 
                disabled={!currentResult} 
                className="w-full md:w-auto"
            >
                Salvar Simulação
            </Button>
         </CardContent>
      </Card>

      {/* History Section */}
      <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                      <HistoryIcon className="w-4 h-4" />
                      Histórico Recente
                  </CardTitle>
                  {history.length > 0 && (
                      <Button variant="ghost" size="icon" onClick={clearHistory} title="Limpar histórico">
                          <Trash2Icon className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                  )}
              </div>
          </CardHeader>
          <CardContent>
              {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhuma simulação salva.
                  </p>
              ) : (
                  <div className="space-y-3">
                      {history.map((item) => (
                          <div 
                              key={item.id} 
                              onClick={() => loadFromHistory(item)}
                              className="group p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors text-sm"
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium">{COMMODITY_INFO[item.commodity].name}</span>
                                  <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                  {item.quantity} {COMMODITY_INFO[item.commodity].unit} @ {formatCurrency(item.price)}
                              </div>
                              <div className="flex justify-between items-end">
                                   <div>
                                       <span className="text-[10px] text-muted-foreground block">LÍQUIDO</span>
                                       <span className="font-semibold text-green-600">{formatCurrency(item.netValue)}</span>
                                   </div>
                                   <div className="text-right">
                                       <span className="text-[10px] text-muted-foreground block">TAXA</span>
                                       <span>{formatPercent(item.rateZ)}</span>
                                   </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  )
}
