/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          900: '#064e3b',
        },
        safeguard: {
          safe: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        },
        surface: {
          50: '#ffffff',
          100: '#f8fafc',
          200: '#f1f5f9',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'premium-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'premium': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      /* 120Hz-tuned spring cubic-beziers */
      transitionTimingFunction: {
        'spring':       'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'out-expo':     'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth':       'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      /* Duration tokens — multiples of 8.33ms for 120Hz alignment */
      transitionDuration: {
        '80':  '80ms',
        '160': '160ms',
        '280': '280ms',
        '420': '420ms',
        '700': '700ms',
      },
      animation: {
        'fade-up':    'fadeUpIn 280ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'spring-in':  'springIn 420ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        'slide-left': 'slideInLeft 280ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 5s cubic-bezier(0.76, 0, 0.24, 1) infinite',
        'radar-ping': 'radarPing 1.4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'spin-slow':  'spinSlow 4s linear infinite',
        'ticker':     'tickerScroll 40s linear infinite',
      },
      keyframes: {
        fadeUpIn: {
          'from': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          'to':   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        springIn: {
          '0%':   { opacity: '0', transform: 'translateY(20px) scale(0.96)' },
          '60%':  { opacity: '1', transform: 'translateY(-3px) scale(1.01)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideInLeft: {
          'from': { opacity: '0', transform: 'translateX(-16px)' },
          'to':   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        radarPing: {
          '0%':   { transform: 'scale(1)',   opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        spinSlow: {
          'to': { transform: 'rotate(360deg)' },
        },
        tickerScroll: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        staggerIn: {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}