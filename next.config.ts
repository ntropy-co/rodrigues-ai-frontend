import type { NextConfig } from 'next'
import withPWA from '@ducanh2912/next-pwa'
// Temporariamente comentado para resolver erro middleware.js.nft.json no Vercel
// import { withSentryConfig } from '@sentry/nextjs'
import bundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  // Configuração turbopack vazia para evitar erro com plugins webpack
  // Next.js 16 usa Turbopack por padrão, mas plugins podem adicionar webpack config
  turbopack: {},
  devIndicators: false,

  // Security headers
  async headers() {
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          // Next.js precisa de 'unsafe-inline' para funcionar
          // Em desenvolvimento, 'unsafe-eval' é necessário para React Refresh (hot reload)
          process.env.NODE_ENV === 'development'
            ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us-assets.i.posthog.com"
            : "script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com",
          // Permitir Google Fonts CSS
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: https: blob:",
          // Permitir Google Fonts arquivos de fonte
          "font-src 'self' data: https://fonts.gstatic.com",
          // Permitir conexões com a API backend, Sentry e PostHog
          "connect-src 'self' https://api.verityagro.com https://*.ingest.sentry.io https://*.sentry.io https://us.i.posthog.com https://us.posthog.com https://us-assets.i.posthog.com",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'",
          'upgrade-insecure-requests'
        ].join('; ')
      },
      {
        // Previne que o site seja carregado em iframes (clickjacking protection)
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        // Previne MIME type sniffing
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        // Controla quanto de informação de referência é incluída
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        // Desabilita features do navegador que não são usadas
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      },
      {
        // XSS Protection (legacy browsers)
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      }
    ]

    // Adicionar HSTS apenas em produção
    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      })
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}

// Configuração PWA
const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // Fix: Configuração simplificada para evitar erro "_async_to_generator is not defined"
  // O bug ocorre porque o plugin gera código ES6+ não transpilado no SW
  workboxOptions: {
    // Desabilitar o handler padrão que usa async/await
    skipWaiting: true,
    clientsClaim: true,
    // Caching rules simplificadas - sem plugins customizados
    runtimeCaching: [
      {
        // CRÍTICO: APIs nunca devem ser cacheadas
        urlPattern: /\/api\/.*/i,
        handler: 'NetworkOnly'
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 31536000 // 1 ano
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 604800 // 1 semana
          }
        }
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-font-assets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 604800
          }
        }
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 2592000 // 30 dias
          }
        }
      },
      {
        urlPattern: /\/_next\/static.+\.js$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static-js-assets',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 86400
          }
        }
      },
      {
        // Navegações (HTML) - cache apenas para rotas públicas
        urlPattern: ({ request, url }: { request: Request; url: URL }) => {
          const origin = (
            globalThis as unknown as { location?: { origin?: string } }
          ).location?.origin

          if (
            request.mode !== 'navigate' ||
            url.origin !== origin ||
            url.pathname.startsWith('/api') ||
            url.pathname.startsWith('/_next')
          ) {
            return false
          }

          const publicPaths = [
            '/',
            '/login',
            '/signup',
            '/forgot-password',
            '/reset-password',
            '/contact'
          ]

          if (publicPaths.includes(url.pathname)) {
            return true
          }

          return url.pathname.startsWith('/invite/')
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'public-pages',
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 86400
          }
        }
      }
    ]
  }
})

// Sentry configuration for source maps upload
// Temporariamente desabilitado para resolver erro middleware.js.nft.json no Vercel
// TODO: Reabilitar quando o problema do Sentry com middleware for resolvido
// const sentryOptions = {
//   // Organization and project slugs from Sentry
//   org: process.env.SENTRY_ORG,
//   project: process.env.SENTRY_PROJECT,
//
//   // Auth token for uploading source maps
//   authToken: process.env.SENTRY_AUTH_TOKEN,
//
//   // Suppress logs unless in CI
//   silent: !process.env.CI,
//
//   // Hide source maps from browser devtools in production
//   hideSourceMaps: true,
//
//   // Bundle size optimizations
//   bundleSizeOptimizations: {
//     excludeDebugStatements: true
//   }
// }

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

// Temporariamente removido withSentryConfig para resolver erro middleware.js.nft.json
// export default withSentryConfig(
//   withBundleAnalyzer(pwaConfig(nextConfig)),
//   sentryOptions
// )
export default withBundleAnalyzer(pwaConfig(nextConfig))
