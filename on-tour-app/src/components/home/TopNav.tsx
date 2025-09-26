import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export const TopNav: React.FC = () => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <header className="navbar relative z-10">
      <a href="#" className="brand">
        <span className="logo-bubble">OTA</span>
        <span>On Tour App</span>
      </a>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{color:'var(--text-secondary)'}}>
        <a className="transition hover:opacity-100" style={{opacity:.85}} href="#features">Features</a>
        <a className="transition hover:opacity-100" style={{opacity:.85}} href="#product">Product</a>
        <a className="transition hover:opacity-100" style={{opacity:.85}} href="#pricing">Pricing</a>
      </nav>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-pressed={isDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-md px-2 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/70 transition flex items-center gap-1"
          style={{color:'var(--text-secondary)'}}
        >
          <span className="inline-block w-4 h-4 relative">
            {isDark ? (
              <span className="block w-full h-full">🌙</span>
            ) : (
              <span className="block w-full h-full">☀️</span>
            )}
          </span>
          <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
        </button>
        <button className="btn-ghost">Log in</button>
        <button className="btn-primary">Get started</button>
      </div>
    </header>
  );
};
