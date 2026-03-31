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
        // Surface layers — CSS variables for scheme switching
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-container-lowest': 'rgb(var(--surface-container-lowest) / <alpha-value>)',
        'surface-container-low': 'rgb(var(--surface-container-low) / <alpha-value>)',
        'surface-container': 'rgb(var(--surface-container) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--surface-container-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--surface-container-highest) / <alpha-value>)',
        'surface-dim': 'rgb(var(--surface-dim) / <alpha-value>)',
        'surface-bright': 'rgb(var(--surface-bright) / <alpha-value>)',
        'surface-variant': 'rgb(var(--surface-variant) / <alpha-value>)',
        'surface-tint': 'rgb(var(--surface-tint) / <alpha-value>)',

        // On-surface text
        'on-surface': 'rgb(var(--on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--on-surface-variant) / <alpha-value>)',

        // Primary
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-fg) / <alpha-value>)',
          container: 'rgb(var(--color-primary-container) / <alpha-value>)',
          fixed: 'rgb(var(--color-primary-fixed) / <alpha-value>)',
          'fixed-dim': 'rgb(var(--color-primary-fixed-dim) / <alpha-value>)',
        },

        // Secondary
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--color-secondary-fg) / <alpha-value>)',
          container: 'rgb(var(--color-secondary-container) / <alpha-value>)',
          fixed: 'rgb(var(--color-secondary-fixed) / <alpha-value>)',
          'fixed-dim': 'rgb(var(--color-secondary-fixed-dim) / <alpha-value>)',
        },

        // Tertiary
        tertiary: {
          DEFAULT: 'rgb(var(--color-tertiary) / <alpha-value>)',
          foreground: 'rgb(var(--color-tertiary-fg) / <alpha-value>)',
          container: 'rgb(var(--color-tertiary-container) / <alpha-value>)',
          fixed: 'rgb(var(--color-tertiary-fixed) / <alpha-value>)',
          'fixed-dim': 'rgb(var(--color-tertiary-fixed-dim) / <alpha-value>)',
        },

        // Error
        error: {
          DEFAULT: 'rgb(var(--color-error) / <alpha-value>)',
          foreground: 'rgb(var(--color-error-fg) / <alpha-value>)',
        },

        // Outlines
        outline: 'rgb(var(--outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--outline-variant) / <alpha-value>)',

        // Inverse
        'inverse-surface': 'rgb(var(--inverse-surface) / <alpha-value>)',
        'inverse-on-surface': 'rgb(var(--inverse-on-surface) / <alpha-value>)',
        'inverse-primary': 'rgb(var(--inverse-primary) / <alpha-value>)',

        // Semantic aliases for shadcn compatibility
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'rgb(var(--surface) / <alpha-value>)',
        foreground: 'rgb(var(--on-surface) / <alpha-value>)',

        muted: {
          DEFAULT: 'rgb(var(--surface-container) / <alpha-value>)',
          foreground: 'rgb(var(--on-surface-variant) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--surface-container-high) / <alpha-value>)',
          foreground: 'rgb(var(--on-surface) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--surface-container-low) / <alpha-value>)',
          foreground: 'rgb(var(--on-surface) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--surface-container-low) / <alpha-value>)',
          foreground: 'rgb(var(--on-surface) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--color-error) / <alpha-value>)',
          foreground: 'rgb(var(--color-error-fg) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-tertiary) / <alpha-value>)',
          foreground: 'rgb(var(--color-tertiary-fg) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-fg) / <alpha-value>)',
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
            boxShadow: '0 0 0 0 var(--shadow-primary-glow)',
          },
          '50%': {
            boxShadow: '0 0 0 20px transparent',
          },
        },
        'glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px -5px var(--shadow-primary-glow)',
          },
          '50%': {
            boxShadow: '0 0 30px -5px var(--shadow-primary)',
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
