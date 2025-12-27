/**
 * BFF (Next.js API Route) - Current Organization
 *
 * Gets/updates the current organization for the authenticated user.
 *
 * Frontend:
 * - `GET  /api/organizations/current`
 * - `PATCH /api/organizations/current`
 *
 * Backend:
 * - `GET   ${BACKEND_URL}/api/v1/organizations/current`
 * - `PATCH ${BACKEND_URL}/api/v1/organizations/current`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Callers:
 * - `src/hooks/useOrganization.ts`
 * - `src/components/organization/OrganizationSettings.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'
import { updateOrganizationSchema } from '@/lib/organizations/validations'
import { ZodError } from 'zod'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - Get the current organization
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/organizations/current`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        }
      }
    )

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('[API Route /api/organizations/current] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch organization' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update the current organization
 */
export async function PATCH(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    try {
      updateOrganizationSchema.parse(body)
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return NextResponse.json(
          {
            detail: 'Invalid input data',
            errors: validationError.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        )
      }
      throw validationError
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/organizations/current`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        },
        body: JSON.stringify(body)
      }
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/organizations/current] PATCH Error:', error)
    return NextResponse.json(
      { detail: 'Failed to update organization' },
      { status: 500 }
    )
  }
}
