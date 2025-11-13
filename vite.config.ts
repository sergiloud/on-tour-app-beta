import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  base: '/', // Always use root path for Vercel deployment
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [], // Keep console.log for debugging
    legalComments: 'none',
    logOverride: {
      'css-syntax-error': 'silent'
    },
    treeShaking: true,
    minifyIdentifiers: false, // Disable to prevent variable reference errors
    minifySyntax: true,
    minifyWhitespace: true,
    keepNames: true, // Preserve function/class names to avoid reference errors
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
    },
    rollupOptions: {
      output: {
        format: 'es',
        // Simplified chunking - avoid circular dependencies
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // MapLibre - heavy and truly independent (no React dependency)
            if (id.includes('maplibre-gl')) {
              return 'vendor-maplibre';
            }
            
            // Firebase - independent from React core
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'vendor-firebase';
            }
            
            // Everything else in one vendor chunk to prevent dependency issues
            // This includes React, React-DOM, Framer Motion, and all other libs
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        exports: 'auto',
        generatedCode: {
          constBindings: true,
        },
        compact: true,
        // Ensure proper interop for external dependencies
        interop: 'auto',
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    cssMinify: 'esbuild',
    assetsInlineLimit: 4096,
  },
  server: {
    host: true,
    port: 3000
  }
});
