import { NextRequest, NextResponse } from 'next/server'
import {
  COMMODITY_BACKEND_CODES,
  type CommoditySymbol
} from '@/lib/commodities'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const MAX_PAGES = 20
const PAGE_SIZE = 100

type RangeOption = '1mo' | '3mo' | '6mo' | '1y'

function isCommoditySymbol(value: string | null): value is CommoditySymbol {
  if (!value) return false
  return Object.prototype.hasOwnProperty.call(COMMODITY_BACKEND_CODES, value)
}

function isRangeOption(value: string | null): value is RangeOption {
  return value === '1mo' || value === '3mo' || value === '6mo' || value === '1y'
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getDateRange(range: RangeOption): { start: string; end: string } {
  const endDate = new Date()
  const startDate = new Date(endDate)

  switch (range) {
    case '1mo':
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case '3mo':
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case '6mo':
      startDate.setMonth(startDate.getMonth() - 6)
      break
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
    default:
      break
  }

  return { start: formatDate(startDate), end: formatDate(endDate) }
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
  const rangeParam = searchParams.get('range') || '1mo'

  if (!isCommoditySymbol(symbol)) {
    return NextResponse.json(
      { success: false, error: 'Invalid commodity symbol' },
      { status: 400 }
    )
  }

  if (!isRangeOption(rangeParam)) {
    return NextResponse.json(
      { success: false, error: 'Invalid range option' },
      { status: 400 }
    )
  }

  const authorization = getAuthorizationFromRequest(request)
  if (!authorization) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }

  const { start, end } = getDateRange(rangeParam)
  const backendCommodity = COMMODITY_BACKEND_CODES[symbol]

  try {
    let page = 1
    let total = Number.POSITIVE_INFINITY
    const items: Array<Record<string, unknown>> = []

    while (items.length < total && page <= MAX_PAGES) {
      const backendUrl = new URL(
        `${BACKEND_URL}/api/v1/commodities/history/${backendCommodity}`
      )
      backendUrl.searchParams.set('start_date', start)
      backendUrl.searchParams.set('end_date', end)
      backendUrl.searchParams.set('page', String(page))
      backendUrl.searchParams.set('page_size', String(PAGE_SIZE))

      const res = await fetch(backendUrl.toString(), {
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

      const responseData = data as {
        data?: Array<Record<string, unknown>>
        total?: number
      }

      if (Array.isArray(responseData.data)) {
        items.push(...responseData.data)
      }

      total =
        typeof responseData.total === 'number'
          ? responseData.total
          : items.length

      page += 1
    }

    const history = items
      .map((item) => {
        const date =
          typeof item.reference_date === 'string'
            ? item.reference_date
            : undefined
        const price = parseNumber(item.price_brl ?? item.price_usd)
        return date && price !== null ? { date, close: price } : null
      })
      .filter(
        (point): point is { date: string; close: number } => point !== null
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        range: rangeParam,
        history
      }
    })
  } catch (error) {
    console.error('[API Route /api/quotes/history] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotes history' },
      { status: 500 }
    )
  }
}
