import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    let url = `${BACKEND_URL}/api/v1/documents/user/${params.userId}`
    if (sessionId) {
      url += `?session_id=${sessionId}`
    }

    console.log('[API Proxy] GET documents for user:', params.userId)

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    })

    console.log('[API Proxy] Documents response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[API Proxy] Documents error:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log('[API Proxy] Successfully fetched', data.length, 'documents')

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API Proxy] Error fetching documents:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
