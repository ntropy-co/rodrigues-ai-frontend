/**
 * Next.js API Route - Login Proxy
 *
 * This route acts as a proxy to the backend authentication API
 * to avoid CORS issues when running locally
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.text()

    console.log(
      '[API Route /api/auth/login] Proxying to:',
      `${BACKEND_URL}/api/v1/login/access-token`
    )
    console.log('[API Route /api/auth/login] Body:', body)

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/login/access-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    })

    console.log(
      '[API Route /api/auth/login] Backend response status:',
      response.status
    )

    // Get the response data
    const data = await response.json()

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/auth/login] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
