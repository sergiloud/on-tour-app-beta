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
    }
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
      output: {
        // Estrategia simplificada: menos chunks = build más rápido
        manualChunks: (id) => {
          // Keep React and React-dependent libraries together to avoid context issues
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/react-is') ||
              id.includes('node_modules/scheduler') ||
              id.includes('node_modules/prop-types') ||
              id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/@reduxjs/toolkit') ||
              id.includes('node_modules/react-redux')) {
            return 'vendor-react';
          }
          // UI pesado (framer-motion + lucide)
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react')) {
            return 'vendor-ui';
          }
          // Bibliotecas pesadas que se cargan bajo demanda
          if (id.includes('node_modules/maplibre-gl') || id.includes('node_modules/exceljs') ||
              id.includes('node_modules/xlsx')) {
            return 'vendor-heavy';
          }
          // Todo lo demás de node_modules en un solo vendor
          if (id.includes('node_modules')) {
            return 'vendor';
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
