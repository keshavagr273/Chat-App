/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f131d',
        surface: '#0f131d',
        'surface-dim': '#0f131d',
        'surface-bright': '#353944',
        'surface-container-lowest': '#0a0e18',
        'surface-container-low': '#171b26',
        'surface-container': '#1b1f2a',
        'surface-container-high': '#262a35',
        'surface-container-highest': '#313540',
        'surface-glass': 'rgba(15, 19, 29, 0.65)',
        'surface-glass-card': 'rgba(30, 41, 59, 0.5)',
        'border-glass': 'rgba(255, 255, 255, 0.1)',
        'border-glass-light': 'rgba(255, 255, 255, 0.06)',
        'emerald-glow': 'rgba(16, 185, 129, 0.15)',
        'emerald-glow-strong': 'rgba(16, 185, 129, 0.35)',
        primary: '#10b981',
        'primary-light': '#4edea3',
        'primary-container': '#10b981',
        'on-primary': '#003824',
        secondary: '#00bd85',
        'secondary-light': '#45dfa4',
        'secondary-container': '#00bd85',
        'on-surface': '#dfe2f1',
        'on-surface-variant': '#bbcabf',
        'text-muted': '#94a3b8',
        'on-background': '#dfe2f1',
        outline: '#86948a',
        'outline-variant': '#3c4a42',
        border: 'rgba(255, 255, 255, 0.1)',
        dark: {
          100: '#171b26',
          200: '#1b1f2a',
          300: '#0f131d',
          400: '#0a0e18'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Geist', 'sans-serif'],
        headline: ['Geist', 'sans-serif'],
        label: ['Geist', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'bento': '1rem',
      },
      boxShadow: {
        'emerald-glow': '0 0 20px rgba(16, 185, 129, 0.25)',
        'emerald-glow-lg': '0 0 35px rgba(16, 185, 129, 0.35)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
