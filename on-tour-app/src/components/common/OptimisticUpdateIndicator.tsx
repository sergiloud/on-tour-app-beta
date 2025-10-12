/**
 * OptimisticUpdateIndicator Component
 *
 * Visual indicator for pending optimistic updates
 * Shows a subtle loading state when updates are in flight
 */

import React from 'react';
import { useOptimisticIndicator } from '../../hooks/useOptimisticMutation';
import { Loader2 } from 'lucide-react';

interface OptimisticUpdateIndicatorProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    showCount?: boolean;
}

export const OptimisticUpdateIndicator: React.FC<OptimisticUpdateIndicatorProps> = ({
    position = 'top-right',
    showCount = false
}) => {
    const { hasPending, pendingCount } = useOptimisticIndicator();

    if (!hasPending) return null;

    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4'
    };

    return (
        <div
            className={`fixed ${positionClasses[position]} z-50
        bg-blue-500/90 backdrop-blur-sm text-white
        px-3 py-2 rounded-lg shadow-lg
        flex items-center gap-2
        animate-in fade-in slide-in-from-top-2 duration-300`}
            role="status"
            aria-live="polite"
        >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">
                {showCount ? `Syncing ${pendingCount}...` : 'Syncing...'}
            </span>
        </div>
    );
};

/**
 * Inline optimistic indicator for buttons
 */
interface OptimisticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isOptimistic?: boolean;
    children: React.ReactNode;
}

export const OptimisticButton: React.FC<OptimisticButtonProps> = ({
    isOptimistic,
    children,
    className = '',
    disabled,
    ...props
}) => {
    return (
        <button
            {...props}
            disabled={disabled || isOptimistic}
            className={`${className} relative ${isOptimistic ? 'opacity-70' : ''}`}
        >
            {isOptimistic && (
                <span className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                </span>
            )}
            <span className={isOptimistic ? 'invisible' : ''}>
                {children}
            </span>
        </button>
    );
};

/**
 * Optimistic row indicator for tables
 */
interface OptimisticRowProps {
    isOptimistic?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const OptimisticRow: React.FC<OptimisticRowProps> = ({
    isOptimistic,
    children,
    className = ''
}) => {
    return (
        <div
            className={`${className} ${isOptimistic
                    ? 'opacity-60 animate-pulse pointer-events-none'
                    : ''
                }`}
            data-optimistic={isOptimistic}
        >
            {children}
            {isOptimistic && (
                <div className="absolute top-2 right-2">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                </div>
            )}
        </div>
    );
};
