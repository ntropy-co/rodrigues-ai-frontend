/**
 * Next.js API Route - Validate Reset Token Proxy
 *
 * This route acts as a proxy to the backend validate reset token API
 * to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/api/v1/auth/validate-reset-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/auth/validate-reset-token] Error:', error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
