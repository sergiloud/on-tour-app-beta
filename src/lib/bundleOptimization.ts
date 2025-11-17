/**
 * Bundle Optimization Configuration
 * 
 * Professional configuration for optimal chunk splitting, lazy loading,
 * and tree shaking in production builds.
 */

import { defineConfig } from 'vite';
import type { ManualChunksOption } from 'rollup';

// ============================================================================
// MANUAL CHUNK CONFIGURATION
// ============================================================================

export const manualChunks: ManualChunksOption = (id: string) => {
  // DO NOT chunk React core - keep it in the main bundle to avoid loading order issues
  // React, React-DOM, and React-IS must be available before any other code runs
  
  if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
    return 'vendor-react-router';
  }
  
  if (id.includes('node_modules/react-query') || id.includes('node_modules/@tanstack')) {
    return 'vendor-react-query';
  }

  // Animation libraries
  if (id.includes('node_modules/framer-motion')) {
    return 'vendor-motion';
  }
  
  if (id.includes('node_modules/lottie') || id.includes('node_modules/@lottiefiles')) {
    return 'vendor-lottie';
  }

  // Firebase - split by service for better caching
  if (id.includes('node_modules/firebase/') && id.includes('/auth')) {
    return 'vendor-firebase-auth';
  }
  
  if (id.includes('node_modules/firebase/') && id.includes('/firestore')) {
    return 'vendor-firebase-firestore';
  }
  
  if (id.includes('node_modules/firebase/') && id.includes('/storage')) {
    return 'vendor-firebase-storage';
  }
  
  if (id.includes('node_modules/firebase/')) {
    return 'vendor-firebase-core';
  }

  // Heavy libraries - isolate for lazy loading (keep small)
  if (id.includes('node_modules/exceljs')) {
    return 'vendor-excel';
  }
  
  if (id.includes('node_modules/maplibre') || id.includes('node_modules/@maplibre')) {
    return 'vendor-maps';
  }
  
  if (id.includes('node_modules/chart.js') || id.includes('node_modules/recharts')) {
    return 'vendor-charts';
  }

  // Date/time libraries
  if (id.includes('node_modules/date-fns') || id.includes('node_modules/dayjs')) {
    return 'vendor-date';
  }

  // UI libraries
  if (id.includes('node_modules/lucide') || id.includes('node_modules/@heroicons')) {
    return 'vendor-icons';
  }
  
  if (id.includes('node_modules/@headlessui') || id.includes('node_modules/@radix-ui')) {
    return 'vendor-ui-primitives';
  }

  // Utility libraries
  if (id.includes('node_modules/lodash') || id.includes('node_modules/ramda')) {
    return 'vendor-utils';
  }

  // Form libraries
  if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/formik')) {
    return 'vendor-forms';
  }

  // Socket.io and real-time
  if (id.includes('node_modules/socket.io') || id.includes('node_modules/ws')) {
    return 'vendor-realtime';
  }

  // Application features - split by feature with smaller chunks
  if (id.includes('/src/pages/dashboard/Calendar') || 
      id.includes('/src/components/calendar') || 
      id.includes('/src/hooks/useCalendar')) {
    return 'app-calendar';
  }
  
  if (id.includes('/src/pages/dashboard/Finance') || 
      id.includes('/src/features/finance') ||
      id.includes('/src/components/finance')) {
    return 'app-finance';
  }
  
  if (id.includes('/src/pages/travel') || 
      id.includes('/src/services/travelApi') ||
      id.includes('/src/components/travel')) {
    return 'app-travel';
  }
  
  if (id.includes('/src/pages/dashboard/Settings') || 
      id.includes('/src/components/settings') ||
      id.includes('/src/context/SettingsContext')) {
    return 'app-settings';
  }

  // Split MissionControlLab separately due to its size
  if (id.includes('/src/pages/dashboard/MissionControlLab') ||
      id.includes('/src/components/mission') ||
      id.includes('/src/features/dashboard/viewConfig')) {
    return 'app-mission';
  }

  // Everything else from node_modules goes to vendor
  if (id.includes('node_modules/')) {
    return 'vendor';
  }
  
  // Return undefined for app code (default chunking)
  return undefined;
};

// ============================================================================
// LAZY LOADING CONFIGURATION
// ============================================================================

