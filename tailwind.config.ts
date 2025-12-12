import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import plugin from 'tailwindcss/plugin'
import typography from '@tailwindcss/typography'

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Standard Shadcn/Radix aliases mapped to Verity Palette
        border: '#E8F3ED', // verde-100
        input: '#D1E7DD', // verde-200
        ring: '#5A7A6B', // verde-600
        background: '#F5F9F7', // bg-primary
        foreground: '#1A3A2E', // text-primary

        primary: {
          DEFAULT: '#2D5A45', // verde-900
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#E8F3ED', // verde-100
          foreground: '#1A3A2E' // verde-950
        },
        destructive: {
          DEFAULT: '#C53030',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#F0F8F4', // verde-50
          foreground: '#5A7A6B' // verde-600
        },
        accent: {
          DEFAULT: '#E8F3ED', // verde-100
          foreground: '#1A3A2E'
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A3A2E'
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A3A2E'
        },

        // Semantic Layers (Claude-Inspired)
        'bg-primary': '#F5F9F7', // verde-50 aquecido
        surface: '#FFFFFF', // Branco puro

        // Verde spectrum (950 → 50) - Verity Agro Monochromatic
        verde: {
          950: '#1A3A2E', // Text primary (mais escuro)
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

        // Ouro (apenas para R$)
        ouro: {
          600: '#C9922A',
          500: '#D4A034',
          400: '#E0B14E'
        },

        // Feedback colors
        error: {
          600: '#C53030',
          500: '#E53E3E',
          400: '#FC8181'
        },

        // Shortcuts (aliases)
        branco: '#FFFFFF'
      },

      // Typography
      fontFamily: {
        display: ['var(--font-crimson)', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        // Legacy aliases
        inter: 'var(--font-inter)',
        crimson: 'var(--font-crimson)'
      },

      fontSize: {
        // Display sizes
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }], // 60px
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }], // 48px
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 36px
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }], // 30px
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.005em' }], // 24px
        xl: ['1.25rem', { lineHeight: '1.5' }], // 20px

        // Body sizes
        lg: ['1rem', { lineHeight: '1.5' }], // 16px
        base: ['0.875rem', { lineHeight: '1.5' }], // 14px
        sm: ['0.8125rem', { lineHeight: '1.5' }], // 13px
        xs: ['0.75rem', { lineHeight: '1.5' }] // 12px
      },

      // Shadows (verde em vez de preto)
      boxShadow: {
        sm: '0 1px 2px 0 rgba(45, 90, 69, 0.05)',
        DEFAULT:
          '0 1px 3px 0 rgba(45, 90, 69, 0.08), 0 1px 2px -1px rgba(45, 90, 69, 0.08)',
        md: '0 4px 6px -1px rgba(45, 90, 69, 0.08), 0 2px 4px -2px rgba(45, 90, 69, 0.08)',
        lg: '0 10px 15px -3px rgba(45, 90, 69, 0.12), 0 4px 6px -4px rgba(45, 90, 69, 0.08)',
        xl: '0 20px 25px -5px rgba(45, 90, 69, 0.12), 0 8px 10px -6px rgba(45, 90, 69, 0.08)',
        '2xl': '0 25px 50px -12px rgba(45, 90, 69, 0.20)',

        // Custom shadows (input 3D)
        input:
          '0 1px 2px rgba(45, 90, 69, 0.06), 0 4px 12px rgba(45, 90, 69, 0.10), 0 16px 32px rgba(45, 90, 69, 0.14)',
        'input-focus':
          '0 2px 4px rgba(45, 90, 69, 0.08), 0 8px 16px rgba(45, 90, 69, 0.12), 0 20px 40px rgba(45, 90, 69, 0.16)'
      },

      // Border radius (Claude-style)
      borderRadius: {
        sm: '0.5rem', // 8px
        DEFAULT: '0.75rem', // 12px
        md: '0.875rem', // 14px
        lg: '1rem', // 16px
        xl: '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '2rem' // 32px
      },

      // Spacing (sistema 4px)
      spacing: {
        '18': '4.5rem', // 72px
        '22': '5.5rem' // 88px
      },

      // Animation durations
      transitionDuration: {
        '400': '400ms'
      },

      // Custom animations
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-4px)' },
          '50%': { transform: 'translateY(4px)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-200%) skewX(-20deg)' },
          '100%': { transform: 'translateX(200%) skewX(-20deg)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' }
        }
      },
      animation: {
        float: 'float 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-soft': 'pulse-soft 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
      }
    }
  },

  plugins: [
    tailwindcssAnimate,
    typography,
    plugin(function ({ addVariant }) {
      addVariant('hover-hover', '@media (hover: hover) and (pointer: fine)')
      addVariant('backdrop-safe', '@media (min-width: 768px)')
      addVariant('landscape', '@media (orientation: landscape)')
    })
  ]
} satisfies Config
