/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F9FAFB',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        purple: {
          DEFAULT: '#5F33E1',
          light: '#EEF2FF',
          dark: '#4F46E5',
        },
        occupied: '#D1D5DB',
        available: 'transparent',
        selected: '#5F33E1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
