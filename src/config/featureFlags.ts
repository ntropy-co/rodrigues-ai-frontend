/**
 * Feature Flags Configuration
 *
 * This file controls which features are enabled in the application.
 * Set to `true` to enable, `false` to disable.
 *
 * MVP Strategy: Start with minimal features and enable more as they're validated.
 */

export const FEATURE_FLAGS = {
  /** Tools dropdown in header (Dashboard, Cotações, CPR, Simulador, etc.) */
  TOOLS_DROPDOWN: false,

  /** Canvas/Preview sidebar on the right */
  CANVAS_SIDEBAR: true,

  /** Files sidebar toggle */
  FILES_SIDEBAR: true,

  /** Projects section in conversations sidebar */
  PROJECTS: true
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS
