/**
 * Upstash Redis Client
 *
 * Cliente Redis configurado para cache de cotações e dados temporários.
 * Usa Upstash Redis para persistência serverless.
 */

import { Redis } from '@upstash/redis'

// =============================================================================
// Redis Client
// =============================================================================

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export { redis }

// =============================================================================
// Cache Helpers
// =============================================================================

/**
 * Get cached value or fetch and cache
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  // Try to get from cache
  const cached = await redis.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const fresh = await fetcher()

  // Cache it
  await redis.set(key, fresh, { ex: ttlSeconds })

  return fresh
}

/**
 * Invalidate cache by key pattern
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

export default redis
