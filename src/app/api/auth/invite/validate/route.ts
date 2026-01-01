/**
 * BFF (Next.js API Route) — Invite Validation
 *
 * Valida um token de convite usado no fluxo de signup.
 *
 * Frontend:
 * - `GET /api/auth/invite/validate?token=<invite_token>`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/organizations/invites/{token}/validate`
 *
 * Auth:
 * - Público
 *
 * Chamadores:
 * - `src/lib/auth/api.ts`, `src/hooks/useInviteValidation.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import type { Invite, Organization, InviteStatus, UserRole } from '@/types/auth'
import type { InviteValidationResponse } from '@/types/auth-api'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type BackendInviteValidation = {
  valid: boolean
  email: string
  organization_name: string | null
  role: string
  status: string
  expires_at: string
}

function mapInviteRole(role: string): UserRole {
  switch (role) {
    case 'admin':
      return 'admin'
    case 'viewer':
      return 'viewer'
    case 'member':
    default:
      return 'analyst'
  }
}

function mapInviteStatus(status: string): InviteStatus {
  switch (status) {
    case 'accepted':
      return 'accepted'
    case 'expired':
      return 'expired'
    case 'revoked':
    case 'cancelled':
      return 'revoked'
    case 'pending':
    default:
      return 'pending'
  }
}

function mapInviteError(
  status: string
): InviteValidationResponse['error'] | undefined {
  switch (status) {
    case 'expired':
      return 'expired'
    case 'accepted':
      return 'already_used'
    case 'revoked':
    case 'cancelled':
      return 'revoked'
    default:
      return 'invalid_token'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { detail: 'Token de convite é obrigatório' },
        { status: 400 }
      )
    }

    const backendUrl = new URL(
      `${BACKEND_URL}/api/v1/organizations/invites/${encodeURIComponent(token)}/validate`
    )

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const contentType = response.headers.get('content-type') || ''
    const data: unknown = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null)

    if (!response.ok) {
      if (response.status === 404) {
        const result: InviteValidationResponse = {
          valid: false,
          invite: null,
          organization: null,
          error: 'invalid_token'
        }
        return NextResponse.json(result, { status: 200 })
      }

      const errorData =
        data && typeof data === 'object'
          ? data
          : { detail: data || 'Request failed' }
      return NextResponse.json(errorData, { status: response.status })
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { detail: 'Invalid backend response' },
        { status: 502 }
      )
    }

    const backend = data as BackendInviteValidation

    if (!backend.valid) {
      const result: InviteValidationResponse = {
        valid: false,
        invite: null,
        organization: null,
        error: mapInviteError(backend.status)
      }
      return NextResponse.json(result, { status: 200 })
    }

    const now = new Date()
    const expiresAt = backend.expires_at ? new Date(backend.expires_at) : now
    const organizationName = backend.organization_name || 'Organization'

    const organization: Organization = {
      id: `org_${organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: organizationName,
      cnpj: '',
      plan: 'free',
      status: 'active',
      invitesQuota: 0,
      invitesUsed: 0,
      createdAt: now,
      updatedAt: now
    }

    const invite: Invite = {
      id: `invite_${token}`,
      token,
      organizationId: organization.id,
      email: backend.email,
      role: mapInviteRole(backend.role),
      status: mapInviteStatus(backend.status),
      sentAt: now,
      expiresAt,
      invitedBy: 'system'
    }

    const result: InviteValidationResponse = {
      valid: true,
      invite,
      organization
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[API Route /api/auth/invite/validate] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
