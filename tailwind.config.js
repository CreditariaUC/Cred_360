import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f6f7',
          100: '#ebedef',
          200: '#d8dce0',
          300: '#b9bfc7',
          400: '#939daa',
          500: '#364150',
          600: '#313b48',
          700: '#29323d',
          800: '#232a33',
          900: '#1e242b',
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};