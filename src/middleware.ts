/**
 * Next.js Middleware para Proteção de Segurança
 *
 * Este middleware implementa várias proteções de segurança:
 * - Validação de origem (Origin) para prevenir CSRF
 * - Validação de requisições apenas de mesma origem
 * - Headers de segurança adicionais
 *
 * CSRF Protection:
 * Para requisições que modificam dados (POST, PUT, DELETE, PATCH),
 * validamos que a origem da requisição corresponde ao host esperado.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Lista de métodos HTTP que modificam estado e precisam de proteção CSRF
 */
const MUTATION_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH']

/**
 * Lista de paths que devem ser excluídos da validação CSRF
 * Exemplo: webhooks de terceiros que precisam acessar a API
 */
const CSRF_EXEMPT_PATHS: string[] = [
  // Adicione aqui paths que devem ser isentos, ex:
  // '/api/webhooks/stripe',
]

export function middleware(request: NextRequest) {
  const { method, headers, nextUrl } = request

  // Apenas validar métodos que modificam estado
  if (MUTATION_METHODS.includes(method)) {
    // Verificar se o path está isento
    const isExempt = CSRF_EXEMPT_PATHS.some((path) =>
      nextUrl.pathname.startsWith(path)
    )

    if (!isExempt) {
      const origin = headers.get('origin')
      const host = headers.get('host')

      // Se há origin header, validar que corresponde ao host
      if (origin) {
        const originHost = new URL(origin).host

        // Validar que a requisição vem do mesmo host
        if (originHost !== host) {
          console.warn(
            `[Security] CSRF attempt blocked: origin=${originHost}, host=${host}`
          )
          return new NextResponse('CSRF validation failed', { status: 403 })
        }
      }
      // Nota: Algumas requisições podem não ter Origin header (ex: navegação direta)
      // Nesses casos, confiamos no SameSite cookie protection
    }
  }

  // Permitir a requisição continuar
  const response = NextResponse.next()

  // Adicionar headers de segurança adicionais
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

/**
 * Configuração do matcher para aplicar middleware apenas em rotas específicas
 * Aplicamos SOMENTE em rotas de API internas do Next.js (/api/*)
 *
 * IMPORTANTE: Não aplicar em todas as rotas, pois isso interfere com
 * chamadas fetch() para APIs externas feitas pelo cliente.
 */
export const config = {
  matcher: [
    '/api/:path*' // Apenas rotas de API internas do Next.js
  ]
}
