/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#F2FAF6',
          100: '#E5F3EC',
          200: '#C0E2CF',
          300: '#91CBB0',
          400: '#5DB18C',
          500: '#229A62',
          600: '#1C7D54',
          700: '#146140',
          800: '#0E472E',
          900: '#082C1C',
          950: '#04170E',
        }
      }
    },
  },
  plugins: [],
}
