/**
 * Haptic feedback patterns for iOS-style interactions
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [20],
  heavy: [40],
  success: [10, 30, 10],
  warning: [20, 20, 20],
  error: [30, 50, 30],
  selection: [5],
};

/**
 * Trigger haptic feedback if supported
 */
export const haptic = (pattern: HapticPattern = 'light'): void => {
  if (!('vibrate' in navigator)) return;

  const vibrationPattern = HAPTIC_PATTERNS[pattern];
  navigator.vibrate(vibrationPattern);
};

/**
 * React hook for haptic feedback
 */
export const useHaptic = () => {
  const isSupported = 'vibrate' in navigator;

  return {
    trigger: haptic,
    isSupported,
  };
};

/**
 * Haptic feedback for button press
 */
export const hapticButton = () => haptic('light');

/**
 * Haptic feedback for selection/toggle
 */
export const hapticSelection = () => haptic('selection');

/**
 * Haptic feedback for success actions
 */
export const hapticSuccess = () => haptic('success');

/**
 * Haptic feedback for warnings
 */
export const hapticWarning = () => haptic('warning');

/**
 * Haptic feedback for errors
 */
export const hapticError = () => haptic('error');

/**
 * Haptic feedback for long press
 */
export const hapticLongPress = () => haptic('heavy');

/**
 * Haptic feedback for drag start
 */
export const hapticDragStart = () => haptic('medium');

/**
 * Haptic feedback for drag end
 */
export const hapticDragEnd = () => haptic('light');