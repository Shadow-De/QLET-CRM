import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base (original)
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
        // Stitch Design System Colors
        'surface': '#16111b',
        'outline-variant': '#4d4354',
        'on-primary-fixed': '#2c0051',
        'on-tertiary-fixed': '#281900',
        'on-secondary': '#2600a1',
        'on-secondary-fixed': '#150067',
        'primary-fixed': '#f0dbff',
        'surface-bright': '#3d3741',
        'tertiary': '#fabc4e',
        'surface-container-lowest': '#110c15',
        'on-primary': '#490080',
        'on-tertiary': '#432c00',
        'surface-container-low': '#1f1a23',
        'tertiary-fixed-dim': '#fabc4e',
        'on-tertiary-container': '#3a2600',
        'on-primary-fixed-variant': '#6900b3',
        'inverse-primary': '#842bd2',
        'on-secondary-container': '#b3acff',
        'primary': '#ddb7ff',
        'primary-container': '#b76dff',
        'on-surface': '#eadfed',
        'background': '#16111b',
        'surface-container-high': '#2e2832',
        'on-tertiary-fixed-variant': '#604100',
        'surface-dim': '#16111b',
        'surface-variant': '#39323d',
        'tertiary-fixed': '#ffdead',
        'surface-container': '#231e27',
        'outline': '#988d9f',
        'on-surface-variant': '#cfc2d6',
        'on-primary-container': '#400071',
        'on-error': '#690005',
        'secondary': '#c5c0ff',
        'error': '#ffb4ab',
        'on-background': '#eadfed',
        'primary-fixed-dim': '#ddb7ff',
        'inverse-surface': '#eadfed',
        'inverse-on-surface': '#342e38',
        'secondary-fixed': '#e4dfff',
        'surface-container-highest': '#39323d',
        'tertiary-container': '#bd871a',
        'on-error-container': '#ffdad6',
        'error-container': '#93000a',
        'surface-tint': '#ddb7ff',
        'secondary-container': '#3c24c5',
        'on-secondary-fixed-variant': '#3c24c5',
        'secondary-fixed-dim': '#c5c0ff'
      },
      fontFamily: {
        sans: ['var(--font-space)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Fira Code', 'monospace'],
        headline: ['var(--font-space)', 'sans-serif'],
        display: ['var(--font-space)', 'sans-serif'],
        body: ['var(--font-space)', 'sans-serif'],
        label: ['var(--font-space)', 'sans-serif'],
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
