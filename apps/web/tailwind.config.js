/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '100%',
        md: '100%',
        lg: '1280px',
        xl: '1536px',
        '2xl': '100%',
      },
    },
    extend: {
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.4' }],
        'sm': ['1rem', { lineHeight: '1.5' }],
        'base': ['1.125rem', { lineHeight: '1.6' }],
        'lg': ['1.25rem', { lineHeight: '1.6' }],
        'xl': ['1.375rem', { lineHeight: '1.6' }],
        '2xl': ['1.625rem', { lineHeight: '1.5' }],
        '3xl': ['2rem', { lineHeight: '1.4' }],
        '4xl': ['2.5rem', { lineHeight: '1.3' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      colors: {
        ti: {
          // Bright green + beige theme
          green: {
            50: '#E8F9EE',
            100: '#CFFAE0',
            200: '#A8F5C2',
            300: '#7EECA4',
            400: '#4ADA7E',
            500: '#22C55E', // main brand green
            600: '#16A34A',
            700: '#15803D',
          },
          beige: {
            50: '#FFF9F0',
            100: '#F7F0E1', // primary surface
            200: '#EFE3C9',
            300: '#E6D7B1',
          },
          ink: {
            800: '#1D2939',
            900: '#0F172A',
          },
        },
        // Legacy compatibility
        'ti-primary': {
          100: '#E8F9EE',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        'ti-mint': '#10b981',
        'ti-sky': '#38bdf8',
        'ti-peach': '#fdba74',
        'ti-bg': 'var(--ti-bg)',
        'ti-surface': 'var(--ti-surface)',
        'ti-surface-hover': 'var(--ti-surface-hover)',
        'ti-border': 'var(--ti-border)',
        'ti-text-primary': 'var(--ti-text-primary)',
        'ti-text-secondary': 'var(--ti-text-secondary)',
        'ti-text-tertiary': 'var(--ti-text-tertiary)',
      },
      backgroundImage: {
        'ti-hero':
          'radial-gradient(1200px 600px at 10% -10%, rgba(34,197,94,0.25), transparent 60%), radial-gradient(900px 500px at 90% -15%, rgba(250, 204, 21, 0.2), transparent 60%)',
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.08)',
        soft: '0 2px 8px rgba(0,0,0,0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        friendly: ['Nunito', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
