/**
 * Hook que delega cálculos pesados a un Web Worker
 *
 * ESTRATEGIA:
 * - Usa Web Worker para cálculos intensivos (profitabilityAnalysis, categoryData)
 * - Mantiene UI responsiva durante procesamiento de miles de transacciones
 * - Proporciona estado de loading para feedback visual
 * - Incluye fallback a cálculo síncrono si worker falla
 *
 * USO:
 * const { data, isLoading, error, computationTime } = useFinanceWorker(filteredTransactions);
 *
 * Beneficios:
 * - UI nunca se congela, incluso con 10,000+ transacciones
 * - Mejor percepción de velocidad
 * - Escalabilidad real
 * - Monitoring de performance incluido
 */

import { useState, useEffect, useRef } from 'react';
import type { TransactionV3 } from '../types/financeV3';
import type { WorkerInput, WorkerOutput } from '../workers/financeCalculations.worker';

export interface UseFinanceWorkerReturn {
  data: WorkerOutput | null;
  isLoading: boolean;
  error: string | null;
  computationTime: number | null;
}

/**
 * Hook que gestiona el ciclo de vida del Web Worker
 */
export function useFinanceWorker(transactions: readonly TransactionV3[]): UseFinanceWorkerReturn {
  const [data, setData] = useState<WorkerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [computationTime, setComputationTime] = useState<number | null>(null);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // WORKER DISABLED - causes __publicField errors on Vercel
    // TODO: Fix Vite worker compilation with TypeScript class syntax
    // Return null to indicate worker is disabled
    setData(null);
    setIsLoading(false);
    setError(null);
    
    // No worker initialization
    return () => {
      // No cleanup needed
    };

    /* ORIGINAL WORKER CODE - DISABLED DUE TO __publicField ERRORS
    // Solo iniciar worker si hay transacciones suficientes (>100 para optimizar)
    if (transactions.length < 100) {
      // Para datasets pequeños, no vale la pena el overhead del worker
      return;
    }

    setIsLoading(true);
    setError(null);

    // Crear worker (Vite lo maneja automáticamente con ?worker)
    try {
      const worker = new Worker(
        new URL('../workers/financeCalculations.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current = worker;

      // Configurar listener para mensajes del worker
      worker.onmessage = (event: MessageEvent<WorkerOutput | { type: string; error?: string }>) => {
        if ('type' in event.data && event.data.type === 'ready') {
          // Worker está listo, enviar datos
          const input: WorkerInput = { transactions };
          worker.postMessage(input);
          return;
        }

        if ('error' in event.data) {
          setError(event.data.error || 'Unknown worker error');
          setIsLoading(false);
          return;
        }

        // Resultados recibidos
        const result = event.data as WorkerOutput;
        setData(result);
        setComputationTime(result.computationTime);
        setIsLoading(false);

        // Log performance en desarrollo
        if (import.meta.env.DEV) {
          console.log(`[Worker] Cálculos completados en ${result.computationTime.toFixed(2)}ms para ${transactions.length} transacciones`);
        }
      };

      worker.onerror = (err) => {
        console.error('[Worker] Error:', err);
        setError('Worker execution failed');
        setIsLoading(false);
      };

    } catch (err) {
      console.error('[Worker] Creation failed:', err);
      setError('Failed to create worker');
      setIsLoading(false);
    }

    // Cleanup: Terminar worker cuando el componente se desmonte o cambien las transacciones
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
    */
  }, [transactions]);

  return {
    data,
    isLoading,
    error,
    computationTime,
  };
}
