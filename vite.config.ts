import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';

export default defineConfig({
  base: '/', // Always use root path for Vercel deployment
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['debugger', 'console'] : [], // Remove console.log in production
    legalComments: 'none',
    logOverride: {
      'css-syntax-error': 'silent'
    },
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    keepNames: false, // Reduce bundle size
    charset: 'utf8',
  },
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },
  plugins: [
    react({
      jsxRuntime: 'classic'
    }),
    // WebAssembly support for high-performance financial calculations
    wasm(),
    topLevelAwait(),
    // Bundle analyzer (solo en local, desactivado en Vercel para builds más rápidos)
    ...(process.env.VERCEL ? [] : [
      visualizer({
        filename: './dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }),
    ]),
    // PWA - Offline-first for tour managers on the road
    VitePWA({
      strategies: 'generateSW',
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'favicon.ico', 'offline.html'],
      manifest: {
        name: 'OnTour - Tour Management Platform',
        short_name: 'OnTour',
        description: 'Professional tour management platform. Works offline.',
        theme_color: '#bfff00',
        background_color: '#0b0f14',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        categories: ['business', 'productivity', 'travel'],
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        sourcemap: false,
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],
        globIgnores: [
          '**/node_modules/**/*',
          '**/stats.html',
          '**/debug-*.html',
          '**/diagnose.html',
          '**/migrate-*.html',
          '**/unregister-*.html'
        ],
        dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
        maximumFileSizeToCacheInBytes: 5000000, // 5MB limit
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react/jsx-runtime', 
      'react-dom',
      'react-router-dom',
      'react-is',
      '@tanstack/react-query',
      '@tanstack/query-core',
      'lucide-react',
      'sonner',
      'date-fns',
      'clsx',
      'framer-motion',
    ],
    exclude: [
      'exceljs', 
      'xlsx', 
      'maplibre-gl', 
      'firebase',
      '@firebase/firestore',
      '@firebase/auth',
    ],
    esbuildOptions: {
      target: 'es2020',
      define: {
        // Remove debug code in production
        'process.env.NODE_ENV': '"production"',
      },
      treeShaking: true,
      minify: true,
    },
  },
  ssr: {
    // Packages that should be processed by Vite instead of treated as external
    noExternal: ['@tanstack/react-virtual'],
    // Server entry point for SSR
    target: 'node'
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps) => {
        // Preload critical chunks, exclude heavy ones
        return deps.filter(dep => !dep.includes('maplibre') && !dep.includes('excel'));
      },
    },
    rollupOptions: {
      output: {
        format: 'es',
        // Enhanced chunking strategy for better performance
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // CRITICAL: Keep React ecosystem TOGETHER to prevent initialization errors
            // React, React-DOM, React-Router, Scheduler, TanStack Query AND Recharts
            // ALL of these use React APIs (createElement, forwardRef, etc.) and MUST load together
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('react-router') ||
                id.includes('scheduler') ||
                id.includes('@tanstack/react-query') ||
                id.includes('@tanstack/query-core') ||
                id.includes('recharts') ||
                id.includes('d3-')) {
              return 'vendor-react';
            }
            
            // Firebase - large but independent, split into sub-chunks
            if (id.includes('firebase') || id.includes('@firebase')) {
              // Split Firebase into smaller, more focused chunks
              if (id.includes('firestore') || id.includes('firebase/firestore')) {
                return 'vendor-firebase-firestore';
              }
              if (id.includes('auth') || id.includes('firebase/auth')) {
                return 'vendor-firebase-auth';
              }
              return 'vendor-firebase-core';
            }
            
            // Framer Motion - uses React but safer to keep separate (loaded after React)
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            
            // MapLibre - truly independent, load on demand
            if (id.includes('maplibre-gl')) {
              return 'vendor-maplibre';
            }
            
            // Excel/XLSX - Dynamic imports only, no manual chunking (load on demand)
            // Removed explicit chunking to enable true lazy loading
            
            // DND Kit
            if (id.includes('@dnd-kit')) {
              return 'vendor-dnd';
            }
            
            // UI utilities - small, can be grouped
            if (id.includes('lucide-react') || 
                id.includes('sonner') || 
                id.includes('@tanstack/react-virtual')) {
              return 'vendor-ui';
            }
            
            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            
            // Form libraries
            if (id.includes('react-hook-form') || 
                id.includes('@hookform') ||
                id.includes('zod')) {
              return 'vendor-forms';
            }
            
            // Utility libraries
            if (id.includes('lodash') || 
                id.includes('clsx')) {
              return 'vendor-utils';
            }
            
            // IMPORTANT: Don't create a catch-all vendor chunk
            // Let Rollup handle remaining dependencies to avoid initialization issues
            // Only explicitly defined chunks above will be created
          }
          
          // Application-level chunking for better code splitting
          // Split large feature areas into separate chunks
          if (id.includes('/src/')) {
            // Finance feature chunk
            if (id.includes('/features/finance/') || 
                id.includes('/pages/dashboard/FinanceV2') ||
                id.includes('/context/FinanceContext')) {
              return 'app-finance';
            }
            
            // Calendar feature chunk  
            if (id.includes('/pages/dashboard/Calendar') ||
                id.includes('/features/calendar/') ||
                id.includes('/components/calendar/')) {
              return 'app-calendar';
            }
            
            // Travel feature chunk
            if (id.includes('/pages/dashboard/TravelV2') ||
                id.includes('/features/travel/') ||
                id.includes('/pages/TravelWorkspace')) {
              return 'app-travel';
            }
            
            // Settings and configuration
            if (id.includes('/pages/dashboard/Settings') ||
                id.includes('/pages/profile/') ||
                id.includes('/context/SettingsContext')) {
              return 'app-settings';
            }
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        exports: 'auto',
        generatedCode: {
          constBindings: true,
          arrowFunctions: true,
          objectShorthand: true,
        },
        compact: true,
        interop: 'auto',
        hoistTransitiveImports: false, // Improve tree shaking
        minifyInternalExports: true,
        // Enhanced performance settings
        experimentalMinChunkSize: 10000, // Minimum chunk size (10KB)
      },
      treeshake: {
        moduleSideEffects: (id, external) => {
          // Allow side effects for CSS and known libraries that need them
          return id.endsWith('.css') || 
                 id.includes('firebase') || 
                 id.includes('maplibre') ||
                 !external;
        },
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        preset: 'recommended',
        annotations: true,
      },
    },
    chunkSizeWarningLimit: 600, // Reduced from 800KB to encourage better chunking
    reportCompressedSize: true,
    cssMinify: 'esbuild',
    assetsInlineLimit: 2048, // Reduced from 4096 to minimize base64 inlining
  },
  server: {
    host: true,
    port: 3000,
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/routes/AppRouter.tsx',
        './src/pages/Dashboard.tsx',
      ],
    },
  },
  preview: {
    port: 3000,
  },
});
