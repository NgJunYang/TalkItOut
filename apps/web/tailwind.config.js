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
        // New vibrant green-beige palette
        'brand-green': '#22C55E',
        'brand-teal': '#10B981',
        'brand-beige': '#FFF9F0',
        'accent-peach': '#FCD9B8',
        'accent-mint': '#D4F4DD',
        'accent-coral': '#FFB5A7',
        'ink': '#1E293B',

        // Legacy ti- colors for compatibility
        'ti-primary': {
          100: '#e0e7ff',
          500: '#22C55E',
          600: '#22C55E',
          700: '#16A34A',
        },
        'ti-mint': '#10b981',
        'ti-sky': '#38bdf8',
        'ti-peach': '#FCD9B8',
        'ti-bg': 'var(--ti-bg)',
        'ti-surface': 'var(--ti-surface)',
        'ti-surface-hover': 'var(--ti-surface-hover)',
        'ti-border': 'var(--ti-border)',
        'ti-text-primary': 'var(--ti-text-primary)',
        'ti-text-secondary': 'var(--ti-text-secondary)',
        'ti-text-tertiary': 'var(--ti-text-tertiary)',
      },
      backgroundImage: {
        'hero-soft':
          'radial-gradient(circle at 20% 20%, rgba(34,197,94,0.08), transparent 50%), radial-gradient(circle at 80% 80%, rgba(252,217,184,0.12), transparent 50%)',
        'gradient-green': 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
        'gradient-peach': 'linear-gradient(135deg, #FCD9B8 0%, #FFB5A7 100%)',
        'gradient-mint': 'linear-gradient(135deg, #D4F4DD 0%, #10B981 100%)',
        'card-glow': 'radial-gradient(circle at 50% 0%, rgba(34,197,94,0.1), transparent 70%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        friendly: ['Nunito', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
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
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-peach': '0 0 20px rgba(252, 217, 184, 0.4)',
      },
    },
  },
  plugins: [],
};
