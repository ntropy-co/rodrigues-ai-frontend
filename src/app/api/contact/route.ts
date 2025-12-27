/**
 * BFF (Next.js API Route) - Contact
 *
 * Public endpoint for contact form submissions.
 *
 * Frontend:
 * - `POST /api/contact`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/public/contact`
 *
 * Auth:
 * - NOT required (public endpoint)
 *
 * Callers:
 * - `src/hooks/useContact.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * POST - Submit contact form
 *
 * This is a PUBLIC endpoint - no authentication required.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Basic validation before forwarding to backend
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Todos os campos obrigatorios devem ser preenchidos'
        },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/public/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/contact] POST Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao enviar mensagem. Tente novamente mais tarde.'
      },
      { status: 500 }
    )
  }
}
