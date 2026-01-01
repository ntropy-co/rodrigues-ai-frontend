import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const range = searchParams.get('range') || '1mo'

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  try {
    // TODO: Adicionar cache de borda para melhor desempenho
    // Substituir `cache: 'no-store'` por `next: { revalidate: 60 }` para cache de 60s
    const res = await fetch(
      `${backendUrl}/api/v1/quotes/history?symbol=${symbol}&range=${range}`,
      {
        cache: 'no-store'
      }
    )

    if (!res.ok) throw new Error('Backend error')

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotes history' },
      { status: 500 }
    )
  }
}
