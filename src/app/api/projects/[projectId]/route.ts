/**
 * BFF (Next.js API Route) — Project by ID
 *
 * Obtém/atualiza/remove um projeto específico.
 *
 * Frontend:
 * - `GET    /api/projects/:projectId`
 * - `PATCH  /api/projects/:projectId`
 * - `DELETE /api/projects/:projectId`
 *
 * Backend:
 * - `GET    ${BACKEND_URL}/api/v1/projects/{projectId}`
 * - `PATCH  ${BACKEND_URL}/api/v1/projects/{projectId}`
 * - `DELETE ${BACKEND_URL}/api/v1/projects/{projectId}`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Chamadores:
 * - `src/hooks/useProjects.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type RouteParams = { params: Promise<{ projectId: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = getAuthorizationFromRequest(request)
    const { projectId } = await params

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/projects/${projectId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        }
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/projects/[projectId]] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = getAuthorizationFromRequest(request)
    const { projectId } = await params

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/api/v1/projects/${projectId}`,
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
    console.error('[API Route /api/projects/[projectId]] PATCH Error:', error)
    return NextResponse.json(
      { detail: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = getAuthorizationFromRequest(request)
    const { projectId } = await params

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/projects/${projectId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: authorization
        }
      }
    )

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/projects/[projectId]] DELETE Error:', error)
    return NextResponse.json(
      { detail: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
