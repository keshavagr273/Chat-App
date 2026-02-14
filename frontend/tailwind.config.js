/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        dark: {
          100: '#1e293b',
          200: '#0f172a',
          300: '#020617'
        }
      }
    },
  },
  plugins: [],
}
