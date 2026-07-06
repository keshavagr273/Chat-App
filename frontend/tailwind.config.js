/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00d37f',
        secondary: '#00e68a',
        dark: {
          100: '#1a1a1a',
          200: '#0c0c0c',
          300: '#000000'
        },
        border: '#222222'
      }
    },
  },
  plugins: [],
}
