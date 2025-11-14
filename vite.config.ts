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
    minifyIdentifiers: true, // Re-enable for proper minification
    minifySyntax: true,
    minifyWhitespace: true,
    keepNames: true, // Keep names to prevent __publicField errors
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        passes: 1, // Reduce optimization passes to prevent circular issues
        ecma: 2020,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    cssCodeSplit: true,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        format: 'es',
        // Optimized chunking - separate heavy libraries
        // CRITICAL: Don't over-separate to avoid circular dependency issues
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React ecosystem - keep together with react-based libs
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // MapLibre - truly independent, no React deps
            if (id.includes('maplibre-gl')) {
              return 'vendor-maplibre';
            }
            
            // Firebase - independent from React
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'vendor-firebase';
            }
            
            // TanStack - independent query library
            if (id.includes('@tanstack')) {
              return 'vendor-tanstack';
            }
            
            // Date libraries - independent
            if (id.includes('date-fns') || id.includes('dayjs')) {
              return 'vendor-dates';
            }
            
            // Framer Motion - keep separate but loaded after react
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            
            // Everything else in one vendor to prevent dependency issues
            // This includes: recharts, zod, i18next, sonner, immer, clsx, etc.
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
