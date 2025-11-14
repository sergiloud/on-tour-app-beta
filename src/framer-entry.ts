/**
 * Framer Motion Entry Point - Pass-through wrapper
 * 
 * This file acts as a single import point for framer-motion to:
 * 1. Consolidate all framer-motion imports through one module
 * 2. Make it easier to track framer-motion usage
 * 3. Potentially swap implementation in the future
 * 
 * Just re-exports everything from framer-motion without modification.
 */

export * from 'framer-motion';
export { motion, AnimatePresence, useAnimation, useMotionValue, useSpring, useTransform, useScroll, useReducedMotion } from 'framer-motion';
import * as FramerMotion from 'framer-motion';
export default FramerMotion;
