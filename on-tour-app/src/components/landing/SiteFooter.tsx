import React from 'react';

export const SiteFooter: React.FC = () => {
    return (
        <footer className="relative z-10 px-6 pb-10 mt-auto">
            <div className="max-w-7xl mx-auto text-sm flex flex-col md:flex-row gap-4 md:items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>© {new Date().getFullYear()} On Tour App</p>
                <div className="flex gap-6">
                    <a href="#" className="transition hover:opacity-100" style={{ color: 'var(--text-secondary)', opacity: 0.85 }}>Privacy</a>
                    <a href="#" className="transition hover:opacity-100" style={{ color: 'var(--text-secondary)', opacity: 0.85 }}>Terms</a>
                    <a href="#" className="transition hover:opacity-100" style={{ color: 'var(--text-secondary)', opacity: 0.85 }}>Status</a>
                </div>
            </div>
        </footer>
    );
};
