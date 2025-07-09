/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#FBF8E9',
          100: '#F7F1D4',
          200: '#F0E4AA',
          300: '#E8D77F',
          400: '#DFCA55',
          500: '#D4AF37', // Primary gold
          600: '#B99020',
          700: '#9E7319',
          800: '#825712',
          900: '#663A0B',
        },
        neutral: {
          850: '#1F1F1F',
          950: '#0A0A0A',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      height: {
        'screen-90': '90vh',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      backgroundImage: {
        'hero-pattern': "url('https://images.pexels.com/photos/6347547/pexels-photo-6347547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
        'about-pattern': "url('https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(212, 175, 55, 0.15)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
};