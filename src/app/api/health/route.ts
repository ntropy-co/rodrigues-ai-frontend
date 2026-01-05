import { NextResponse } from 'next/server'

import logger from '@/lib/logger'

export async function GET() {
  try {
    // Check Redis connection (Removed: Frontend should not connect to Redis)
    // const start = Date.now()
    // await redis.ping()
    // const redisLatency = Date.now() - start

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'ok' // Mock for now until we have a real DB
          // redis: { status: 'connected', latency_ms: redisLatency }
        },
        version: process.env.npm_package_version || '0.1.0'
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Health check failed'
    )
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          // redis: 'disconnected'
        }
      },
      { status: 503 }
    )
  }
}
