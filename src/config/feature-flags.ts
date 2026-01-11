/**
 * Feature Flags para MVP
 * Centraliza todas as flags de features desabilitadas
 */

export const FEATURE_FLAGS = {
  // Rotas principais
  DASHBOARD: false,
  QUOTES: false,
  CPR_SIMULATOR: false,
  CPR_HISTORY: false,
  DOCUMENTS: false,

  // Features de UI (para referência, não usadas no middleware)
  CANVAS: false,
  TOUR: false,
  TOOLS_MENU: false,
  FILES_SIDEBAR: false,
  SLASH_COMMANDS: false,
  MENTION_COMMANDS: false,
  IMAGE_CREATION: false,
  AGENT_MODE: false
} as const

/**
 * Rotas protegidas (rotas que devem ser bloqueadas se desabilitadas)
 */
export const PROTECTED_ROUTES = {
  '/dashboard': FEATURE_FLAGS.DASHBOARD,
  '/quotes': FEATURE_FLAGS.QUOTES,
  '/cpr/simulator': FEATURE_FLAGS.CPR_SIMULATOR,
  '/cpr/historico': FEATURE_FLAGS.CPR_HISTORY,
  '/documents': FEATURE_FLAGS.DOCUMENTS
} as const

/**
 * Verifica se uma rota está habilitada
 */
export function isRouteEnabled(pathname: string): boolean {
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
