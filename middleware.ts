import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isRouteEnabled } from '@/config/feature-flags'

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
