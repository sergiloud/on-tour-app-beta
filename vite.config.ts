import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
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
    react(),
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
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw-advanced.ts',
      registerType: 'autoUpdate',
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
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],
        globIgnores: [
          '**/node_modules/**/*',
          '**/stats.html',
          '**/debug-*.html',
          '**/diagnose.html',
          '**/migrate-*.html',
          '**/unregister-*.html'
        ],
        // Exclude heavy chunks from precache - load on demand
        dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
        maximumFileSizeToCacheInBytes: 5000000, // 5MB limit
      },
      devOptions: {
        enabled: true, // Enable in dev for testing
        type: 'module',
        navigateFallback: 'index.html'
      },
      workbox: {
        cleanupOutdatedCaches: true,
        sourcemap: false
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
      'lucide-react',
      'sonner',
      'date-fns',
      'clsx',
    ],
    exclude: ['exceljs', 'xlsx', 'maplibre-gl', 'firebase'],
    esbuildOptions: {
      target: 'es2020',
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
        // Optimized chunking strategy
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
            
            // Firebase - large but independent
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'vendor-firebase';
            }
            
            // Framer Motion - uses React but safer to keep separate (loaded after React)
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            
            // MapLibre - truly independent, load on demand
            if (id.includes('maplibre-gl')) {
              return 'vendor-maplibre';
            }
            
            // Excel/XLSX - heavy, lazy loaded
            if (id.includes('exceljs') || id.includes('xlsx')) {
              return 'vendor-excel';
            }
            
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
            
            // IMPORTANT: Don't create a catch-all vendor chunk
            // Let Rollup handle remaining dependencies to avoid initialization issues
            // Only explicitly defined chunks above will be created
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
      },
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    chunkSizeWarningLimit: 800,
    reportCompressedSize: true,
    cssMinify: 'esbuild',
    assetsInlineLimit: 4096,
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
