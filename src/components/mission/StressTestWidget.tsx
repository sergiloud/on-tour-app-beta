import React, { useState } from 'react';
import { useFinancialEngine } from '../../hooks/useFinancialEngine';
import type { SimulationResult } from '../../types/finance';

export const StressTestWidget = () => {
  const { engine, type, isReady } = useFinancialEngine(); // type: 'JS' | 'WASM'
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Configuración dinámica según el motor activo
  const ITERATIONS = type === 'WASM' ? 10000 : 100;
  const LABEL = type === 'WASM' ? 'Deep Monte Carlo (10k)' : 'Quick Estimate (100)';

  const runSimulation = async () => {
    if (!engine) return;
    setIsRunning(true);
    
    try {
        // Aquí ocurre la magia: Rust se come esto en 500ms, JS sufriría con 10k
        const data = await engine.simulateScenarios({
        iterations: ITERATIONS,
        volatility: 0.15 // 15% variación en venta de tickets
        });

        setResults(data);
    } catch (e) {
        console.error(e);
    } finally {
        setIsRunning(false);
    }
  };

  if (!isReady) return <div className="p-4 border rounded-lg bg-slate-900 text-white">Loading Engine...</div>;

  return (
    <div className="p-4 border border-slate-700 rounded-lg bg-slate-900 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Financial Stress Test</h3>
        <span className={`px-2 py-1 rounded text-xs font-bold ${type === 'WASM' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
          Engine: {type}
        </span>
      </div>

      {type === 'JS' && (
        <p className="text-xs text-slate-400 mb-4 bg-slate-800 p-2 rounded border border-slate-700">
          ⚠️ Switching to simplified mode. Enable WASM for full risk analysis.
        </p>
      )}

      <button 
        onClick={runSimulation}
        disabled={isRunning}
        className={`w-full py-2 rounded font-mono font-bold transition-all ${
            isRunning 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg hover:shadow-indigo-500/25'
        }`}
      >
        {isRunning ? 'CALCULATING...' : `RUN ${LABEL}`}
      </button>

      {results && (
        <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-2xl font-bold text-emerald-400">
            {results.successRate}% Success Probability
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1 flex justify-between">
            <span>Processed {results.iterations.toLocaleString()} scenarios</span>
            <span className="text-slate-400">{results.time.toFixed(0)}ms</span>
          </div>
        </div>
      )}
    </div>
  );
};
