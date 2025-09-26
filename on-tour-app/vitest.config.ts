import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
    coverage: { enabled: false },
    // Keep tests memory-friendly and deterministic
    pool: 'forks',
    sequence: { concurrent: false },
    maxWorkers: 1,
    minWorkers: 1,
    isolate: true
  }
});