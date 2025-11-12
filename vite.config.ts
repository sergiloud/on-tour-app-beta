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
    modulePreload: false, // Disable modulePreload to avoid MIME type issues
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      output: {
        format: 'es',
        // Simplified chunking strategy - only separate truly independent heavy libs
        manualChunks: (id) => {
          // Core vendor bundle - critical for initial render
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler') ||
              id.includes('react-router-dom')) {
            return 'vendor';
          }
          
          // MapLibre - only loaded in Travel/Mission, safe to separate
          if (id.includes('maplibre-gl')) {
            return 'maplibre';
          }
          
          // Excel export - only loaded on export action, safe to separate
          if (id.includes('exceljs') || id.includes('xlsx')) {
            return 'export-excel';
          }
          
          // Firebase - keep consolidated
          if (id.includes('firebase') || id.includes('@firebase')) {
            return 'firebase';
          }
          
          // Framer Motion - animations, can be separated
          if (id.includes('framer-motion')) {
            return 'animations';
          }
          
          // Let Vite handle the rest automatically (including Recharts, D3, icons, etc)
          // This prevents internal dependency resolution errors
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Optimize exports
        exports: 'auto',
        generatedCode: {
          constBindings: true,
        },
        // Compact output
        compact: true,
      },
    },
    chunkSizeWarningLimit: 1000, // Warn for chunks > 1MB
    reportCompressedSize: false,
    cssMinify: 'esbuild',
    assetsInlineLimit: 4096, // Inline assets < 4KB as base64
    // Enable compression
    terserOptions: undefined,
  },
  server: {
    host: true,
    port: 3000
  }
});
