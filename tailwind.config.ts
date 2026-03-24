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
        sans: [
          'var(--font-noto-sans-jp)',
          'var(--font-outfit)',
          'system-ui',
          'sans-serif',
        ],
        display: ['var(--font-outfit)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // 使用精确的十六进制值，确保与预览页面完全匹配
        primary: {
          DEFAULT: '#7766EB',
          light: '#a5b4fc',
          dark: '#4f46e5',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
          dark: '#1d4ed8',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#ef4444',
          light: '#fca5a5',
          dark: '#b91c1c',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fcd34d',
          dark: '#b45309',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#22c55e',
          light: '#86efac',
          dark: '#15803d',
          foreground: '#ffffff',
        },
        /* 专业紫蓝（完整变体） */
        'primary-blue': {
          DEFAULT: '#7766EB',
          light: '#a5b4fc',
          dark: '#4f46e5',
        },
        /* 樱花粉（点缀色） */
        sakura: {
          DEFAULT: '#ec4899',
          light: '#fce7f3',
          dark: '#be185d',
        },
        /* 日本蓝 */
        'japan-blue': {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
          dark: '#1d4ed8',
        },
        /* 竹绿 */
        bamboo: {
          DEFAULT: '#22c55e',
          light: '#86efac',
          dark: '#15803d',
        },
        /* 琥珀色 */
        amber: {
          DEFAULT: '#f59e0b',
          light: '#fcd34d',
          dark: '#b45309',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        '4xl': 'var(--spacing-4xl)',
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
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px -5px hsl(var(--primary-blue) / 0.5)',
          },
          '50%': {
            boxShadow: '0 0 30px -5px hsl(var(--primary-blue) / 0.8)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(var(--primary-blue-light)), hsl(var(--primary-blue)))',
        'gradient-secondary': 'linear-gradient(135deg, hsl(var(--japan-blue-light)), hsl(var(--japan-blue)))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsl(var(--primary-blue-light) / 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsl(var(--japan-blue-light) / 0.3) 0px, transparent 50%)',
        /* 保留樱花渐变用于特殊场景 */
        'gradient-sakura': 'linear-gradient(135deg, hsl(var(--sakura-light)), hsl(var(--sakura)))',
      },
    },
  },
  plugins: [],
};

export default config;
