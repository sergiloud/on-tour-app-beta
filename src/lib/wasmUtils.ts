/**
 * WASM Detection and Fallback Utility
 * 
 * Safely detects WASM availability and provides fallback mechanisms
 * for different deployment environments (Vercel, local, etc.)
 */

// Check if we're in a build environment that should skip WASM
export function shouldSkipWasm(): boolean {
  // Check environment variables
  if (typeof process !== 'undefined' && process.env.SKIP_WASM === 'true') {
    return true;
  }
  
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.SKIP_WASM === 'true' || import.meta.env.VITE_SKIP_WASM === 'true') {
      return true;
    }
  }
  
  // Check if we're in SSR/build time
  if (typeof window === 'undefined') {
    return true;
  }
  
  // Check if WebAssembly is supported
  if (typeof WebAssembly === 'undefined') {
    return true;
  }
  
  return false;
}

// Safely attempt to load WASM module
export async function loadWasmModule() {
  if (shouldSkipWasm()) {
    throw new Error('WASM skipped by configuration or environment');
  }
  
  try {
    // Dynamic import that only happens when truly needed
    const wasmModule = await import('../../wasm-financial-engine/pkg/wasm_financial_engine.js');
    return wasmModule;
  } catch (error) {
    console.warn('Failed to load WASM module:', error);
    throw error;
  }
}

// Check WASM availability without loading
export function isWasmAvailable(): boolean {
  return !shouldSkipWasm() && typeof WebAssembly !== 'undefined';
}