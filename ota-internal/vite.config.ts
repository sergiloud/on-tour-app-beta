/// <reference types="node" />
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    VitePWA({
      srcDir: 'src',
      filename: 'sw.ts',
      strategies: 'injectManifest',
      injectRegister: false,
      manifest: {
        name: 'OTA Tour Management',
        short_name: 'OTA',
        description: 'Tour management platform for artists and managers',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    port: 5174,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        login: resolve(root, 'login.html'),
        app: resolve(root, 'app.html'),
      }
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'dexie', 'luxon', 'recharts', 'd3-scale', 'd3-array']
  }
})
