import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import plugin from 'tailwindcss/plugin'
import typography from '@tailwindcss/typography'

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@assistant-ui/**/*.{js,mjs}'
  ],
  safelist: [
    // Dynamic color classes that might be used programmatically
    {
      pattern:
        /^bg-(verity|sand|ouro|error)-(50|100|200|300|400|500|600|700|800|900|950)$/
    },
    {
      pattern:
        /^text-(verity|sand|ouro|error)-(50|100|200|300|400|500|600|700|800|900|950)$/
    },
    {
      pattern:
        /^border-(verity|sand|ouro|error)-(50|100|200|300|400|500|600|700|800|900|950)$/
    }
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
        verity: {
          '50': '#E8F3EE',
          '100': '#D1E7DD',
          '200': '#A3C2B5',
          '300': '#7A9F8F',
          '400': '#5C8070',
          '500': '#426154',
          '600': '#5C6D63',
          '700': '#2A4D3E',
          '800': '#1A3C30',
          '900': '#0D211A',
          '950': '#05110D'
        },
        sand: {
          '50': '#FDFCFB',
          '100': '#FDFCF8',
          '200': '#F3F1EB',
          '300': '#EBE9E1',
          '400': '#E5E5E5'
        },
        ouro: {
          '50': '#FDFBF4',
          '100': '#FAF2DE',
          '200': '#F5E4BD',
          '300': '#ECCB85',
          '400': '#E0B14E',
          '500': '#BFA070',
          '600': '#A68A56',
          '700': '#665214',
          '800': '#4D3E0F',
          '900': '#33290A',
          '950': '#1A1405'
        },
        error: {
          '50': '#FFF8F8',
          '100': '#FFF5F5',
          '200': '#FED7D7',
          '300': '#FEB2B2',
          '400': '#FC8181',
          '500': '#E53E3E',
          '600': '#C53030',
          '700': '#9B1C1C',
          '800': '#6E1212',
          '900': '#4A0B0B',
          '950': '#2D0606'
        },
        branco: '#FFFFFF',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      fontFamily: {
        display: ['var(--font-crimson)', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        inter: 'var(--font-inter)',
        crimson: 'var(--font-crimson)'
      },
      fontSize: {
        '6xl': [
          '3.75rem',
          {
            lineHeight: '1',
            letterSpacing: '-0.02em'
          }
        ],
        '5xl': [
          '3rem',
          {
            lineHeight: '1.1',
            letterSpacing: '-0.015em'
          }
        ],
        '4xl': [
          '2.25rem',
          {
            lineHeight: '1.2',
            letterSpacing: '-0.01em'
          }
        ],
        '3xl': [
          '1.875rem',
          {
            lineHeight: '1.3',
            letterSpacing: '-0.01em'
          }
        ],
        '2xl': [
          '1.5rem',
          {
            lineHeight: '1.4',
            letterSpacing: '-0.005em'
          }
        ],
        xl: [
          '1.25rem',
          {
            lineHeight: '1.5'
          }
        ],
        lg: [
          '1rem',
          {
            lineHeight: '1.5'
          }
        ],
        base: [
          '0.875rem',
          {
            lineHeight: '1.5'
          }
        ],
        sm: [
          '0.8125rem',
          {
            lineHeight: '1.5'
          }
        ],
        xs: [
          '0.75rem',
          {
            lineHeight: '1.5'
          }
        ]
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(45, 90, 69, 0.05)',
        DEFAULT:
          '0 1px 3px 0 rgba(45, 90, 69, 0.08), 0 1px 2px -1px rgba(45, 90, 69, 0.08)',
        md: '0 4px 6px -1px rgba(45, 90, 69, 0.08), 0 2px 4px -2px rgba(45, 90, 69, 0.08)',
        lg: '0 10px 15px -3px rgba(45, 90, 69, 0.12), 0 4px 6px -4px rgba(45, 90, 69, 0.08)',
        xl: '0 20px 25px -5px rgba(45, 90, 69, 0.12), 0 8px 10px -6px rgba(45, 90, 69, 0.08)',
        '2xl': '0 25px 50px -12px rgba(45, 90, 69, 0.20)',
        input:
          '0 1px 2px rgba(45, 90, 69, 0.06), 0 4px 12px rgba(45, 90, 69, 0.10), 0 16px 32px rgba(45, 90, 69, 0.14)',
        'input-focus':
          '0 2px 4px rgba(45, 90, 69, 0.08), 0 8px 16px rgba(45, 90, 69, 0.12), 0 20px 40px rgba(45, 90, 69, 0.16)'
      },
      borderRadius: {
        sm: '0.5rem',
        DEFAULT: '0.75rem',
        md: '0.875rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem'
      },
      transitionDuration: {
        '400': '400ms'
      },
      keyframes: {
        float: {
          '0%, 100%': {
            transform: 'translateY(-4px)'
          },
          '50%': {
            transform: 'translateY(4px)'
          }
        },
        shimmer: {
          '0%': {
            transform: 'translateX(-200%) skewX(-20deg)'
          },
          '100%': {
            transform: 'translateX(200%) skewX(-20deg)'
          }
        },
        'pulse-soft': {
          '0%, 100%': {
            opacity: '0.5',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.3)'
          }
        },
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        float: 'float 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-soft': 'pulse-soft 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
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
