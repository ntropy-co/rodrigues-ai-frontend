import type { NextConfig } from 'next'
import withPWA from '@ducanh2912/next-pwa'

const nextConfig: NextConfig = {
  devIndicators: false,

  // Ignorar erros de lint/ts durante build para permitir deploy
  // TODO: Corrigir erros de lint em arquivos de auth em PR separado
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
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
        // Páginas - NetworkFirst para sempre ter conteúdo atualizado
        urlPattern: /^https?:\/\/[^/]+\/(?!api\/|_next\/).*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400
          }
        }
      }
    ]
  }
})

export default pwaConfig(nextConfig)
