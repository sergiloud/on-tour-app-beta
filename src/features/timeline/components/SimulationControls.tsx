import React from 'react';
import { Zap } from 'lucide-react';

export default function SimulationControls() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Timeline Maestro v3.0
        </h3>
        <div className="w-2 h-2 rounded-full bg-green-500" title="WASM Ready" />
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        🦀 WASM-powered timeline simulation ready
      </div>
      
      <button 
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
        onClick={() => console.log('Timeline Maestro v3.0 Ready!')}
      >
        Run WASM Simulation
      </button>
    </div>
  );
}
