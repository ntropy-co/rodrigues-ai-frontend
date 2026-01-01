import { NextResponse } from 'next/server'

export async function GET() {
  // Simple proxy for list of quotes
  // Frontend might not use this specific endpoint often if it uses history, but keeping parity

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  try {
    // TODO: Adicionar cache de borda para melhor desempenho
    // Substituir `cache: 'no-store'` por `next: { revalidate: 60 }` para cache de 60s
    const res = await fetch(`${backendUrl}/api/v1/quotes/latest`, {
      cache: 'no-store'
    })

    if (!res.ok) throw new Error('Backend error')

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
