import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  base: '/', // Always use root path for Vercel deployment
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
    logOverride: {
      'css-syntax-error': 'silent'
    },
    treeShaking: true,
    minifyIdentifiers: true, // Enable for smaller bundles
    minifySyntax: true,
    minifyWhitespace: true,
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
      'react-is',
      '@tanstack/react-query',
      'lucide-react',
      'sonner',
    ],
    exclude: ['exceljs', 'xlsx', 'maplibre-gl'],
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
        // Prioritize critical chunks
        return deps.filter(dep => 
          !dep.includes('heavy') && 
          !dep.includes('charts')
        );
      },
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      output: {
        format: 'es',
        // Optimized chunking strategy for faster initial load
        manualChunks: (id) => {
          // Core vendor bundle - critical for initial render
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler') ||
              id.includes('@tanstack/react-query') ||
              id.includes('react-router-dom')) {
            return 'vendor';
          }
          
          // Charts - heavy, lazy loaded
          if (id.includes('recharts') || 
              id.includes('victory') ||
              id.includes('d3-') ||
              id.includes('@reduxjs/toolkit') || 
              id.includes('react-redux') ||
              id.includes('redux')) {
            return 'charts';
          }
          
          // UI bundle - icons and animations
          if (id.includes('framer-motion') || 
              id.includes('lucide-react') ||
              id.includes('@tanstack/react-virtual')) {
            return 'ui';
          }
          
          // Heavy features - deferred loading
          if (id.includes('maplibre-gl') || 
              id.includes('mapbox') ||
              id.includes('exceljs') || 
              id.includes('xlsx')) {
            return 'heavy';
          }
          
          // Firebase - auth and database
          if (id.includes('firebase') || 
              id.includes('@firebase')) {
            return 'firebase';
          }
          
          // Utilities - date, forms, etc
          if (id.includes('date-fns') || 
              id.includes('dayjs') ||
              id.includes('react-hook-form') || 
              id.includes('zod')) {
            return 'utils';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Optimize exports
        exports: 'auto',
        generatedCode: {
          constBindings: true,
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Warn for chunks > 1MB
    reportCompressedSize: false,
    cssMinify: 'esbuild',
    assetsInlineLimit: 4096, // Inline assets < 4KB as base64
  },
  server: {
    host: true,
    port: 3000
  }
});
