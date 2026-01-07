/**
 * Verity Agro Design System Colors
 *
 * Adaptation of Claude.ai's premium palette to Verity's Monochromatic Green identity.
 * Use these constants when Tailwind classes are not available (e.g., canvas, inline styles).
 */

export const colors = {
  // Background layers
  bgPrimary: '#F5F9F7', // verde-50 aquecido (Claude: #FAFAF8)
  surface: '#FFFFFF', // Branco puro

  // Verde spectrum (950 → 50) - Enterprise Palette
  verde: {
    950: '#1A3A2E', // Text primary
    900: '#2D5A45', // Accent/CTA
    800: '#3A6B54', // Hover CTA
    700: '#478063', // Accent light
    600: '#5A7A6B', // Text secondary
    500: '#6D8D7D', // Medium
    400: '#8BA89B', // Text tertiary
    300: '#9DC4B0', // Border medium
    200: '#D1E7DD', // Border
    100: '#E8F3ED', // Border light
    50: '#F5F9F7' // Background
  },

  // Semantic Mappings
  text: {
    primary: '#1A3A2E',
    secondary: '#5A7A6B',
    tertiary: '#8BA89B',
    inverse: '#FFFFFF'
  },

  border: {
    light: '#E8F3ED',
    DEFAULT: '#D1E7DD',
    medium: '#9DC4B0',
    active: '#5A7A6B'
  },

  action: {
    primary: '#2D5A45',
    primaryHover: '#3A6B54',
    secondary: '#E8F3ED',
    secondaryHover: '#D1E7DD'
  },

  feedback: {
    success: '#2D5A45',
    warning: '#C9922A', // Ouro
    error: '#C53030'
  }
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgba(45, 90, 69, 0.05)',
  DEFAULT:
    '0 1px 3px 0 rgba(45, 90, 69, 0.08), 0 1px 2px -1px rgba(45, 90, 69, 0.08)',
  md: '0 4px 6px -1px rgba(45, 90, 69, 0.08), 0 2px 4px -2px rgba(45, 90, 69, 0.08)',
  lg: '0 10px 15px -3px rgba(45, 90, 69, 0.12), 0 4px 6px -4px rgba(45, 90, 69, 0.08)',
  xl: '0 20px 25px -5px rgba(45, 90, 69, 0.12), 0 8px 10px -6px rgba(45, 90, 69, 0.08)',
  '2xl': '0 25px 50px -12px rgba(45, 90, 69, 0.20)'
} as const
