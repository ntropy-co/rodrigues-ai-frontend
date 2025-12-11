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

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    })

    // Get the response data
    const data = await response.json()

    // Map backend response to frontend expected format
    // Backend returns: { access_token, token_type }
    // Frontend expects: { token }
    if (response.ok && data.access_token) {
      return NextResponse.json(
        {
          ...data,
          token: data.access_token
        },
        { status: response.status }
      )
    }

    // Return error response as-is
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
