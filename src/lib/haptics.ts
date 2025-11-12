/**
 * Haptic feedback patterns for iOS-style interactions
 * Enhanced with additional patterns for premium UX
 */

export type HapticPattern = 
  | 'tap' 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'selection'
  | 'longPress'
  | 'dragStart'
  | 'dragEnd'
  | 'notificationSuccess'
  | 'notificationError'
  | 'impact';

const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  tap: [10],
  light: [10],
  medium: [20],
  heavy: [40],
  success: [10, 50, 10], // Double tap feel
  warning: [20, 20, 20], // Triple tap
  error: [50, 100, 50], // Heavy error feel
  selection: [5], // Ultra light
  longPress: [20, 10, 20], // Confirmation pattern
  dragStart: [15], // Medium-light
  dragEnd: [10, 30], // Success drop
  notificationSuccess: [10, 30, 10, 30], // Cheerful pattern
  notificationError: [50, 50, 50], // Urgent triple
  impact: [30], // Single impact
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
 * Enhanced with preference detection and smart triggering
 */
export const useHaptic = () => {
  const isSupported = 'vibrate' in navigator;
  const isEnabled = localStorage.getItem('hapticsEnabled') !== 'false';

  const trigger = (pattern: HapticPattern = 'light') => {
    if (!isSupported || !isEnabled) return;
    haptic(pattern);
  };

  const enable = () => {
    localStorage.setItem('hapticsEnabled', 'true');
  };

  const disable = () => {
    localStorage.setItem('hapticsEnabled', 'false');
  };

  return {
    trigger,
    isSupported,
    isEnabled,
    enable,
    disable,
    // Semantic shortcuts
    tap: () => trigger('tap'),
    longPress: () => trigger('longPress'),
    success: () => trigger('success'),
    error: () => trigger('error'),
    selection: () => trigger('selection'),
    impact: () => trigger('impact'),
    dragStart: () => trigger('dragStart'),
    dragEnd: () => trigger('dragEnd'),
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