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
        gzipSize: true, // Enable to see compressed sizes
        brotliSize: true,
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
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        // Preload critical chunks
        return deps.filter(dep => !dep.includes('maplibre') && !dep.includes('firebase'));
      },
    },
    rollupOptions: {
      output: {
        format: 'es',
        // Optimized chunking strategy
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Core React bundle (must stay together)
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // Framer Motion (animation library - heavy but frequently used)
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            
            // MapLibre - truly independent, load on demand
            if (id.includes('maplibre-gl')) {
              return 'vendor-maplibre';
            }
            
            // Firebase - independent from React
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'vendor-firebase';
            }
            
            // Charts and data viz
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            
            // UI utilities
            if (id.includes('lucide-react') || id.includes('sonner') || id.includes('@tanstack/react-virtual')) {
              return 'vendor-ui';
            }
            
            // TanStack Query
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            
            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            
            // DND Kit
            if (id.includes('@dnd-kit')) {
              return 'vendor-dnd';
            }
            
            // Excel/XLSX (heavy, lazy loaded)
            if (id.includes('exceljs') || id.includes('xlsx')) {
              return 'vendor-excel';
            }
            
            // Everything else
            return 'vendor';
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
