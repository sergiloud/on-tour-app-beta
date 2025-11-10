/**
 * Mobile Touch Optimization Utilities
 *
 * Provides utilities for optimizing touch interactions and mobile UX
 */

/**
 * DetectDeviceCapability
 * Determines device capabilities for gesture and performance optimization
 */
export interface DeviceCapability {
  supportsGestures: boolean;
  supportsHaptic: boolean;
  supportsPointer: boolean;
  cpuCores: number;
  isLowEnd: boolean;
  isTablet: boolean;
  isMobile: boolean;
}

export function detectDeviceCapability(): DeviceCapability {
  return {
    supportsGestures: 'TouchEvent' in window && 'ontouchstart' in document.documentElement,
    supportsHaptic: 'vibrate' in navigator,
    supportsPointer: 'PointerEvent' in window,
    cpuCores: navigator.hardwareConcurrency || 1,
    isLowEnd: (navigator.hardwareConcurrency || 1) <= 2,
    isTablet: /iPad|Android(?!.*Mobile)/.test(navigator.userAgent),
    isMobile: /iPhone|iPad|Android|Mobile/.test(navigator.userAgent),
  };
}

/**
 * OptimizeForDevice
 * Returns optimized settings based on device capabilities
 */
export function getOptimizationSettings(capability: DeviceCapability) {
  return {
    // Animation settings
    enableAnimations: !capability.isLowEnd,
    enableComplexAnimations: capability.cpuCores > 2,
    animationDuration: capability.isLowEnd ? 200 : 300,

    // Gesture settings
    enableGestures: capability.supportsGestures,
    enableHaptic: capability.supportsHaptic,
    hapticIntensity: capability.isLowEnd ? 0.5 : 1,

    // Performance settings
    skeletonCount: capability.isLowEnd ? 2 : 4,
    throttleInterval: capability.isLowEnd ? 32 : 16, // ms
    lazyLoadDistance: capability.isLowEnd ? '50px' : '100px',

    // Touch settings
    touchTargetSize: capability.isMobile ? 48 : 32, // px
    touchDebounce: capability.isLowEnd ? 200 : 100, // ms
  };
}

/**
 * TriggerHapticFeedback
 * Triggers haptic feedback with fallback for unsupported devices
 */
export function triggerHapticFeedback(
  pattern: 'light' | 'medium' | 'heavy' | 'error' = 'medium',
  forceVisual = false
): void {
  const patterns = {
    light: [5],
    medium: [10, 5, 10],
    heavy: [20, 10, 20],
    error: [50, 30, 50],
  };

  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(patterns[pattern]);
    } catch (err) {
      console.warn('Haptic feedback failed:', err);
      if (forceVisual) {
        showVisualPulse(pattern);
      }
    }
  } else if (forceVisual) {
    showVisualPulse(pattern);
  }
}

/**
 * showVisualPulse
 * Shows visual feedback for haptic (fallback)
 */
function showVisualPulse(pattern: string): void {
  const element = document.createElement('div');
  element.style.cssText = `
    position: fixed;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    bottom: 100px;
    right: 20px;
    background-color: rgba(99, 102, 241, 0.8);
    pointer-events: none;
    z-index: 999;
    animation: ${pattern === 'error' ? 'pulse-error' : 'pulse-normal'} 0.4s ease-out;
  `;

  document.body.appendChild(element);
  setTimeout(() => {
    document.body.removeChild(element);
  }, 400);
}

/**
 * IsTouchDevice
 * Detects if the current device supports touch
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    'onmousedown' in window ||
    navigator.maxTouchPoints > 0
  );
}

/**
 * GetViewportDimensions
 * Returns the viewport dimensions for responsive layouts
 */
export function getViewportDimensions() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isPortrait: window.innerHeight > window.innerWidth,
    isLandscape: window.innerWidth > window.innerHeight,
  };
}

/**
 * GetSafeAreaInsets
 * Returns safe area insets for devices with notches/home indicators
 */
export function getSafeAreaInsets() {
  const root = document.documentElement;
  return {
    top: getCSSVariableValue('safe-area-inset-top'),
    right: getCSSVariableValue('safe-area-inset-right'),
    bottom: getCSSVariableValue('safe-area-inset-bottom'),
    left: getCSSVariableValue('safe-area-inset-left'),
  };
}

function getCSSVariableValue(name: string): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);
  return parseInt(value) || 0;
}

/**
 * OptimizeShowSkeleton
 * Returns optimized skeleton count based on device
 */
export function getOptimizedSkeletonCount(): number {
  const capability = detectDeviceCapability();
  const settings = getOptimizationSettings(capability);
  return settings.skeletonCount;
}

/**
 * IsLowEndDevice
 * Determines if the device is low-end (for performance optimization)
 */
export function isLowEndDevice(): boolean {
  const capability = detectDeviceCapability();
  return capability.isLowEnd;
}

export default {
  detectDeviceCapability,
  getOptimizationSettings,
  triggerHapticFeedback,
  isTouchDevice,
  getViewportDimensions,
  getSafeAreaInsets,
  getOptimizedSkeletonCount,
  isLowEndDevice,
};
