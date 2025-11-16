import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedAppStatus } from '../components/enhanced/EnhancedAppStatus';
import { useEnhancedApp } from '../hooks/useEnhancedApp';
import '@testing-library/jest-dom';

// Mock the useEnhancedApp hook
vi.mock('../hooks/useEnhancedApp');

const mockCapabilities = {
  pwa: {
    isStandalone: false,
    isInstallable: true,
    isOnline: true,
    hasNotifications: true,
    hasBackgroundSync: true,
    hasPushMessaging: false,
  },
  wasm: {
    isInitialized: true,
    isSupported: true,
    fallbackMode: false,
  },
  performance: {
    wasmInitTime: 125.5,
    jsCalculationTime: 45.2,
    wasmCalculationTime: 4.1,
    performanceGain: 91.0,
  },
};

const mockHookReturn = {
  capabilities: mockCapabilities,
  isInitializing: false,
  installPWA: vi.fn(),
  enableNotifications: vi.fn(),
  clearAppCache: vi.fn(),
  getStorageUsage: vi.fn().mockResolvedValue({ used: 2500000, quota: 10000000 }),
  benchmarkEngine: vi.fn(),
  isWasmReady: true,
  isPWAInstallable: true,
  isOffline: false,
  isStandalone: false,
};

describe('EnhancedAppStatus Component', () => {
  beforeEach(() => {
    vi.mocked(useEnhancedApp).mockReturnValue(mockHookReturn);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('WebAssembly Status Display', () => {
    it('should display WebAssembly engine status correctly', () => {
      render(<EnhancedAppStatus />);
      
      expect(screen.getByText('WebAssembly Engine')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('should show performance metrics when available', () => {
      render(<EnhancedAppStatus />);
      
      expect(screen.getByText('125.50ms')).toBeInTheDocument(); // Init time
      expect(screen.getByText('+91.0%')).toBeInTheDocument(); // Performance gain
    });

    it('should display fallback mode when WASM is unavailable', () => {
      const fallbackCapabilities = {
        ...mockCapabilities,
        wasm: { ...mockCapabilities.wasm, fallbackMode: true, isInitialized: false }
      };
      
      vi.mocked(useEnhancedApp).mockReturnValue({
        ...mockHookReturn,
        capabilities: fallbackCapabilities,
        isWasmReady: false
      });

      render(<EnhancedAppStatus />);
      
      expect(screen.getByText('Fallback')).toBeInTheDocument();
    });
  });

  describe('PWA Status Display', () => {
    it('should show connection status correctly', () => {
      render(<EnhancedAppStatus />);
      
      expect(screen.getByText('Progressive Web App')).toBeInTheDocument();
      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(screen.getByText('Browser')).toBeInTheDocument(); // Not standalone
    });

    it('should display offline status when disconnected', () => {
      vi.mocked(useEnhancedApp).mockReturnValue({
        ...mockHookReturn,
        isOffline: true
      });

      render(<EnhancedAppStatus />);
      
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should show app mode when running as PWA', () => {
      vi.mocked(useEnhancedApp).mockReturnValue({
        ...mockHookReturn,
        isStandalone: true
      });

      render(<EnhancedAppStatus />);
      
      expect(screen.getByText('App Mode')).toBeInTheDocument();
    });
  });

  describe('Storage Management', () => {
    it('should display storage usage with progress bar', async () => {
      render(<EnhancedAppStatus />);
      
      await waitFor(() => {
        expect(screen.getByText('2.38 MB')).toBeInTheDocument(); // Used storage
        expect(screen.getByText('9.54 MB total')).toBeInTheDocument(); // Total quota
      });
    });

    it('should handle storage calculation errors gracefully', async () => {
      vi.mocked(useEnhancedApp).mockReturnValue({
        ...mockHookReturn,
        getStorageUsage: vi.fn().mockRejectedValue(new Error('Storage API unavailable'))
      });

      render(<EnhancedAppStatus />);
      
      // Should not crash, storage section should still render
      expect(screen.getByText('Storage & Cache')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle PWA installation click', async () => {
      render(<EnhancedAppStatus />);
      
      const installButton = screen.getByText('Install App');
      fireEvent.click(installButton);
      
      expect(mockHookReturn.installPWA).toHaveBeenCalledTimes(1);
    });

    it('should handle notification permission request', async () => {
      render(<EnhancedAppStatus />);
      
      const notificationButton = screen.getByText('Enable Notifications');
      fireEvent.click(notificationButton);
      
      expect(mockHookReturn.enableNotifications).toHaveBeenCalledTimes(1);
    });

    it('should handle cache clearing', async () => {
      render(<EnhancedAppStatus />);
      
      const clearButton = screen.getByText('Clear Cache');
      fireEvent.click(clearButton);
      
      expect(mockHookReturn.clearAppCache).toHaveBeenCalledTimes(1);
    });

    it('should handle engine benchmarking', async () => {
      render(<EnhancedAppStatus />);
      
      const benchmarkButton = screen.getByText('Benchmark Engine');
      fireEvent.click(benchmarkButton);
      
      expect(mockHookReturn.benchmarkEngine).toHaveBeenCalledWith([]);
    });

    it('should disable benchmark button when WASM is not ready', () => {
      vi.mocked(useEnhancedApp).mockReturnValue({
        ...mockHookReturn,
        isWasmReady: false
      });

      render(<EnhancedAppStatus />);
      
      const benchmarkButton = screen.getByText('Benchmark Engine');
      expect(benchmarkButton).toBeDisabled();
    });
  });

  describe('Performance Metrics', () => {
    it('should display calculation time comparison', () => {
      render(<EnhancedAppStatus />);
      
      expect(screen.getByText('4.10ms')).toBeInTheDocument(); // WASM time
      expect(screen.getByText('45.20ms')).toBeInTheDocument(); // JS time
      expect(screen.getByText('🚀 91.0% faster with WASM')).toBeInTheDocument();
    });

    it('should handle missing performance data gracefully', () => {
      const incompleteCapabilities = {
        ...mockCapabilities,
        performance: { wasmInitTime: 125.5 } // Missing calculation times
      };
      
      vi.mocked(useEnhancedApp).mockReturnValue({
        ...mockHookReturn,
        capabilities: incompleteCapabilities
      });

      render(<EnhancedAppStatus />);
      
      // Should still render without crashing
      expect(screen.getByText('WebAssembly Engine')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during initialization', () => {
      vi.mocked(useEnhancedApp).mockReturnValue({
        ...mockHookReturn,
        isInitializing: true
      });

      render(<EnhancedAppStatus />);
      
      expect(screen.getByText('Initializing enhanced capabilities...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for status indicators', () => {
      render(<EnhancedAppStatus />);
      
      // Check for semantic structure
      const wasmSection = screen.getByText('WebAssembly Engine').closest('div');
      const pwaSection = screen.getByText('Progressive Web App').closest('div');
      
      expect(wasmSection).toBeInTheDocument();
      expect(pwaSection).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<EnhancedAppStatus />);
      
      const installButton = screen.getByText('Install App');
      const clearButton = screen.getByText('Clear Cache');
      
      // These buttons should be focusable
      installButton.focus();
      expect(installButton).toHaveFocus();
      
      clearButton.focus();
      expect(clearButton).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for different screen sizes', () => {
      render(<EnhancedAppStatus />);
      
      // Check that grid classes are applied
      const gridContainer = screen.getByText('WebAssembly Engine').closest('div')?.parentElement;
      expect(gridContainer).toHaveClass('grid', 'gap-4');
    });
  });

  describe('Error Boundaries', () => {
    it('should handle hook errors gracefully', () => {
      vi.mocked(useEnhancedApp).mockImplementation(() => {
        throw new Error('Hook error');
      });

      // Should not crash the entire component tree
      expect(() => render(<EnhancedAppStatus />)).toThrow('Hook error');
    });
  });
});