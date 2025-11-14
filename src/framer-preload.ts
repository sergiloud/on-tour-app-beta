/**
 * Framer Motion Preload Script
 * 
 * This script loads framer-motion FIRST, before any other app code.
 * It prevents "Cannot access 'je' before initialization" TDZ errors
 * by ensuring framer-motion is fully initialized before app code runs.
 */

import 'framer-motion';

console.log('[FRAMER-PRELOAD] Framer Motion initialized successfully');
