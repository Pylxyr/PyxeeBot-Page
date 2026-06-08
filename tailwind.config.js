/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          violet: '#8A2BE2',
          cyan: '#00E5FF',
          fuchsia: '#FF2D95'
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(90deg, rgba(138,43,226,0.18), rgba(0,229,255,0.12))'
      }
    }
  },
  plugins: []
}
