/**
 * Next.js API Route - Playground Status Proxy
 *
 * This route acts as a proxy to the backend playground status API
 * to avoid CORS issues when running in development or production
 */

import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    console.log(
      '[API Route /api/playground/status] Proxying to:',
      `${BACKEND_URL}/api/v1/playground/status`
    )

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/playground/status`, {
      method: 'GET',
      credentials: 'include'
    })

    console.log(
      '[API Route /api/playground/status] Backend response status:',
      response.status
    )

    // Return just the status code
    return NextResponse.json(
      { status: response.status },
      { status: response.status }
    )
  } catch (error) {
    console.error('[API Route /api/playground/status] Error:', error)
    return NextResponse.json({ status: 500 }, { status: 500 })
  }
}
