import { useState, useEffect, useCallback } from 'react';
import { createFinancialEngine, type WasmFinancialEngineInterface } from '../lib/wasmFinancialEngine';
import { advancedPWA, type PWACapabilities } from '../lib/advancedPWA';
import { toast } from 'sonner';

interface PerformanceMetrics {
  wasmInitTime?: number;
  jsCalculationTime?: number;
  wasmCalculationTime?: number;
  performanceGain?: number;
}

export interface EnhancedAppCapabilities {
  pwa: PWACapabilities;
  wasm: {
    isInitialized: boolean;
    isSupported: boolean;
    fallbackMode: boolean;
  };
  performance: PerformanceMetrics;
}

export function useEnhancedApp() {
  const [engine, setEngine] = useState<WasmFinancialEngineInterface | null>(null);
  const [capabilities, setCapabilities] = useState<EnhancedAppCapabilities>({
    pwa: {
      isStandalone: false,
      isInstallable: false,
      isOnline: true,
      hasNotifications: false,
      hasBackgroundSync: false,
      hasPushMessaging: false,
    },
    wasm: {
      isInitialized: false,
      isSupported: typeof WebAssembly === 'object',
      fallbackMode: false,
    },
    performance: {},
  });
  
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize WebAssembly Financial Engine
  const initializeWasm = useCallback(async () => {
    try {
      console.log('🦀 Initializing WebAssembly Financial Engine...');
      const startTime = performance.now();
      
      const wasmEngine = await createFinancialEngine();
      const initTime = performance.now() - startTime;
      
      setEngine(wasmEngine);
      setCapabilities(prev => ({
        ...prev,
        wasm: {
          ...prev.wasm,
          isInitialized: wasmEngine.isInitialized(),
          fallbackMode: !wasmEngine.isInitialized(),
        },
        performance: {
          ...prev.performance,
          wasmInitTime: initTime,
        },
      }));
      
      console.log(`✅ Financial Engine ready (${initTime.toFixed(2)}ms)`);
      
    } catch (error) {
      console.error('❌ WASM initialization failed:', error);
      setCapabilities(prev => ({
        ...prev,
        wasm: {
          ...prev.wasm,
          isInitialized: false,
          fallbackMode: true,
        },
      }));
      
      toast.error('High-performance engine unavailable', {
        description: 'Using JavaScript fallback for calculations',
      });
    }
  }, []);

  // Update PWA capabilities
  const updatePWACapabilities = useCallback(() => {
    const pwaCapabilities = advancedPWA.getCapabilities();
    setCapabilities(prev => ({
      ...prev,
      pwa: pwaCapabilities,
    }));
  }, []);

  // Initialize everything
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setIsInitializing(true);
      
      // Initialize PWA capabilities immediately
      updatePWACapabilities();
      
      // Initialize WASM engine
      if (mounted) {
        await initializeWasm();
      }
      
      if (mounted) {
        setIsInitializing(false);
      }
    };

    initialize();

    // Listen for PWA events
    const handleOnline = () => updatePWACapabilities();
    const handleOffline = () => updatePWACapabilities();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initializeWasm, updatePWACapabilities]);

  // PWA Installation
  const installPWA = useCallback(async (): Promise<boolean> => {
    try {
      const success = await advancedPWA.showInstallPrompt();
      if (success) {
        updatePWACapabilities();
      }
      return success;
    } catch (error) {
      console.error('PWA install failed:', error);
      return false;
    }
  }, [updatePWACapabilities]);

  // Request notification permissions
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    try {
      const permission = await advancedPWA.requestNotificationPermission();
      updatePWACapabilities();
      return permission === 'granted';
    } catch (error) {
      console.error('Notification permission failed:', error);
      return false;
    }
  }, [updatePWACapabilities]);

  // Show notification
  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    advancedPWA.showNotification(title, options);
  }, []);

  // Add offline action to sync queue
  const addOfflineAction = useCallback((action: string, data: any) => {
    advancedPWA.addToSyncQueue(action, data);
  }, []);

  // Performance testing utilities
  const benchmarkEngine = useCallback(async (testData: any[]) => {
    if (!engine) {
      console.warn('Engine not initialized for benchmarking');
      return;
    }

    try {
      // Test calculation performance
      const startTime = performance.now();
      await engine.calculateMetrics(testData);
      const calcTime = performance.now() - startTime;

      setCapabilities(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          wasmCalculationTime: calcTime,
        },
      }));

      console.log(`🚀 WASM calculation completed in ${calcTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('Benchmark failed:', error);
    }
  }, [engine]);

  // Cache management
  const clearAppCache = useCallback(async () => {
    await advancedPWA.clearCache();
    updatePWACapabilities();
  }, [updatePWACapabilities]);

  // Get storage usage
  const getStorageUsage = useCallback(async () => {
    return await advancedPWA.getStorageUsage();
  }, []);

  return {
    // Core engine
    engine,
    isInitializing,
    
    // Capabilities
    capabilities,
    
    // PWA functions
    installPWA,
    enableNotifications,
    showNotification,
    addOfflineAction,
    clearAppCache,
    getStorageUsage,
    
    // Performance
    benchmarkEngine,
    
    // Status checks
    isWasmReady: capabilities.wasm.isInitialized,
    isPWAInstallable: capabilities.pwa.isInstallable,
    isOffline: !capabilities.pwa.isOnline,
    isStandalone: capabilities.pwa.isStandalone,
  };
}