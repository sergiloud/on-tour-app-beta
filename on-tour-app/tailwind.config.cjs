// Tailwind 3 config
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#0b0f14', 800: '#12181f', 700: '#1b242d' },
        accent: { 500: '#bfff00', 400: '#d4ff44' }
      },
      boxShadow: {
        glass: '0 4px 24px -4px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
