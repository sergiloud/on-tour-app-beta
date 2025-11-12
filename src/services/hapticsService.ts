/**
 * Haptic Feedback Service
 * Provides vibration patterns for different user interactions
 * iOS/Android PWA compatible
 */

export type HapticPattern = 
  | 'light'      // Single short tap (10ms)
  | 'medium'     // Medium tap (20ms)
  | 'heavy'      // Heavy tap (30ms)
  | 'success'    // Success pattern (10, 50, 10)
  | 'warning'    // Warning pattern (30, 50, 30)
  | 'error'      // Error pattern (100, 50, 100)
  | 'selection'  // Selection change (5ms)
  | 'impact';    // Generic impact (15ms)

interface HapticOptions {
  enabled?: boolean; // Allow disabling haptics globally
}

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [30, 50, 30],
  error: [100, 50, 100],
  selection: 5,
  impact: 15,
};

let hapticsEnabled = true;

/**
 * Check if haptic feedback is supported
 */
export function isHapticsSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Enable or disable haptic feedback globally
 */
export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
  
  // Persist preference
  try {
    localStorage.setItem('haptics-enabled', enabled.toString());
  } catch {}
}

/**
 * Get haptics enabled state from storage
 */
export function getHapticsEnabled(): boolean {
  try {
    const stored = localStorage.getItem('haptics-enabled');
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

/**
 * Trigger haptic feedback with a specific pattern
 */
export function haptic(pattern: HapticPattern, options?: HapticOptions): void {
  const enabled = options?.enabled ?? hapticsEnabled;
  
  if (!enabled || !isHapticsSupported()) {
    return;
  }

  const vibrationPattern = PATTERNS[pattern];
  
  try {
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    console.warn('[Haptics] Vibration failed:', error);
  }
}

/**
 * Specific haptic functions for common interactions
 */
export const haptics = {
  /**
   * Light tap - for soft interactions like hovering or focusing
   */
  light: () => haptic('light'),
  
  /**
   * Medium tap - for standard button presses
   */
  medium: () => haptic('medium'),
  
  /**
   * Heavy tap - for important actions or confirmations
   */
  heavy: () => haptic('heavy'),
  
  /**
   * Success feedback - for completed actions
   */
  success: () => haptic('success'),
  
  /**
   * Warning feedback - for cautionary actions
   */
  warning: () => haptic('warning'),
  
  /**
   * Error feedback - for failed actions
   */
  error: () => haptic('error'),
  
  /**
   * Selection change - for picker/selector changes
   */
  selection: () => haptic('selection'),
  
  /**
   * Generic impact - for general taps
   */
  impact: () => haptic('impact'),
};

/**
 * Initialize haptics service
 * Call this on app mount to restore user preferences
 */
export function initHaptics(): void {
  hapticsEnabled = getHapticsEnabled();
}

// Auto-initialize on import
initHaptics();
