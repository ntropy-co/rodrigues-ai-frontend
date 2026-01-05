/**
 * Constantes da aplicação
 * Centralizando magic numbers e valores configuráveis
 */

// ============================================
// UI - Scroll e Interações
// ============================================

/** Distância em pixels do fundo para considerar "próximo ao fim" */
export const SCROLL_BOTTOM_THRESHOLD = 200

/** Tamanho mínimo de touch targets para acessibilidade (WCAG 2.1) */
export const MIN_TOUCH_TARGET_SIZE = 44

// ============================================
// Timings e Animações
// ============================================

/** Duração do feedback visual de "copiado" em milissegundos */
export const COPY_FEEDBACK_DURATION = 2000

/** Intervalo de atualização automática de sessões em milissegundos */
export const SESSION_REFRESH_INTERVAL = 5000

/** Intervalo de rotação automática do carrossel em milissegundos */
export const CAROUSEL_AUTO_SCROLL_INTERVAL = 10000

/** Duração da transição do carrossel em milissegundos */
export const CAROUSEL_TRANSITION_DURATION = 600

// ============================================
// Carrossel - Responsividade
// ============================================

/** Breakpoint mobile/desktop para carrossel (768px = Tailwind 'md') */
export const CAROUSEL_MOBILE_BREAKPOINT = 768

/** Número de cards por página no mobile */
export const CAROUSEL_ITEMS_PER_VIEW_MOBILE = 1

/** Número de cards por página no desktop */
export const CAROUSEL_ITEMS_PER_VIEW_DESKTOP = 3

// ============================================
// Text & Content
// ============================================

/** Comprimento máximo de descrição antes de truncar */
export const MAX_DESCRIPTION_LENGTH = 50

/** Altura máxima do textarea em pixels */
export const MAX_TEXTAREA_HEIGHT = 120

// ============================================
// Categorias de Sugestões
// ============================================

export const SUGGESTION_CATEGORIES = {
  BASIC: 'basic',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
} as const

export type SuggestionCategory =
  (typeof SUGGESTION_CATEGORIES)[keyof typeof SUGGESTION_CATEGORIES]

// ============================================
// Cores por Categoria
// ============================================

export const CATEGORY_COLORS: Record<string, string> = {
  [SUGGESTION_CATEGORIES.BASIC]: 'text-verity-600',
  [SUGGESTION_CATEGORIES.ADVANCED]: 'text-verity-600',
  [SUGGESTION_CATEGORIES.EXPERT]: 'text-ouro-600'
}

export const CATEGORY_BG_COLORS: Record<string, string> = {
  [SUGGESTION_CATEGORIES.BASIC]: 'bg-verity-500',
  [SUGGESTION_CATEGORIES.ADVANCED]: 'bg-verity-500',
  [SUGGESTION_CATEGORIES.EXPERT]: 'bg-ouro-500'
}

// ============================================
// Labels de Categoria
// ============================================

export const CATEGORY_LABELS: Record<string, string> = {
  [SUGGESTION_CATEGORIES.BASIC]: 'Básico',
  [SUGGESTION_CATEGORIES.ADVANCED]: 'Avançado',
  [SUGGESTION_CATEGORIES.EXPERT]: 'Expert'
}

// ============================================
// Roles de Mensagem
// ============================================

export const MESSAGE_ROLES = {
  USER: 'user',
  AGENT: 'agent'
} as const

export type MessageRole = (typeof MESSAGE_ROLES)[keyof typeof MESSAGE_ROLES]
