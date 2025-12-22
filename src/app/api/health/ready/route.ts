/**
 * Readiness Check Endpoint
 *
 * Verifies that all dependencies are ready to serve traffic.
 * Returns 200 if ready, 503 if not.
 *
 * Usage:
 *   GET /api/health/ready
 */

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import logger from '@/lib/logger'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET() {
  const checks: Record<string, { status: string; latency_ms?: number; error?: string }> = {}
  let allHealthy = true

  // 1. Check Redis
  try {
    const start = Date.now()
    await redis.ping()
    checks.redis = { status: 'ok', latency_ms: Date.now() - start }
  } catch (error) {
    checks.redis = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    allHealthy = false
  }

  // 2. Check Backend API
  try {
    const start = Date.now()
    const response = await fetch(`${BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(5000) // 5s timeout
    })
    checks.backend = {
      status: response.ok ? 'ok' : 'degraded',
      latency_ms: Date.now() - start
    }
    if (!response.ok) {
      allHealthy = false
    }
  } catch (error) {
    checks.backend = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Connection failed'
    }
    // Backend being down doesn't necessarily mean frontend is unhealthy
    // Mark as degraded but don't fail the check
  }

  const response = {
    status: allHealthy ? 'ready' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    checks
  }

  if (!allHealthy) {
    logger.warn({ checks }, 'Readiness check detected issues')
  }

  return NextResponse.json(response, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}
