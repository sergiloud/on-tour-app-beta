import React, { Suspense } from 'react';
import ErrorBoundary from '../common/ErrorBoundary';

interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'app' | 'page' | 'component';
}

/**
 * Robust wrapper for lazy-loaded components
 * Combines Suspense + ErrorBoundary with retry logic
 */
export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  fallback,
  errorFallback,
  onError,
  level = 'component'
}) => {
  const [retryCount, setRetryCount] = React.useState(0);

  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[LazyComponentWrapper] Error loading component:', error);
    onError?.(error, errorInfo);
  }, [onError]);

  const handleRetry = React.useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  return (
    <ErrorBoundary
      level={level}
      onError={handleError}
      onReset={handleRetry}
      resetKeys={[retryCount]}
      fallback={errorFallback}
    >
      <Suspense fallback={fallback || <DefaultLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

const DefaultLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-sm opacity-60 animate-pulse">Loading...</div>
  </div>
);

export default LazyComponentWrapper;
