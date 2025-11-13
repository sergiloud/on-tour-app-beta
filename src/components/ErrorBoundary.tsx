/**
 * ErrorBoundary - Componente de resiliencia para captura de errores
 *
 * ESTRATEGIA DE MANEJO DE ERRORES:
 * - Captura errores de renderizado en componentes hijos
 * - Muestra UI de fallback amigable en lugar de pantalla blanca
 * - Previene que errores locales rompan toda la aplicación
 * - Logging automático para debugging
 *
 * USO:
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <ComponenteQuePodriaFallar />
 * </ErrorBoundary>
 * ```
 *
 * ANTIFRÁGIL:
 * Un error en un gráfico no debe romper todo el dashboard.
 * Cada sección crítica debe estar envuelta en su propio boundary.
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '../lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** UI personalizada para mostrar cuando hay error */
  fallback?: ReactNode;
  /** Callback cuando se captura un error (para logging) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Identificador de la sección (para logging) */
  section?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary genérico con capacidad de recuperación
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Actualizar estado para mostrar UI de fallback
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Logging del error con servicio centralizado
    const section = this.props.section || 'Unknown';
    
    logger.error(
      `ErrorBoundary caught error in ${section}`,
      error,
      {
        component: section,
        componentStack: errorInfo.componentStack,
        action: 'error_boundary_catch'
      }
    );

    // Callback personalizado para logging externo adicional
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Usar fallback personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          section={this.props.section}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * UI de fallback por defecto - Diseño profesional y amigable
 */
interface DefaultErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
  section?: string;
}

function DefaultErrorFallback({ error, onReset, section }: DefaultErrorFallbackProps) {
  return (
    <div className="glass rounded-xl border border-red-500/30 p-8 my-4">
      <div className="flex flex-col items-center text-center gap-4">
        {/* Icono de error */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        {/* Mensaje principal */}
        <div>
          <h3 className="text-lg font-bold text-white mb-2">
            Algo salió mal{section ? ` en ${section}` : ''}
          </h3>
          <p className="text-sm text-slate-400 dark:text-white/60 max-w-md">
            Ha ocurrido un error inesperado. No te preocupes, el resto de la aplicación sigue funcionando.
          </p>
        </div>

        {/* Detalles del error (solo en desarrollo) */}
        {import.meta.env.DEV && error && (
          <details className="w-full max-w-2xl mt-2">
            <summary className="text-xs text-slate-400 dark:text-white/40 cursor-pointer hover:text-slate-600 dark:hover:text-white/60 transition-colors">
              Detalles técnicos (solo visible en desarrollo)
            </summary>
            <pre className="mt-3 p-4 bg-black/20 rounded-lg text-left text-xs text-red-300 overflow-x-auto border border-red-500/10">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}

        {/* Botón de reintentar */}
        <button
          onClick={onReset}
          className="mt-2 px-6 py-3 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 hover:border-red-500/50 text-white font-medium flex items-center gap-2 transition-all hover:scale-105"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    </div>
  );
}

/**
 * Hook para usar ErrorBoundary de forma declarativa (opcional)
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
