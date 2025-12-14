/**
 * BFF (Next.js API Route) — Backend Health Check
 *
 * Usado pelo frontend para verificar se o backend está acessível.
 *
 * Frontend:
 * - `GET /api/playground/status`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/health`
 *
 * Chamadores:
 * - `src/api/playground.ts`, `src/hooks/useChatActions.ts`
 */

import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    // Forward the request to the backend health endpoint
    const response = await fetch(`${BACKEND_URL}/api/v1/health`, {
      method: 'GET'
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
