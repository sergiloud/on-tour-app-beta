/**
 * ShowsDebugger - Componente de diagnóstico para verificar el estado de los shows
 * Solo visible en modo desarrollo
 */
import React, { useEffect, useState } from 'react';
import { useShows } from '../../hooks/useShows';
import { showStore } from '../../shared/showStore';

export const ShowsDebugger: React.FC = () => {
  const { shows } = useShows();
  const [localStorageShows, setLocalStorageShows] = useState<any[]>([]);
  const [storeShows, setStoreShows] = useState<any[]>([]);
  
  useEffect(() => {
    // Check localStorage
    try {
      const v3 = localStorage.getItem('shows-store-v3');
      const legacy = localStorage.getItem('demo:shows');
      
      if (v3) {
        setLocalStorageShows(JSON.parse(v3));
      } else if (legacy) {
        setLocalStorageShows(JSON.parse(legacy));
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
    
    // Check showStore directly
    setStoreShows(showStore.getAll());
  }, [shows]);
  
  if (import.meta.env.PROD) return null;
  
  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 rounded-lg p-4 text-xs font-mono z-50 shadow-xl max-h-96 overflow-auto">
      <div className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">
        🐛 Shows Debug Info
      </div>
      
      <div className="space-y-2 text-yellow-900 dark:text-yellow-100">
        <div className="border-b border-yellow-500 pb-1">
          <strong>useShows() hook:</strong> {shows.length} shows
        </div>
        
        <div className="border-b border-yellow-500 pb-1">
          <strong>showStore.getAll():</strong> {storeShows.length} shows
        </div>
        
        <div className="border-b border-yellow-500 pb-1">
          <strong>localStorage:</strong> {localStorageShows.length} shows
        </div>
        
        {shows.length > 0 && (
          <div className="mt-2">
            <strong>Sample show:</strong>
            <pre className="text-[10px] mt-1 p-2 bg-yellow-200 dark:bg-yellow-800 rounded overflow-auto max-h-32">
              {JSON.stringify(shows[0], null, 2)}
            </pre>
          </div>
        )}
        
        {shows.length === 0 && localStorageShows.length > 0 && (
          <div className="mt-2 text-red-600 dark:text-red-400 font-bold">
            ⚠️ Shows in localStorage but not loading!
          </div>
        )}
        
        {shows.length === 0 && localStorageShows.length === 0 && (
          <div className="mt-2 text-orange-600 dark:text-orange-400">
            ℹ️ No shows data found
          </div>
        )}
      </div>
    </div>
  );
};
