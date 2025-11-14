/**
 * Framer Motion Entry Point
 * 
 * This file explicitly imports framer-motion FIRST to ensure it loads
 * before any other app code that depends on it.
 * 
 * This prevents "Cannot access 'je' before initialization" TDZ errors
 * in the vendor bundle.
 */

// Force framer-motion to be evaluated first
import * as FramerMotion from 'framer-motion';

// Re-export everything for use in app code
export * from 'framer-motion';
export default FramerMotion;

// Ensure global initialization
if (typeof window !== 'undefined') {
  (window as any).__FRAMER_MOTION__ = FramerMotion;
}
