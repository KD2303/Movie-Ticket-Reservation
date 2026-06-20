/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0D',
        surface: '#1A1A1A',
        card: '#222222',
        purple: {
          DEFAULT: '#7B61FF',
          light: '#9B85FF',
          dark: '#5B41DF',
        },
        occupied: '#9E9E9E',
        available: 'transparent',
        selected: '#7B61FF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
