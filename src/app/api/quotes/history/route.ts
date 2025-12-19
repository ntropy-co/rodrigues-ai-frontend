/**
 * API Route: GET /api/quotes/history
 *
 * Retorna histórico de cotações de uma commodity.
 *
 * Query params:
 * - symbol: Ticker obrigatório (ex: ZS=F)
 * - range: Período (1mo, 3mo, 6mo, 1y) - default: 1mo
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchCommodityHistory, type CommoditySymbol } from '@/lib/quotes'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') as CommoditySymbol | null
    const range = (searchParams.get('range') || '1mo') as
      | '1mo'
      | '3mo'
      | '6mo'
      | '1y'

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol is required' },
        { status: 400 }
      )
    }

    const history = await fetchCommodityHistory(symbol, range)

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        range,
        history
      },
      count: history.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[API Quotes History] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
