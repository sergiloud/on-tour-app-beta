// Tailwind 3 config (ESM)
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      spacing: {
        // Base 4px spacing system for consistent rhythm
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
        '32': '8rem',     // 128px
      },
      colors: {
        ink: { 900: '#0b0f14', 800: '#12181f', 700: '#1b242d' },
        accent: { 500: '#bfff00', 400: '#d4ff44' }
      },
      backgroundImage: {
        'stripes-travel': 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(59, 130, 246, 0.1) 2px, rgba(59, 130, 246, 0.1) 4px)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'success-flash': 'successFlash 0.8s ease-out forwards',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        successFlash: {
          '0%': { backgroundColor: 'rgba(34, 197, 94, 0.1)', boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.4)' },
          '50%': { backgroundColor: 'rgba(34, 197, 94, 0.2)', boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.2)' },
          '100%': { backgroundColor: 'transparent', boxShadow: 'none' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    }
  },
  plugins: [forms]
};
