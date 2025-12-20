/**
 * Commodity Quotes Service
 *
 * Serviço para buscar cotações de commodities agrícolas via Yahoo Finance.
 * Usa Upstash Redis para cache e reduzir requests.
 */

import { getOrSet } from './redis'

// =============================================================================
// Types
// =============================================================================

export interface CommodityQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
  lastUpdated: string
}

export interface CommodityHistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type CommoditySymbol =
  | 'ZS=F' // Soybean
  | 'ZC=F' // Corn
  | 'ZW=F' // Wheat
  | 'KC=F' // Coffee
  | 'ZL=F' // Soybean Oil
  | 'ZM=F' // Soybean Meal
  | 'SB=F' // Sugar
  | 'CT=F' // Cotton
  | 'LE=F' // Live Cattle

// =============================================================================
// Constants
// =============================================================================

export const COMMODITY_INFO: Record<
  CommoditySymbol,
  { name: string; unit: string }
> = {
  'ZS=F': { name: 'Soja', unit: 'USD/bushel' },
  'ZC=F': { name: 'Milho', unit: 'USD/bushel' },
  'ZW=F': { name: 'Trigo', unit: 'USD/bushel' },
  'KC=F': { name: 'Café', unit: 'USD/lb' },
  'ZL=F': { name: 'Óleo de Soja', unit: 'USD/lb' },
  'ZM=F': { name: 'Farelo de Soja', unit: 'USD/ton' },
  'SB=F': { name: 'Açúcar', unit: 'USD/lb' },
  'CT=F': { name: 'Algodão', unit: 'USD/lb' },
  'LE=F': { name: 'Boi Gordo', unit: 'USD/lb' }
}

const YAHOO_API_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart'

// Cache TTL: 15 minutes for quotes (they have 15min delay anyway)
const QUOTES_CACHE_TTL = 15 * 60

// =============================================================================
// Yahoo Finance API
// =============================================================================

interface YahooQuoteResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string
        regularMarketPrice: number
        previousClose: number
        currency: string
      }
      timestamp: number[]
      indicators: {
        quote: Array<{
          open: number[]
          high: number[]
          low: number[]
          close: number[]
          volume: number[]
        }>
      }
    }>
    error: null | { code: string; description: string }
  }
}

/**
 * Fetch single commodity quote from Yahoo Finance
 */
export async function fetchCommodityQuote(
  symbol: CommoditySymbol
): Promise<CommodityQuote | null> {
  const cacheKey = `quote:${symbol}`

  return getOrSet(
    cacheKey,
    async () => {
      try {
        const response = await fetch(
          `${YAHOO_API_BASE}/${symbol}?interval=1d&range=1d`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; VerityAgro/1.0)'
            },
            next: { revalidate: QUOTES_CACHE_TTL }
          }
        )

        if (!response.ok) {
          console.error(
            `[Quotes] Yahoo API error for ${symbol}: ${response.status}`
          )
          return null
        }

        const data: YahooQuoteResponse = await response.json()

        if (data.chart.error || !data.chart.result?.[0]) {
          console.error(`[Quotes] No data for ${symbol}`)
          return null
        }

        const result = data.chart.result[0]
        const meta = result.meta
        const info = COMMODITY_INFO[symbol]

        const change = meta.regularMarketPrice - meta.previousClose
        const changePercent = (change / meta.previousClose) * 100

        return {
          symbol,
          name: info.name,
          price: meta.regularMarketPrice,
          change,
          changePercent,
          currency: meta.currency || 'USD',
          lastUpdated: new Date().toISOString()
        }
      } catch (error) {
        console.error(`[Quotes] Error fetching ${symbol}:`, error)
        return null
      }
    },
    QUOTES_CACHE_TTL
  )
}

/**
 * Fetch multiple commodity quotes
 */
export async function fetchAllCommodityQuotes(): Promise<CommodityQuote[]> {
  const symbols = Object.keys(COMMODITY_INFO) as CommoditySymbol[]

  const quotes = await Promise.all(
    symbols.map((symbol) => fetchCommodityQuote(symbol))
  )

  return quotes.filter((q): q is CommodityQuote => q !== null)
}

/**
 * Fetch historical data for a commodity
 */
export async function fetchCommodityHistory(
  symbol: CommoditySymbol,
  range: '1mo' | '3mo' | '6mo' | '1y' = '1mo'
): Promise<CommodityHistoricalData[]> {
  const cacheKey = `history:${symbol}:${range}`

  return getOrSet(
    cacheKey,
    async () => {
      try {
        const response = await fetch(
          `${YAHOO_API_BASE}/${symbol}?interval=1d&range=${range}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; VerityAgro/1.0)'
            }
          }
        )

        if (!response.ok) {
          return []
        }

        const data: YahooQuoteResponse = await response.json()

        if (data.chart.error || !data.chart.result?.[0]) {
          return []
        }

        const result = data.chart.result[0]
        const timestamps = result.timestamp || []
        const quote = result.indicators.quote[0]

        return timestamps.map((ts, i) => ({
          date: new Date(ts * 1000).toISOString().split('T')[0],
          open: quote.open[i] || 0,
          high: quote.high[i] || 0,
          low: quote.low[i] || 0,
          close: quote.close[i] || 0,
          volume: quote.volume[i] || 0
        }))
      } catch (error) {
        console.error(`[Quotes] Error fetching history for ${symbol}:`, error)
        return []
      }
    },
    QUOTES_CACHE_TTL * 4 // Cache historical data longer (1 hour)
  )
}
