import React from 'react';
import { Link } from 'react-router-dom';

export const TopNav: React.FC = () => {
    return (
        <header className="navbar relative z-10">
            <Link to="/" className="brand">
                <span className="logo-bubble">OTA</span>
                <span>On Tour App</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                <a className="transition hover:opacity-100" style={{ opacity: .85 }} href="#features">Features</a>
                <a className="transition hover:opacity-100" style={{ opacity: .85 }} href="#product">Product</a>
            </nav>
            <div className="flex items-center gap-3">
                <Link to="/login" className="btn-ghost">Log in</Link>
                <Link to="/signup" className="btn-primary">Get started</Link>
            </div>
        </header>
    );
};
