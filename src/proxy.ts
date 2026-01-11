/**
 * Next.js Middleware para Protecao de Seguranca
 *
 * Este middleware implementa várias proteções de segurança:
 * - Rate Limiting (Upstash) para proteção contra abuso
 * - Validação de origem (Origin) para prevenir CSRF
 * - Headers de segurança adicionais
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// =============================================================================
// Rate Limiting Configuration
// =============================================================================

// Initialize Ratelimit only if env vars are present
let ratelimit: Ratelimit | null = null

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  })

  // Limit: 20 requests per 10 seconds per IP
  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(20, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit'
  })
}

// =============================================================================
// CSRF Configuration
// =============================================================================

const MUTATION_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH']

// Paths that don't require CSRF validation (public endpoints)
const CSRF_EXEMPT_PATHS = ['/api/health', '/api/webhooks'] as const

export async function proxy(request: NextRequest) {
  const { method, headers, nextUrl } = request
  // Security Fix: Parse x-forwarded-for correctly to prevent spoofing
  // Only use the FIRST IP (set by the trusted proxy), ignore attacker-injected IPs
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  // Priority: x-real-ip (set by proxy) > first x-forwarded-for > fallback
  const ip = realIp || forwardedFor?.split(',')[0]?.trim() || '127.0.0.1'
  const pathname = nextUrl.pathname
  // 1. Rate Limiting (Skip for Health Check)
  if (
    ratelimit &&
    pathname.startsWith('/api') &&
    !pathname.startsWith('/api/health')
  ) {
    const identifier = ip || 'anonymous'

    try {
      const { success, limit, reset, remaining } =
        await ratelimit.limit(identifier)

      if (!success) {
        return NextResponse.json(
          { error: 'Too Many Requests', retryAfter: reset },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString()
            }
          }
        )
      }
    } catch (error) {
      console.error('Rate limit error:', error)
      // Fail open if Redis is down
    }
  }

  // 2. CSRF Protection (MANDATORY for mutations)
  if (MUTATION_METHODS.includes(method)) {
    const isExempt = CSRF_EXEMPT_PATHS.some((path) => pathname.startsWith(path))

    if (!isExempt) {
      const origin = headers.get('origin')
      const host = headers.get('host')

      // Origin header is REQUIRED for non-exempt mutations
      if (!origin) {
        console.warn(
          `[Security] CSRF blocked: missing Origin header for ${method} ${pathname}`
        )
        return new NextResponse(
          'CSRF validation failed: Origin header required',
          {
            status: 403
          }
        )
      }

      let originHost: string
      try {
        originHost = new URL(origin).host
      } catch (error) {
        console.warn(`[Security] Invalid Origin: ${origin}`, error)
        return new NextResponse('CSRF validation failed: Invalid Origin', {
          status: 403
        })
      }

      if (!host || originHost !== host) {
        console.warn(
          `[Security] CSRF blocked: origin=${originHost}, host=${host}`
        )
        return new NextResponse('CSRF validation failed: Origin mismatch', {
          status: 403
        })
      }
    }
  }

  // 3. Response & Security Headers
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    '/api/:path*' // Apenas rotas de API
  ]
}
