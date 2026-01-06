/**
 * Feature Flags Configuration
 *
 * This file controls which features are enabled in the application.
 * Set to `true` to enable, `false` to disable.
 *
 * MVP Strategy: Chat-First. All CPR operations happen via chat.
 * Dedicated pages and tools are disabled for MVP.
 *
 * @see docs/product/MVP_SCOPE.md
 */

export const FEATURE_FLAGS = {
  // ============================================
  // MVP: Chat-First (Core Features)
  // ============================================

  /** Files sidebar toggle - needed for document upload in chat */
  FILES_SIDEBAR: true,

  /** Canvas/Preview sidebar on the right */
  CANVAS_SIDEBAR: true,

  /** Projects section in conversations sidebar */
  PROJECTS: true,

  // ============================================
  // Disabled for MVP (Future Features)
  // ============================================

  /** Tools dropdown in header (Dashboard, Cotações, CPR, Simulador, etc.) */
  TOOLS_DROPDOWN: false,

  /** Dedicated CPR pages (/cpr/criar, /cpr/analise, etc.) */
  CPR_DEDICATED_PAGES: false,

  /** Quotes chart visualization */
  QUOTES_CHART: false,

  /** Advanced slash command system */
  ADVANCED_SLASH_COMMANDS: false
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS
