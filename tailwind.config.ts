import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import plugin from 'tailwindcss/plugin'

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
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // Cores enterprise Verity Agro - Noble Green Palette
        verde: {
          50: 'hsl(var(--verde-50))',
          100: 'hsl(var(--verde-100))',
          200: 'hsl(var(--verde-200))',
          300: 'hsl(var(--verde-300))',
          400: 'hsl(var(--verde-400))',
          500: 'hsl(var(--verde-500))',
          600: 'hsl(var(--verde-600))',
          700: 'hsl(var(--verde-700))',
          800: 'hsl(var(--verde-800))',
          900: 'hsl(var(--verde-900))',
          950: 'hsl(var(--verde-950))'
        },
        ouro: {
          100: 'hsl(var(--ouro-100))',
          600: 'hsl(var(--ouro-600))',
          900: 'hsl(var(--ouro-900))'
        },
        bege: 'hsl(var(--bege))',
        enterprise: {
          green: 'hsl(var(--enterprise-green))',
          'green-hover': 'hsl(var(--enterprise-green-hover))',
          gold: 'hsl(var(--enterprise-gold))',
          'gold-hover': 'hsl(var(--enterprise-gold-hover))'
        },
        // Cinzas neutros enterprise
        neutral: {
          50: 'hsl(var(--neutral-50))',
          100: 'hsl(var(--neutral-100))',
          200: 'hsl(var(--neutral-200))',
          300: 'hsl(var(--neutral-300))',
          500: 'hsl(var(--neutral-500))',
          600: 'hsl(var(--neutral-600))',
          700: 'hsl(var(--neutral-700))',
          900: 'hsl(var(--neutral-900))'
        },
        // Backward compatibility aliases (mapeia para enterprise)
        'gemini-blue': 'hsl(var(--enterprise-green))',
        'gemini-blue-hover': 'hsl(var(--enterprise-green-hover))',
        'gemini-purple': 'hsl(var(--enterprise-gold))',
        'gemini-gray-50': 'hsl(var(--neutral-50))',
        'gemini-gray-100': 'hsl(var(--neutral-100))',
        'gemini-gray-200': 'hsl(var(--neutral-200))',
        'gemini-gray-300': 'hsl(var(--neutral-300))',
        'gemini-gray-500': 'hsl(var(--neutral-500))',
        'gemini-gray-600': 'hsl(var(--neutral-600))',
        'gemini-gray-700': 'hsl(var(--neutral-700))',
        'gemini-gray-900': 'hsl(var(--neutral-900))'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-crimson)', 'Georgia', 'serif'],
        serif: ['var(--font-crimson)', 'Georgia', 'serif'],
        inter: 'var(--font-inter)',
        playfair: 'var(--font-playfair)',
        crimson: 'var(--font-crimson)',
        geist: 'var(--font-geist-sans)',
        dmmono: 'var(--font-dm-mono)'
      },
      fontSize: {
        'display-2xl': [
          '4.5rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em' }
        ],
        'display-xl': [
          '3.75rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em' }
        ],
        'display-lg': [
          '3rem',
          { lineHeight: '1.15', letterSpacing: '-0.01em' }
        ],
        display: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }]
      },
      borderRadius: {
        xl: '10px'
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in': 'fadeIn 0.3s ease-out'
      },
      keyframes: {
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }
    }
  },
  plugins: [
    tailwindcssAnimate,
    plugin(function ({ addVariant }) {
      // Custom variant for hover states that only work on devices with fine pointers (not touch)
      addVariant('hover-hover', '@media (hover: hover) and (pointer: fine)')

      // Backdrop-blur apenas em desktop (min-width: 768px)
      // Evita performance ruim de backdrop-filter em mobile
      addVariant('backdrop-safe', '@media (min-width: 768px)')

      // Orientação paisagem (landscape)
      addVariant('landscape', '@media (orientation: landscape)')
    })
  ]
} satisfies Config
