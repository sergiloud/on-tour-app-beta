import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig({
  base: process.env.VITE_BASE || (process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/').pop()}/` : '/'),
  plugins: [
    react(),
    // Brotli compression (best compression, modern browsers)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // Only compress files > 1KB
      deleteOriginFile: false
    }),
    // Gzip compression (fallback for older browsers)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false
    }),
    VitePWA({
      strategies: 'injectManifest', // Usar nuestro SW personalizado
      srcDir: 'src',
      filename: 'sw-advanced.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'robots.txt', 'maplibre-gl.css'],
      manifest: {
        name: 'OnTour - Tour Management Platform',
        short_name: 'OnTour',
        description: 'Professional tour management platform for artists and agencies',
        theme_color: '#bfff00',
        background_color: '#0b0f14',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,jpg,webp,woff,woff2}'],
        globIgnores: ['**/node_modules/**/*', '**/sw-*.js', '**/workbox-*.js']
      },
      devOptions: {
        enabled: false, // Disable in dev for faster HMR
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
    include: ['@tanstack/react-virtual']
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
    target: 'es2020', // Modern browsers for better optimization
    cssCodeSplit: true, // Split CSS for better caching
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info', 'console.warn'],
        passes: 3, // More aggressive compression (was 2)
        unsafe: true,
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_comps: true,
        dead_code: true,
        conditionals: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        toplevel: true,
        inline: 2
      },
      mangle: {
        safari10: true, // Better Safari compatibility
        toplevel: true
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core (stable, cache-friendly)
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Router (stable)
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // UI Libraries - split motion separately (it's large)
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Data Libraries
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query';
          }
          // Heavy libraries - CRITICALLY IMPORTANT: Split into smaller chunks
          // ExcelJS is huge, lazy load it
          if (id.includes('node_modules/exceljs')) {
            return 'vendor-excel';
          }
          // MapLibre is huge (933KB!), lazy load it
          if (id.includes('node_modules/maplibre-gl') || id.includes('node_modules/@maplibre')) {
            return 'vendor-map';
          }
          // Recharts/charts (if used - also heavy)
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'vendor-charts';
          }
          // Date/time libraries (if used)
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/dayjs')) {
            return 'vendor-dates';
          }
          // Feature modules - More granular splitting for better caching
          if (id.includes('src/features/finance') || id.includes('src/components/finance')) {
            return 'feature-finance';
          }
          if (id.includes('src/features/travel') || id.includes('src/components/travel') || id.includes('src/services/flight')) {
            return 'feature-travel';
          }
          if (id.includes('src/features/shows') || id.includes('src/components/shows')) {
            return 'feature-shows';
          }
          if (id.includes('src/features/mission') || id.includes('src/components/mission')) {
            return 'feature-mission';
          }
          // Home/landing page components
          if (id.includes('src/components/home') || id.includes('src/pages/Landing') || id.includes('src/pages/welcome')) {
            return 'feature-landing';
          }
          // Context providers (keep separate for reusability)
          if (id.includes('src/context/')) {
            return 'core-context';
          }
          // Common/shared utilities - separate from main for better caching
          if (id.includes('src/lib/') || id.includes('src/hooks/')) {
            return 'core-utils';
          }
          // Pages (split by route for better lazy loading)
          if (id.includes('src/pages/dashboard/') && !id.includes('src/pages/dashboard/Settings')) {
            return 'pages-dashboard';
          }
          if (id.includes('src/pages/org/')) {
            return 'pages-org';
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 600, // Slightly higher for vendor chunks
    reportCompressedSize: true, // Show gzip sizes
    cssMinify: true, // Minify CSS
    assetsInlineLimit: 4096 // Inline assets < 4KB as base64
  },
  server: {
    host: true,
    port: 3000
  }
});
