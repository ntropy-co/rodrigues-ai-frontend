/**
 * API Route: GET /api/quotes
 *
 * Retorna cotações de commodities agrícolas com cache Upstash Redis.
 *
 * Query params:
 * - symbol: Ticker específico (ex: ZS=F, ZC=F)
 * - all: true para buscar todas as commodities
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  fetchCommodityQuote,
  fetchAllCommodityQuotes,
  type CommoditySymbol
} from '@/lib/quotes'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') as CommoditySymbol | null
    const all = searchParams.get('all') === 'true'

    // Fetch all quotes
    if (all) {
      const quotes = await fetchAllCommodityQuotes()
      return NextResponse.json({
        success: true,
        data: quotes,
        count: quotes.length,
        timestamp: new Date().toISOString()
      })
    }

    // Fetch single quote
    if (symbol) {
      const quote = await fetchCommodityQuote(symbol)

      if (!quote) {
        return NextResponse.json(
          { success: false, error: 'Quote not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: quote,
        timestamp: new Date().toISOString()
      })
    }

    // No params - return all by default
    const quotes = await fetchAllCommodityQuotes()
    return NextResponse.json({
      success: true,
      data: quotes,
      count: quotes.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[API Quotes] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
