import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  base: '/', // Always use root path for Vercel deployment
  esbuild: {
    drop: [], // TEMPORARILY allow console.log for debugging
    legalComments: 'none',
    logOverride: {
      'css-syntax-error': 'silent' // Suppress CSS syntax warnings that don't affect functionality
    },
    // Prevent hoisting issues that can cause initialization errors
    treeShaking: true,
    minifyIdentifiers: false // Helps with debugging initialization issues
  },
  css: {
    // Fix CSS syntax warnings during minification
    devSourcemap: true
  },
  plugins: [
    react(),
    // Bundle analyzer (solo en local, desactivado en Vercel para builds más rápidos)
    ...(process.env.VERCEL ? [] : [
      visualizer({
        filename: './dist/stats.html',
        open: false,
        gzipSize: false, // Desactivar para builds más rápidos
        brotliSize: false,
        template: 'treemap',
      }),
    ]),
    // PWA TEMPORARILY DISABLED - causes MIME type errors on Vercel
    // TODO: Re-enable after fixing Vercel configuration
    /*
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw-advanced.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'OnTour',
        short_name: 'OnTour',
        theme_color: '#bfff00',
        background_color: '#0b0f14',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**\/*.{js,css,html}'], // Reducido para build más rápido
        globIgnores: ['**\/node_modules/**\/*', '**\/stats.html'],
        maximumFileSizeToCacheInBytes: 3000000 // 3MB límite
      },
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
    */
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-is'
    ],
    exclude: ['exceljs', 'xlsx'] // Excluir librerías pesadas del pre-bundling
  },
  ssr: {
    // Packages that should be processed by Vite instead of treated as external
    noExternal: ['@tanstack/react-virtual'],
    // Server entry point for SSR
    target: 'node'
  },
  build: {
    sourcemap: false,
    minify: 'esbuild', // Mucho más rápido que terser (4-5x faster)
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'], // Modern browsers
    cssCodeSplit: true, // Split CSS for better caching
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      // Prevent circular dependencies
      preserveEntrySignatures: 'strict',
      output: {
        // Use format that handles imports better
        format: 'es',
        // ✅ Chunking agresivo optimizado para performance
        manualChunks: (id) => {
          // Core React
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler')) {
            return 'vendor';
          }
          
          // React Query - usado en toda la app
          if (id.includes('@tanstack/react-query')) {
            return 'vendor';
          }
          
          // Router
          if (id.includes('react-router-dom')) {
            return 'vendor';
          }
          
          // Charts - bundle pesado separado
          if (id.includes('recharts') || 
              id.includes('victory') ||
              id.includes('d3-')) {
            return 'charts';
          }
          
          // Redux (usado por charts)
          if (id.includes('@reduxjs/toolkit') || 
              id.includes('react-redux') ||
              id.includes('redux')) {
            return 'charts';
          }
          
          // UI libraries - animaciones y iconos
          if (id.includes('framer-motion') || 
              id.includes('lucide-react')) {
            return 'ui';
          }
          
          // Mapas - muy pesado, lazy load
          if (id.includes('maplibre-gl') || 
              id.includes('mapbox')) {
            return 'heavy';
          }
          
          // Excel export - muy pesado, lazy load
          if (id.includes('exceljs') || 
              id.includes('xlsx')) {
            return 'heavy';
          }
          
          // Firebase - usado solo en algunas rutas
          if (id.includes('firebase') || 
              id.includes('@firebase')) {
            return 'firebase';
          }
          
          // Virtual lists
          if (id.includes('@tanstack/react-virtual')) {
            return 'ui';
          }
          
          // Date libraries
          if (id.includes('date-fns') || 
              id.includes('dayjs')) {
            return 'utils';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || 
              id.includes('zod')) {
            return 'forms';
          }
        },
        // Nombres optimizados para caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 2500, // Aumentado para vendor-heavy (recharts + maplibre)
    reportCompressedSize: false, // Desactivar para build más rápido
    cssMinify: true, // Keep default esbuild CSS minifier
    assetsInlineLimit: 4096
  },
  server: {
    host: true,
    port: 3000
  }
});
