import type { NextConfig } from 'next'
import withPWA from 'next-pwa'

const nextConfig: NextConfig = {
  devIndicators: false,

  // Apenas ignorar erros em desenvolvimento
  // Em produção, queremos que o build falhe se houver erros
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production'
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV !== 'production'
  },

  // Headers de segurança
  async headers() {
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          // Next.js precisa de 'unsafe-eval' e 'unsafe-inline' para funcionar
          "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
          // Permitir Google Fonts CSS
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: https: blob:",
          // Permitir Google Fonts arquivos de fonte
          "font-src 'self' data: https://fonts.gstatic.com",
          // Permitir conexões com a API backend
          "connect-src 'self' https://rodrigues-ai-backend-production.up.railway.app https://api.rodriguesagro.com.br",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'"
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

// Configuração PWA com estratégias de cache
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Página offline fallback
  fallbacks: {
    document: '/offline'
  },
  // Estratégias de cache para diferentes recursos
  runtimeCaching: [
    {
      // Cache de respostas da API com NetworkFirst
      urlPattern:
        /^https:\/\/rodrigues-ai-backend-production\.up\.railway\.app\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 horas
        },
        networkTimeoutSeconds: 10
      }
    },
    {
      // Cache de imagens com CacheFirst (prioriza cache)
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 dias
        }
      }
    },
    {
      // Cache de assets estáticos com StaleWhileRevalidate
      urlPattern: /\.(?:js|css|woff2)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 dias
        }
      }
    }
  ]
})

export default pwaConfig(nextConfig)
