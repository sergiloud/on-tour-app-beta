import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

type Props = {
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onReset?: () => void;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: any[];
  level?: 'app' | 'page' | 'component';
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
};

/**
 * Enhanced Error Boundary with multiple severity levels
 *
 * Levels:
 * - 'app': Full-page error UI (for critical failures)
 * - 'page': Page-level error UI (for page component failures)
 * - 'component': Inline error UI (for non-critical component failures)
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);

    // Update state with error details
    this.setState((prevState) => ({
      errorInfo: info,
      errorCount: prevState.errorCount + 1
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys;

      if (prevKeys.length !== currentKeys.length ||
        prevKeys.some((key, index) => key !== currentKeys[index])) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const { fallback, level = 'component' } = this.props;

      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') return (fallback as any)(this.state.error);
        return fallback;
      }

      // Use default fallback based on level
      return this.renderDefaultFallback(level);
    }
    return this.props.children as any;
  }

  private renderDefaultFallback(level: 'app' | 'page' | 'component') {
    const { error, errorInfo, errorCount } = this.state;

    // App-level error (full-page)
    if (level === 'app') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Oops! Algo salió mal
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  La aplicación encontró un error inesperado
                </p>
              </div>
            </div>

            {import.meta.env.DEV && error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="font-mono text-xs text-red-800 dark:text-red-300 break-all">
                  {error.toString()}
                </p>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-700 dark:text-red-400 cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar aplicación
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </button>
            </div>

            {errorCount > 1 && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Este error ha ocurrido {errorCount} veces
              </p>
            )}
          </div>
        </div>
      );
    }

    // Page-level error
    if (level === 'page') {
      return (
        <div className="min-h-96 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Error en esta página
              </h2>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No pudimos cargar el contenido de esta página. Intenta recargarlo.
            </p>

            {import.meta.env.DEV && error && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                <p className="font-mono text-xs text-yellow-800 dark:text-yellow-300 break-all">
                  {error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={this.reset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Component-level error (minimal inline)
    return (
      <div role="alert" className="p-3 rounded-md bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 text-xs">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-yellow-900 dark:text-yellow-200">
              No se pudo cargar este componente
            </p>
            {import.meta.env.DEV && error && (
              <p className="text-[11px] text-yellow-700 dark:text-yellow-300 mt-1 font-mono break-all">
                {error.message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-2">
          <button
            className="px-2 py-1 text-[11px] rounded bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200 font-medium transition-colors"
            onClick={this.reset}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
}

/**
 * HOC to wrap components with ErrorBoundary
 *
 * @example
 * export default withErrorBoundary(MyComponent, { level: 'page' });
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;
