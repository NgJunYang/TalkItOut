/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'ti-primary': {
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
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
