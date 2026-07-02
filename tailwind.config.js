import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(217,70,239,0.12) 100%)',
        'mesh-light':
          'radial-gradient(at 0% 0%, rgba(99,102,241,0.10) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(217,70,239,0.10) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(129,140,248,0.08) 0px, transparent 50%)',
        'mesh-dark':
          'radial-gradient(at 0% 0%, rgba(99,102,241,0.18) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(217,70,239,0.14) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(129,140,248,0.12) 0px, transparent 50%)',
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(15, 23, 42, 0.06), 0 8px 24px -8px rgba(15, 23, 42, 0.08)',
        'soft-dark': '0 2px 10px -2px rgba(0, 0, 0, 0.3), 0 8px 24px -8px rgba(0, 0, 0, 0.4)',
        glow: '0 0 0 1px rgba(99,102,241,0.15), 0 8px 24px -6px rgba(99,102,241,0.35)',
        'glow-lg': '0 0 0 1px rgba(99,102,241,0.2), 0 16px 40px -8px rgba(99,102,241,0.45)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        'pulse-ring': { '0%': { transform: 'scale(0.8)', opacity: 1 }, '100%': { transform: 'scale(1.8)', opacity: 0 } },
        'gradient-x': { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 3s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.2, 0.6, 0.4, 1) infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
      },
      backgroundSize: {
        200: '200% 200%',
      },
    },
  },
  plugins: [typography],
}
