// Tailwind 3 config (ESM)
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // iOS System Fonts
        'sf-pro': [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        'sf-display': [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        'sf-text': [
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        // Default sans fallback
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // iOS Dynamic Type Scale
        'ios-large-title': ['34px', { lineHeight: '41px', letterSpacing: '0.011em', fontWeight: '400' }],
        'ios-title1': ['28px', { lineHeight: '34px', letterSpacing: '0.013em', fontWeight: '400' }],
        'ios-title2': ['22px', { lineHeight: '28px', letterSpacing: '0.016em', fontWeight: '400' }],
        'ios-title3': ['20px', { lineHeight: '25px', letterSpacing: '0.019em', fontWeight: '400' }],
        'ios-headline': ['17px', { lineHeight: '22px', letterSpacing: '-0.022em', fontWeight: '600' }],
        'ios-body': ['17px', { lineHeight: '22px', letterSpacing: '-0.022em', fontWeight: '400' }],
        'ios-callout': ['16px', { lineHeight: '21px', letterSpacing: '-0.020em', fontWeight: '400' }],
        'ios-subheadline': ['15px', { lineHeight: '20px', letterSpacing: '-0.016em', fontWeight: '400' }],
        'ios-footnote': ['13px', { lineHeight: '18px', letterSpacing: '-0.006em', fontWeight: '400' }],
        'ios-caption1': ['12px', { lineHeight: '16px', letterSpacing: '0em', fontWeight: '400' }],
        'ios-caption2': ['11px', { lineHeight: '13px', letterSpacing: '0.006em', fontWeight: '400' }],
      },
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
        accent: { 500: '#bfff00', 400: '#d4ff44' },
        // Theme-aware colors using CSS variables
        'surface': {
          card: 'var(--surface-card)',
          'card-hover': 'var(--surface-card-hover)',
          elevated: 'var(--surface-elevated)',
        },
        'primary-text': 'var(--text-primary)',
        'secondary-text': 'var(--text-secondary)',
        'muted-text': 'var(--text-muted)',
        'heading-text': 'var(--text-heading)',
        'on-accent': 'var(--text-on-accent)',
        'border-main': 'var(--border-color)',
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'interactive': {
          base: 'var(--interactive-base)',
          hover: 'var(--interactive-hover)',
          active: 'var(--interactive-active)',
        },
        // Paleta Slate para Light theme (Tailwind native)
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      backgroundImage: {
        'stripes-travel': 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(59, 130, 246, 0.1) 2px, rgba(59, 130, 246, 0.1) 4px)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'success-flash': 'successFlash 0.8s ease-out forwards',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.2s ease-out',
        'slideUp': 'slideUp 0.2s ease-out',
        'slideDown': 'slideDown 0.2s ease-out',
        'scaleIn': 'scaleIn 0.15s ease-out',
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
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    }
  },
  plugins: [
    forms({
      strategy: 'class', // Only apply form styles when using 'form-input' class
    }),
    // Hide scrollbar while keeping functionality
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ]
};
