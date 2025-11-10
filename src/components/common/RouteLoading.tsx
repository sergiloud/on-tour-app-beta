import React from 'react';
import { Loader2 } from 'lucide-react';

interface RouteLoadingProps {
    message?: string;
}

export const RouteLoading: React.FC<RouteLoadingProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
                <p className="text-sm text-[var(--text-secondary)]">{message}</p>
            </div>
        </div>
    );
};

export const InlineRouteLoading: React.FC<RouteLoadingProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="p-8 flex items-center justify-center">
            <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
                <p className="text-sm text-[var(--text-secondary)]">{message}</p>
            </div>
        </div>
    );
};
