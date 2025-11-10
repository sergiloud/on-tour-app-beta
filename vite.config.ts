import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  base: '/', // Always use root path for Vercel deployment
  esbuild: {
    drop: ['console', 'debugger'],
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
        globPatterns: ['**/*.{js,css,html}'], // Reducido para build más rápido
        globIgnores: ['**/node_modules/**/*', '**/stats.html'],
        maximumFileSizeToCacheInBytes: 3000000 // 3MB límite
      },
      devOptions: {
        enabled: false,
        type: 'module'
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
        // Simplified chunking strategy to avoid circular dependencies and initialization issues
        manualChunks: {
          // Single vendor chunk with explicit dependencies to avoid initialization issues
          'vendor': ['react', 'react-dom', 'react-router-dom', 'react-is', 'scheduler'],
          // Charts in separate chunk but with explicit dependencies
          'charts': ['recharts', '@reduxjs/toolkit', 'react-redux'],
          // UI libraries
          'ui': ['framer-motion', 'lucide-react'],
          // Heavy libraries that can be lazy loaded
          'heavy': ['maplibre-gl', 'exceljs', 'xlsx']
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
