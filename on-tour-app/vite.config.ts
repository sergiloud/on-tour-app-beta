import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@tanstack/react-virtual']
  },
  ssr: {
    noExternal: ['@tanstack/react-virtual']
  }
});