/**
 * Components that should be dynamically imported for better performance
 */
export const lazyComponents = [
  // Heavy components
  'InteractiveMap',
  'CalendarApp',
  'FinanceOverview',
  'ExcelExporter',
  'ChartComponents',
  
  // Feature-specific components
  'ContactEditorModal',
  'EventCreationModal',
  'BulkOperationsModal',
  'AdvancedFilters',
  
  // Admin/settings components
  'OrganizationSettings',
  'DataSecurityPage',
  'AuditLogViewer',
  
  // Mobile-specific components
  'MobileCalendar',
  'MobileFinance',
  'NotificationCenter'
];

/**
 * Services that should be dynamically imported
 */
export const lazyServices = [
  'excelExportService',
  'mapService',
  'chartService',
  'imageProcessingService',
  'offlineService',
  'reportGenerationService'
];

// ============================================================================
// TREE SHAKING CONFIGURATION
// ============================================================================

/**
 * Library configurations for optimal tree shaking
 */
export const treeShakingConfig = {
  // Lodash - use babel-plugin-lodash or direct imports
  lodash: {
    // Use: import { debounce } from 'lodash/debounce'
    // Instead of: import _ from 'lodash'
    preserveModules: true,
    sideEffects: false
  },
  
  // Date-fns - already tree-shakeable but specify explicitly
  'date-fns': {
    sideEffects: false
  },
  
  // Lucide icons - tree-shake by default
  'lucide-react': {
    sideEffects: false
  },
  
  // Firebase - specify which modules to include
  firebase: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'firebase/analytics'
    ]
  }
};

// ============================================================================
// WEBPACK ANALYZER UTILITIES
// ============================================================================

/**
 * Bundle analyzer configuration for development
 */
export const bundleAnalyzerConfig = {
  // Use rollup-plugin-visualizer for bundle analysis
  template: 'treemap', // or 'sunburst', 'network'
  open: true,
  filename: 'dist/bundle-analysis.html',
  gzipSize: true,
  brotliSize: true
};

// ============================================================================
// PRELOAD STRATEGY
// ============================================================================

/**
 * Critical resources that should be preloaded
 */
export const preloadConfig = {
  // Critical chunks to preload immediately
  critical: [
    'vendor-react-core',
    'vendor-firebase-core',
    'app-dashboard'
  ],
  
  // High-priority chunks to preload on interaction
  highPriority: [
    'app-calendar',
    'app-finance',
    'vendor-motion'
  ],
  
  // Low-priority chunks to preload when idle
  lowPriority: [
    'vendor-excel',
    'vendor-maps',
    'vendor-charts'
  ]
};

// ============================================================================
// COMPRESSION CONFIGURATION
// ============================================================================

/**
 * Compression settings for optimal delivery
 */
export const compressionConfig = {
  // Gzip compression (supported by all browsers)
  gzip: {
    enabled: true,
    threshold: 1024, // Only compress files > 1KB
    algorithm: 'gzip',
    level: 6 // Balance between compression ratio and speed
  },
  
  // Brotli compression (modern browsers, better compression)
  brotli: {
    enabled: true,
    threshold: 1024,
    algorithm: 'brotliCompress',
    level: 6
  }
};

// ============================================================================
// CACHE STRATEGY
// ============================================================================

/**
 * Cache configuration for optimal loading performance
 */
export const cacheStrategy = {
  // Long-term cache for vendor code (changes rarely)
  vendor: {
    pattern: /vendor-.*\.js$/,
    strategy: 'CacheFirst',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
    }
  },
  
  // Medium-term cache for app code (changes more frequently)
  app: {
    pattern: /app-.*\.js$/,
    strategy: 'StaleWhileRevalidate',
    expiration: {
      maxEntries: 30,
      maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
    }
  },
  
  // Short-term cache for main bundle (changes most frequently)
  main: {
    pattern: /index-.*\.js$/,
    strategy: 'NetworkFirst',
    expiration: {
      maxEntries: 10,
      maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
    }
  }
};

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

export default {
  manualChunks,
  lazyComponents,
  lazyServices,
  treeShakingConfig,
  bundleAnalyzerConfig,
  preloadConfig,
  compressionConfig,
  cacheStrategy
};