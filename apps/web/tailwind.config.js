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
      borderRadius: {
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        beige1: 'var(--beige-1)',
        beige2: 'var(--beige-2)',
        beige3: 'var(--beige-3)',
        yellow: 'var(--yellow)',
        brown1: 'var(--brown-1)',
        border: 'var(--border)',
        borderDark: 'var(--border-dark)',
        ti: {
          // Warm brown + beige theme
          brown: {
            50: '#f6efe5',
            100: '#e8dcc8',
            200: '#d3c0a1',
            300: '#bfa47c',
            400: '#a9885a',
            500: '#8b6947',
            600: '#6f5133',
            700: '#513a22',
            800: '#382617',
            900: '#24170e',
          },
          beige: {
            50: '#fdf6ec',
            100: '#f7efdf',
            200: '#efe1cb',
            300: '#e4d2b6',
            400: '#d7c2a0',
            500: '#c9b08d',
          },
          green: {
            50: '#fdf4e6',
            100: '#f7ecd9',
            200: '#eddcc3',
            300: '#e2cdac',
            400: '#d6bd96',
            500: '#c9a375',
            600: '#b28757',
            700: '#8f6941',
          },
          teal: {
            500: '#c79c70',
            600: '#a87b4e',
          },
          peach: {
            100: '#f4d9bf',
            200: '#eec29b',
          },
          ink: {
            DEFAULT: '#2f2015',
            800: '#24160d',
            900: '#1b0f08',
          },
        },
        // Legacy compatibility
        'ti-primary': {
          100: '#f7ecd9',
          500: '#c9a375',
          600: '#b28757',
          700: '#8f6941',
        },
        'ti-mint': '#caa177',
        'ti-sky': '#e6d4bf',
        'ti-peach': '#f4d9bf',
      },
      backgroundImage: {
        'ti-hero':
          'radial-gradient(1200px 600px at 10% -10%, rgba(201,163,117,0.3), transparent 60%), radial-gradient(900px 500px at 90% -15%, rgba(244,217,191,0.35), transparent 60%)',
        'hero-soft':
          'radial-gradient(circle at 20% 20%, rgba(201,163,117,0.15), transparent 50%), radial-gradient(circle at 80% 0%, rgba(244,217,191,0.25), transparent 50%)',
        'gradient-warm':
          'linear-gradient(135deg, rgba(201,163,117,0.25) 0%, rgba(230,212,187,0.4) 100%)',
        'gradient-green-teal':
          'linear-gradient(135deg, #c9a375 0%, #a87b4e 100%)',
        'gradient-peach':
          'linear-gradient(135deg, rgba(244,217,191,0.4) 0%, rgba(253,246,236,0.6) 100%)',
        'chat-pattern':
          'radial-gradient(circle at 10% 20%, rgba(201,163,117,0.12), transparent 40%), radial-gradient(circle at 90% 80%, rgba(244,217,191,0.12), transparent 40%)',
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 32px rgba(0,0,0,0.12)',
        soft: 'var(--shadow-soft)',
        glow: '0 0 20px rgba(201,163,117,0.35)',
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
          '0%': { boxShadow: '0 0 20px rgba(201,163,117,0.35)' },
          '100%': { boxShadow: '0 0 30px rgba(168,123,78,0.55)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionTimingFunction: {
        pleasant: 'cubic-bezier(.22,.61,.36,1)',
      },
    },
  },
  plugins: [],
};
