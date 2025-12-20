import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET() {
  try {
    // Check Redis connection
    const start = Date.now()
    await redis.ping()
    const redisLatency = Date.now() - start

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'ok', // Mock for now until we have a real DB
          redis: {
            status: 'connected',
            latency_ms: redisLatency
          }
        },
        version: process.env.npm_package_version || '0.1.0'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          redis: 'disconnected'
        }
      },
      { status: 503 }
    )
  }
}
