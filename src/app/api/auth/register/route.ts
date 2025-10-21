/**
 * Next.js API Route - Register Proxy
 *
 * This route acts as a proxy to the backend registration API
 * to avoid CORS issues when running locally
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body (JSON for register)
    const body = await request.json()

    console.log(
      '[API Route /api/auth/register] Proxying to:',
      `${BACKEND_URL}/api/v1/auth/register`
    )
    console.log('[API Route /api/auth/register] Body:', body)

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    console.log(
      '[API Route /api/auth/register] Backend response status:',
      response.status
    )

    // Get the response data
    const data = await response.json()

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/auth/register] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
