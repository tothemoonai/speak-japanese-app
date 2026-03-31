import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        headline: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
        label: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Surface layers (tonal stacking - NO borders)
        surface: '#0b1326',
        'surface-container-lowest': '#060e20',
        'surface-container-low': '#131b2e',
        'surface-container': '#171f33',
        'surface-container-high': '#222a3d',
        'surface-container-highest': '#2d3449',
        'surface-dim': '#0b1326',
        'surface-bright': '#31394d',
        'surface-variant': '#2d3449',
        'surface-tint': '#3cddc7',

        // On-surface (text colors)
        'on-surface': '#dae2fd',
        'on-surface-variant': '#bacac5',

        // Primary (teal - active states)
        primary: {
          DEFAULT: '#57f1db',
          foreground: '#003731',
          container: '#2dd4bf',
          fixed: '#62fae3',
          'fixed-dim': '#3cddc7',
        },

        // Secondary (brushed aluminum - inactive)
        secondary: {
          DEFAULT: '#b9c8de',
          foreground: '#233143',
          container: '#39485a',
          fixed: '#d4e4fa',
          'fixed-dim': '#b9c8de',
        },

        // Tertiary (gold - achievements ONLY)
        tertiary: {
          DEFAULT: '#ffd29f',
          foreground: '#472a00',
          container: '#ffad3a',
          fixed: '#ffddb8',
          'fixed-dim': '#ffb95f',
        },

        // Error
        error: {
          DEFAULT: '#ffb4ab',
          foreground: '#690005',
          container: '#93000a',
        },

        // Outlines (ghost borders at 15% opacity only)
        outline: '#859490',
        'outline-variant': '#3c4a46',

        // Inverse
        'inverse-surface': '#dae2fd',
        'inverse-on-surface': '#283044',
        'inverse-primary': '#006b5f',

        // Semantic aliases for shadcn compatibility
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: '#0b1326',
        foreground: '#dae2fd',

        muted: {
          DEFAULT: '#171f33',
          foreground: '#bacac5',
        },
        accent: {
          DEFAULT: '#222a3d',
          foreground: '#dae2fd',
        },
        popover: {
          DEFAULT: '#131b2e',
          foreground: '#dae2fd',
        },
        card: {
          DEFAULT: '#131b2e',
          foreground: '#dae2fd',
        },
        destructive: {
          DEFAULT: '#ffb4ab',
          foreground: '#690005',
        },
        warning: {
          DEFAULT: '#ffd29f',
          foreground: '#472a00',
        },
        success: {
          DEFAULT: '#57f1db',
          foreground: '#003731',
        },
      },
      borderRadius: {
        'DEFAULT': '0.125rem',
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
        '4xl': '1.5rem',
        full: '9999px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'recording-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(87, 241, 219, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 0 20px rgba(87, 241, 219, 0)',
          },
        },
        'glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px -5px rgba(87, 241, 219, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 30px -5px rgba(87, 241, 219, 0.8)',
          },
        },
        'slide-in-bottom': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'recording-pulse': 'recording-pulse 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-in-bottom': 'slide-in-bottom 0.7s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
