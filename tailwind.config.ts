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
        // Cores customizadas do Rodrigues AI
        primaryAccent: 'hsl(var(--primary-accent))',
        brand: 'hsl(var(--brand))',
        positive: 'hsl(var(--positive))',
        // Cores Gemini
        'gemini-blue': 'hsl(var(--gemini-blue))',
        'gemini-blue-hover': 'hsl(var(--gemini-blue-hover))',
        'gemini-purple': 'hsl(var(--gemini-purple))',
        'gemini-gray-50': 'hsl(var(--gemini-gray-50))',
        'gemini-gray-100': 'hsl(var(--gemini-gray-100))',
        'gemini-gray-200': 'hsl(var(--gemini-gray-200))',
        'gemini-gray-300': 'hsl(var(--gemini-gray-300))',
        'gemini-gray-500': 'hsl(var(--gemini-gray-500))',
        'gemini-gray-600': 'hsl(var(--gemini-gray-600))',
        'gemini-gray-700': 'hsl(var(--gemini-gray-700))',
        'gemini-gray-900': 'hsl(var(--gemini-gray-900))'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        inter: 'var(--font-inter)',
        geist: 'var(--font-geist-sans)',
        dmmono: 'var(--font-dm-mono)'
      },
      borderRadius: {
        xl: '10px'
      }
    }
  },
  plugins: [
    tailwindcssAnimate,
    // Custom variant for hover states that only work on devices with fine pointers (not touch)
    plugin(function ({ addVariant }) {
      addVariant('hover-hover', '@media (hover: hover) and (pointer: fine)')
    })
  ]
} satisfies Config
