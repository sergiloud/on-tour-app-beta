import { useState, useEffect } from 'react';
import { wasmFinancialEngine, WasmFinancialEngineInterface } from '../lib/wasmFinancialEngine';

export function useFinancialEngine() {
  const [engine, setEngine] = useState<WasmFinancialEngineInterface | null>(null);
  const [type, setType] = useState<'JS' | 'WASM'>('JS');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!wasmFinancialEngine.isInitialized()) {
        await wasmFinancialEngine.initialize();
      }
      
      setEngine(wasmFinancialEngine);
      // @ts-ignore - we just added this method
      if (typeof wasmFinancialEngine.getEngineType === 'function') {
        // @ts-ignore
        setType(wasmFinancialEngine.getEngineType());
      } else {
        // Fallback if method not found (should not happen if file updated correctly)
        setType('JS');
      }
      setIsReady(true);
    };
    
    init();
  }, []);

  return { engine, type, isReady };
}
