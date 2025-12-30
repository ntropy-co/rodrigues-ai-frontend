/**
 * BFF (Next.js API Route) - Settings Profile
 *
 * Manages user profile information.
 *
 * Frontend:
 * - `GET  /api/settings/profile` - Get user profile
 * - `PATCH /api/settings/profile` - Update user profile
 *
 * Backend:
 * - `GET  ${BACKEND_URL}/api/v1/settings/profile`
 * - `PATCH ${BACKEND_URL}/api/v1/settings/profile`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Callers:
 * - `src/hooks/useSettings.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Input validation schema for profile updates
const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  phone_number: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, 'Invalid phone number format')
    .optional()
    .nullable(),
  job_title: z
    .string()
    .max(100, 'Job title must be at most 100 characters')
    .optional()
    .nullable(),
  company_name: z
    .string()
    .max(200, 'Company name must be at most 200 characters')
    .optional()
    .nullable(),
  avatar_url: z.string().url('Invalid URL format').optional().nullable()
})

/**
 * GET - Get user profile
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/settings/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      }
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('[API Route /api/settings/profile] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input with Zod schema
    const parseResult = updateProfileSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          detail: 'Invalid input data',
          errors: parseResult.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const validatedData = parseResult.data

    const response = await fetch(`${BACKEND_URL}/api/v1/settings/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify(validatedData)
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/settings/profile] PATCH Error:', error)
    return NextResponse.json(
      { detail: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
