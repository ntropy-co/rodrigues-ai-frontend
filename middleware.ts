import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Feature flags inline (MVP)
// Duplicado aqui porque middleware precisa ser independente para Edge Runtime
// O arquivo src/config/feature-flags.ts continua sendo usado pelas páginas
const FEATURE_FLAGS = {
  DASHBOARD: false,
  QUOTES: false,
  CPR_SIMULATOR: false,
  CPR_HISTORY: false,
  DOCUMENTS: false
} as const

const PROTECTED_ROUTES = {
  '/dashboard': FEATURE_FLAGS.DASHBOARD,
  '/quotes': FEATURE_FLAGS.QUOTES,
  '/cpr/simulator': FEATURE_FLAGS.CPR_SIMULATOR,
  '/cpr/historico': FEATURE_FLAGS.CPR_HISTORY,
  '/documents': FEATURE_FLAGS.DOCUMENTS
} as const

function isRouteEnabled(pathname: string): boolean {
  const normalizedPath = pathname.split('?')[0] // Remove query params

  // Verificar rota exata
  if (normalizedPath in PROTECTED_ROUTES) {
    return PROTECTED_ROUTES[normalizedPath as keyof typeof PROTECTED_ROUTES]
  }

  // Verificar rotas dinâmicas (ex: /cpr/simulator)
  if (normalizedPath.startsWith('/cpr/simulator')) {
    return FEATURE_FLAGS.CPR_SIMULATOR
  }

  if (normalizedPath.startsWith('/cpr/historico')) {
    return FEATURE_FLAGS.CPR_HISTORY
  }

  return true // Rota não protegida, permitir acesso
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se a rota está desabilitada
  if (!isRouteEnabled(pathname)) {
    // Redirecionar para /chat (rota padrão permitida)
    const url = request.nextUrl.clone()
    url.pathname = '/chat'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configurar matcher para aplicar middleware apenas nas rotas protegidas
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/quotes/:path*',
    '/cpr/simulator/:path*',
    '/cpr/historico/:path*',
    '/documents/:path*'
  ]
}
