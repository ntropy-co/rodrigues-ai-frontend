import { NextRequest, NextResponse } from 'next/server'
import {
  COMMODITY_BACKEND_CODES,
  COMMODITY_INFO,
  type CommoditySymbol
} from '@/lib/commodities'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function isCommoditySymbol(value: string | null): value is CommoditySymbol {
  if (!value) return false
  return Object.prototype.hasOwnProperty.call(COMMODITY_BACKEND_CODES, value)
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  if (!isCommoditySymbol(symbol)) {
    return NextResponse.json(
      { success: false, error: 'Invalid commodity symbol' },
      { status: 400 }
    )
  }

  const authorization = getAuthorizationFromRequest(request)
  if (!authorization) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }

  const backendCommodity = COMMODITY_BACKEND_CODES[symbol]
  const backendUrl = `${BACKEND_URL}/api/v1/commodities/latest/${backendCommodity}`

  try {
    const res = await fetch(backendUrl, {
      cache: 'no-store',
      headers: {
        Authorization: authorization
      }
    })

    const contentType = res.headers.get('content-type') || ''
    const data: unknown = contentType.includes('application/json')
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null)

    if (!res.ok) {
      const detail =
        data && typeof data === 'object'
          ? data
          : { detail: data || 'Backend error' }
      return NextResponse.json(detail, { status: res.status })
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid backend response' },
        { status: 502 }
      )
    }

    const price = parseNumber(
      (data as { price_brl?: unknown }).price_brl ??
        (data as { price_usd?: unknown }).price_usd
    )
    const changePercent = parseNumber(
      (data as { variation_percent?: unknown }).variation_percent
    )

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        name: COMMODITY_INFO[symbol]?.name || symbol,
        price: price ?? 0,
        change: 0,
        changePercent: changePercent ?? 0,
        currency: 'BRL',
        lastUpdated:
          (data as { reference_date?: string }).reference_date ||
          (data as { created_at?: string }).created_at ||
          new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[API Route /api/quotes] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
