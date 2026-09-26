/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        primary: '#0FAC64',
        secondary: '#1C272D',
        accent: '#111827',
        background: '#F5F7FA',
        'hover-primary': '#0DB26D',
        'hover-secondary': '#081C35'
      },
      keyframes: {
        'slide-down': {
          '0%': { transform: 'translateY(-10%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite linear'
      }
    }
  },
  plugins: [require('tailwindcss-motion')]
};
