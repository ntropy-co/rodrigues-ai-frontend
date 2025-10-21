import type { NextConfig } from 'next'

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
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https: blob:",
          "font-src 'self' data:",
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

export default nextConfig
