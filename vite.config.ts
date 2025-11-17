import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import compression from 'vite-plugin-compression';
import path from 'path';
import { manualChunks, compressionConfig } from './src/lib/bundleOptimization';

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
    mangleProps: undefined, // Don't mangle property names - can cause runtime errors
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
    // WebAssembly support for high-performance financial calculations (skip in Vercel build)
    ...(process.env.SKIP_WASM !== 'true' && process.env.VERCEL !== '1' ? [
      wasm(),
      topLevelAwait(),
    ] : []),
    // Professional compression for optimal delivery
    compression({
      algorithm: 'gzip',
      threshold: 1024,
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
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
        enabled: false, // Disable in development to avoid conflicts
        type: 'classic'
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
      keepNames: false,
      mangleProps: undefined, // Prevent property mangling that can cause runtime errors
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
        // Professional chunking strategy from bundleOptimization
        manualChunks,
        chunkFileNames: (chunkInfo) => {
          // Add hash to chunk names for better caching
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          const name = assetInfo.name || 'asset';
          if (name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (name.match(/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (name.match(/\.(woff2?|eot|ttf|otf)$/i)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        entryFileNames: 'assets/[name]-[hash].js',
        exports: 'auto',
        generatedCode: {
          constBindings: false, // Changed from true - prevents TDZ errors
          arrowFunctions: true,
          objectShorthand: true,
        },
        compact: true,
        interop: 'auto',
        hoistTransitiveImports: true, // Changed from false - required to prevent circular ref errors
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
