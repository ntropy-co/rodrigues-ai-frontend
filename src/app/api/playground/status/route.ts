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
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/playground/status`, {
      method: 'GET',
      credentials: 'include'
    })

    // Return just the status code
    return NextResponse.json(
      { status: response.status },
      { status: response.status }
    )
  } catch {
    return NextResponse.json({ status: 500 }, { status: 500 })
  }
}
