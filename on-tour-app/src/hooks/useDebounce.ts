/**
 * @deprecated Use useDebounce from '@/lib/performance' instead
 *
 * This file is kept for backward compatibility only.
 * It now simply re-exports the version from lib/performance.
 *
 * Migration path:
 * Old: import { useDebounce } from '@/hooks/useDebounce'
 * New: import { useDebounce } from '@/lib/performance'
 *
 * The version in lib/performance.ts is more robust and is the single
 * source of truth for all debouncing functionality in the app.
 */

// Re-export from lib/performance for backward compatibility
export { useDebounce } from '../lib/performance';
