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
          // Warm brown + beige theme
          brown: {
            50: '#F5F3F0',
            100: '#E8E3DC',
            200: '#D4C8B8',
            300: '#BAAA94',
            400: '#9F8B6F',
            500: '#3D2817', // main brand brown (dark chocolate)
            600: '#2F1F0F',
            700: '#1F140A',
            800: '#160D06',
            900: '#0D0603',
          },
          beige: {
            50: '#FBF9F6',
            100: '#F5F1EA', // primary surface - warm cream
            200: '#EDE7DC',
            300: '#E6DDCE',
            400: '#DFD3C0',
            500: '#C9B89A',
          },
          green: {
            50: '#E8F9EE',
            100: '#CFFAE0',
            200: '#A8F5C2',
            300: '#7EECA4',
            400: '#4ADA7E',
            500: '#22C55E', // accent green (keep for CTAs)
            600: '#16A34A',
            700: '#15803D',
          },
          teal: {
            500: '#10B981',
            600: '#059669',
          },
          peach: {
            100: '#FCD9B8',
            200: '#FDBA74',
          },
          ink: {
            DEFAULT: '#3D2817', // brown instead of blue-gray
            800: '#2F1F0F',
            900: '#1F140A',
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
        'hero-soft':
          'radial-gradient(circle at 20% 20%, rgba(34,197,94,0.1), transparent 50%), radial-gradient(circle at 80% 0%, rgba(250,204,21,0.15), transparent 50%)',
        'gradient-warm':
          'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(252,217,184,0.15) 100%)',
        'gradient-green-teal':
          'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
        'gradient-peach':
          'linear-gradient(135deg, rgba(252,217,184,0.3) 0%, rgba(255,249,240,0.3) 100%)',
        'chat-pattern':
          'radial-gradient(circle at 10% 20%, rgba(34,197,94,0.05), transparent 40%), radial-gradient(circle at 90% 80%, rgba(250,204,21,0.05), transparent 40%)',
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 32px rgba(0,0,0,0.12)',
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        glow: '0 0 20px rgba(34,197,94,0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Nunito Sans"', 'Inter', 'system-ui', 'sans-serif'],
        friendly: ['Nunito', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
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
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(34,197,94,0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(34,197,94,0.5)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
