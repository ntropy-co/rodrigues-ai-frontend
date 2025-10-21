declare module 'next-pwa' {
  import { NextConfig } from 'next'

  interface PWAConfig {
    dest?: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    fallbacks?: {
      document?: string
      image?: string
    }
    runtimeCaching?: Array<{
      urlPattern: RegExp | string
      handler:
        | 'CacheFirst'
        | 'NetworkFirst'
        | 'StaleWhileRevalidate'
        | 'NetworkOnly'
        | 'CacheOnly'
      options?: {
        cacheName?: string
        expiration?: {
          maxEntries?: number
          maxAgeSeconds?: number
        }
        networkTimeoutSeconds?: number
      }
    }>
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig

  export default withPWA
}
