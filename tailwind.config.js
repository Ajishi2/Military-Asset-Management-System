/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: 'var(--color-navy-50)',
          100: 'var(--color-navy-100)',
          200: 'var(--color-navy-200)',
          300: 'var(--color-navy-300)',
          400: 'var(--color-navy-400)',
          500: 'var(--color-navy-500)',
          600: 'var(--color-navy-600)',
          700: 'var(--color-navy-700)',
          800: 'var(--color-navy-800)',
          900: 'var(--color-navy-900)',
        },
        olive: {
          50: 'var(--color-olive-50)',
          100: 'var(--color-olive-100)',
          200: 'var(--color-olive-200)',
          300: 'var(--color-olive-300)',
          400: 'var(--color-olive-400)',
          500: 'var(--color-olive-500)',
          600: 'var(--color-olive-600)',
          700: 'var(--color-olive-700)',
          800: 'var(--color-olive-800)',
          900: 'var(--color-olive-900)',
        },
      },
      boxShadow: {
        'card': '0 2px 5px 0 rgba(0,0,0,0.05)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};