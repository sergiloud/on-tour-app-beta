/**
 * Estados de error específicos para el módulo de Finanzas
 *
 * Componentes visuales para mostrar diferentes tipos de errores:
 * - WorkerError: Cuando el Web Worker falla
 * - DataError: Cuando hay problemas con los datos
 * - ChartError: Cuando un gráfico no puede renderizarse
 *
 * Diseñados para mantener la UX fluida incluso ante errores.
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Database, BarChart3 } from 'lucide-react';

interface ErrorStateProps {
  /** Mensaje de error opcional */
  message?: string;
  /** Callback para reintentar */
  onRetry?: () => void;
  /** Mostrar detalles técnicos en desarrollo */
  errorDetails?: string;
}

/**
 * Error cuando el Web Worker falla al procesar datos
 */
export function WorkerErrorState({ message, onRetry, errorDetails }: ErrorStateProps) {
  return (
    <div
      className="glass rounded-xl border border-amber-500/30 p-6 animate-slide-up"
      style={{ animationDelay: '100ms' }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Procesamiento en segundo plano interrumpido
          </h4>
          <p className="text-xs text-slate-400 dark:text-white/60 mb-3">
            {message || 'Los cálculos pesados no pudieron completarse. Mostrando datos básicos.'}
          </p>

          {import.meta.env.DEV && errorDetails && (
            <details className="mb-3">
              <summary className="text-xs text-amber-400/60 cursor-pointer hover:text-amber-400 transition-colors">
                Detalles técnicos
              </summary>
              <pre className="mt-2 p-3 bg-black/30 rounded-lg text-xs text-amber-300 overflow-x-auto border border-amber-500/10">
                {errorDetails}
              </pre>
            </details>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 font-medium flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              Reintentar cálculos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Error cuando hay problemas con los datos fuente
 */
export function DataErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="glass rounded-xl border border-red-500/30 p-8 text-center animate-scale-in"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
        <Database className="w-8 h-8 text-red-400" />
      </div>

      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
        Error al cargar datos financieros
      </h4>
      <p className="text-sm text-slate-400 dark:text-white/60 max-w-md mx-auto mb-4">
        {message || 'No se pudieron obtener los datos. Por favor, verifica tu conexión e inténtalo de nuevo.'}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 hover:border-red-500/50 text-white font-medium inline-flex items-center gap-2 transition-all hover-scale active-scale"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  );
}

/**
 * Error específico para cuando un gráfico no puede renderizarse
 * Diseñado para ser compacto y no romper el layout del dashboard
 */
export function ChartErrorState({ message }: ErrorStateProps) {
  return (
    <div
      className="w-full h-full min-h-[200px] flex items-center justify-center bg-white/[0.02] rounded-lg border border-white/5 animate-fade-in"
    >
      <div className="text-center p-6">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
          <BarChart3 className="w-6 h-6 text-slate-200 dark:text-white/30" />
        </div>
        <p className="text-xs text-slate-400 dark:text-white/40 max-w-[200px]">
          {message || 'Gráfico no disponible'}
        </p>
      </div>
    </div>
  );
}

/**
 * Estado de "Sin datos" (no es un error técnico, sino ausencia de datos)
 */
export function EmptyDataState({ message }: { message?: string }) {
  return (
    <div
      className="glass rounded-xl border border-slate-200 dark:border-white/10 p-12 text-center animate-fade-in"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
        <Database className="w-8 h-8 text-slate-200 dark:text-white/30" />
      </div>

      <h4 className="text-base font-semibold text-slate-600 dark:text-white/80 mb-2">
        No hay datos para mostrar
      </h4>
      <p className="text-sm text-slate-300 dark:text-white/50 max-w-md mx-auto">
        {message || 'Selecciona un período diferente o añade transacciones para ver análisis.'}
      </p>
    </div>
  );
}
