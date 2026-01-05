/**
 * Verity Agro Design System Colors
 *
 * Adaptation of Claude.ai's premium palette to Verity's Monochromatic Green identity.
 * Use these constants when Tailwind classes are not available (e.g., canvas, inline styles).
 */

export const colors = {
  // Background layers
  bgPrimary: '#FDFCFB', // Sand-50 (base)
  surface: '#FFFFFF', // Branco puro

  // Verity spectrum (950 → 50)
  verde: {
    950: '#05110D', // Darkest
    900: '#0D211A', // Text primary
    800: '#1A3C30', // Brand primary
    700: '#2A4D3E', // Hover CTA
    600: '#5C6D63', // Text secondary
    500: '#426154', // Medium
    400: '#5C8070', // Text tertiary
    300: '#7A9F8F', // Accent
    200: '#A3C2B5', // Light accent
    100: '#D1E7DD', // Border
    50: '#E8F3EE' // Background
  },

  // Semantic Mappings
  text: {
    primary: '#0D211A',
    secondary: '#5C6D63',
    tertiary: '#7A9F8F',
    inverse: '#FFFFFF'
  },

  border: {
    light: '#F3F1EB',
    DEFAULT: '#EBE9E1',
    medium: '#E5E5E5',
    active: '#5C8070'
  },

  action: {
    primary: '#1A3C30',
    primaryHover: '#2A4D3E',
    secondary: '#F3F1EB',
    secondaryHover: '#EBE9E1'
  },

  feedback: {
    success: '#1A3C30',
    warning: '#BFA070', // Ouro Champagne
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
