/**
 * BFF (Next.js API Route) - Organization Settings
 *
 * Gets/updates settings for the current organization.
 *
 * Frontend:
 * - `GET  /api/organizations/settings`
 * - `PATCH /api/organizations/settings`
 *
 * Backend:
 * - `GET   ${BACKEND_URL}/api/v1/organizations/current/settings`
 * - `PATCH ${BACKEND_URL}/api/v1/organizations/current/settings`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Callers:
 * - `src/hooks/useOrganizationSettings.ts`
 * - `src/components/organization/SettingsForm.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  updateOrganizationSettingsSchema,
  type UpdateOrganizationSettingsInput
} from '@/lib/organizations/validations'
import { type ZodError, type ZodIssue } from 'zod'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - Get organization settings
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/organizations/current/settings`,
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
    console.error('[API Route /api/organizations/settings] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch organization settings' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update organization settings
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
      updateOrganizationSettingsSchema.parse(body)
    } catch (validationError) {
      if (
        validationError &&
        typeof validationError === 'object' &&
        'issues' in validationError
      ) {
        const zodError =
          validationError as ZodError<UpdateOrganizationSettingsInput>
        return NextResponse.json(
          {
            detail: 'Invalid input data',
            errors: zodError.issues.map((err: ZodIssue) => ({
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
      `${BACKEND_URL}/api/v1/organizations/current/settings`,
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
    console.error('[API Route /api/organizations/settings] PATCH Error:', error)
    return NextResponse.json(
      { detail: 'Failed to update organization settings' },
      { status: 500 }
    )
  }
}
