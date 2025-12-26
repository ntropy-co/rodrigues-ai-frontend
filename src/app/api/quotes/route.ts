
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Simple proxy for list of quotes
  // Frontend might not use this specific endpoint often if it uses history, but keeping parity
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  try {
    // TODO: Add edge caching for better performance
    // Replace `cache: 'no-store'` with `next: { revalidate: 60 }` to cache for 60s
    const res = await fetch(`${backendUrl}/api/v1/quotes/latest`, {
      cache: 'no-store'
    })
    
    if (!res.ok) throw new Error('Backend error')
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
