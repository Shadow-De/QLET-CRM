import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base
        base: {
          bg: '#0B0B12',
          surface: '#14141F',
          border: 'rgba(168,85,247,0.15)',
        },
        // Primary accent — neon purple
        purple: {
          DEFAULT: '#A855F7',
          dim: '#7C3AED',
          glow: 'rgba(168,85,247,0.3)',
        },
        // Secondary accent — electric violet-blue
        violet: {
          DEFAULT: '#6D5EF5',
          dim: '#4F46E5',
        },
        // Status colours (semantic)
        status: {
          won: '#39FF88',
          lost: '#FF5C5C',
          new: '#A855F7',
          contacted: '#6D5EF5',
          viewing: '#F59E0B',
          negotiating: '#3B82F6',
        },
        // Text
        text: {
          primary: '#F1F1F8',
          secondary: '#9898B0',
          muted: '#5C5C78',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-texture': `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 31px,
            rgba(168,85,247,0.06) 31px,
            rgba(168,85,247,0.06) 32px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 31px,
            rgba(168,85,247,0.06) 31px,
            rgba(168,85,247,0.06) 32px
          )
        `,
      },
      boxShadow: {
        'purple-glow': '0 0 20px rgba(168,85,247,0.25), 0 0 40px rgba(168,85,247,0.1)',
        'purple-glow-sm': '0 0 10px rgba(168,85,247,0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
      },
      animation: {
        'grid-drift': 'gridDrift 60s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
      },
      keyframes: {
        gridDrift: {
          '0%': { backgroundPosition: '0 0, 0 0' },
          '100%': { backgroundPosition: '32px 32px, 32px 32px' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
}

export default config
