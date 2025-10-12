import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for using the Finance Web Worker
 *
 * Automatically manages worker lifecycle and provides
 * a simple interface for running calculations off the main thread.
 *
 * @example
 * const { calculate, result, loading, error } = useFinanceWorker();
 *
 * // Calculate snapshot
 * await calculate('snapshot', { shows, rates, baseCurrency: 'EUR' });
 *
 * // Result will be updated automatically
 * // console.log(result);
 */

interface CalculationRequest {
    type: 'snapshot' | 'comparison' | 'aggregation' | 'tax';
    shows: any[];
    rates?: any;
    period?: { start: string; end: string };
    baseCurrency?: string;
}

interface CalculationResponse {
    type: string;
    result: any;
    executionTime: number;
}

interface UseFinanceWorkerReturn {
    calculate: (type: CalculationRequest['type'], data: Omit<CalculationRequest, 'type'>) => Promise<any>;
    result: any;
    loading: boolean;
    error: string | null;
    executionTime: number | null;
    isSupported: boolean;
}

export function useFinanceWorker(): UseFinanceWorkerReturn {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [executionTime, setExecutionTime] = useState<number | null>(null);
    const [isSupported] = useState(() => typeof Worker !== 'undefined');

    const workerRef = useRef<Worker | null>(null);
    const resolveRef = useRef<((value: any) => void) | null>(null);
    const rejectRef = useRef<((reason: any) => void) | null>(null);

    // Initialize worker
    useEffect(() => {
        if (!isSupported) return;

        try {
            // Create worker using Vite's worker import syntax
            workerRef.current = new Worker(
                new URL('../workers/finance.worker.ts', import.meta.url),
                { type: 'module' }
            );

            // Handle messages from worker
            workerRef.current.onmessage = (event: MessageEvent<CalculationResponse>) => {
                const { result: workerResult, executionTime: time } = event.data;

                if (workerResult.error) {
                    setError(workerResult.error);
                    setLoading(false);
                    if (rejectRef.current) {
                        rejectRef.current(new Error(workerResult.error));
                    }
                } else {
                    setResult(workerResult);
                    setExecutionTime(time);
                    setError(null);
                    setLoading(false);
                    if (resolveRef.current) {
                        resolveRef.current(workerResult);
                    }
                }
            };

            // Handle worker errors
            workerRef.current.onerror = (errorEvent) => {
                const errorMessage = errorEvent.message || 'Worker error occurred';
                setError(errorMessage);
                setLoading(false);
                if (rejectRef.current) {
                    rejectRef.current(new Error(errorMessage));
                }
            };
        } catch (err) {
            console.error('Failed to initialize finance worker:', err);
            setError('Failed to initialize worker');
        }

        // Cleanup
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [isSupported]);

    // Calculate function
    const calculate = useCallback(async (
        type: CalculationRequest['type'],
        data: Omit<CalculationRequest, 'type'>
    ): Promise<any> => {
        if (!isSupported) {
            throw new Error('Web Workers are not supported in this browser');
        }

        if (!workerRef.current) {
            throw new Error('Worker not initialized');
        }

        setLoading(true);
        setError(null);

        return new Promise((resolve, reject) => {
            resolveRef.current = resolve;
            rejectRef.current = reject;

            const request: CalculationRequest = {
                type,
                ...data
            };

            workerRef.current?.postMessage(request);
        });
    }, [isSupported]);

    return {
        calculate,
        result,
        loading,
        error,
        executionTime,
        isSupported
    };
}

/**
 * Fallback synchronous calculations
 * Used when Web Workers are not supported
 */
export function calculateSnapshotSync(shows: any[], rates: any = {}, baseCurrency: string = 'EUR') {
    let revenue = 0;
    let expenses = 0;
    let taxWithheld = 0;
    let showCount = 0;

    for (const show of shows) {
        if (show.status === 'canceled' || show.status === 'archived') continue;

        revenue += show.fee || 0;
        showCount++;

        if (show.whtPct) {
            taxWithheld += (show.fee || 0) * (show.whtPct / 100);
        }

        if (show.costs && Array.isArray(show.costs)) {
            for (const cost of show.costs) {
                expenses += cost.amount || 0;
            }
        }
    }

    const profit = revenue - expenses - taxWithheld;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const avgFee = showCount > 0 ? revenue / showCount : 0;

    return {
        period: 'current',
        revenue: Math.round(revenue * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        margin: Math.round(margin * 10) / 10,
        showCount,
        avgFee: Math.round(avgFee * 100) / 100,
        taxWithheld: Math.round(taxWithheld * 100) / 100
    };
}
