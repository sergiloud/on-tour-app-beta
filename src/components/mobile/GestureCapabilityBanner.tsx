import React, { useEffect, useState } from 'react';
import { detectDeviceCapability, getOptimizationSettings } from '../../lib/mobile/touchOptimization';
import { useCalendarGestures } from '../../hooks/useCalendarGestures';

/**
 * GestureCapabilityBanner
 *
 * Shows available gestures and capabilities on the current device
 * Only visible on mobile, helps users understand available interactions
 */

interface GestureCapabilityBannerProps {
  dismissable?: boolean;
  className?: string;
}

export const GestureCapabilityBanner: React.FC<GestureCapabilityBannerProps> = ({
  dismissable = true,
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [capability, setCapability] = useState(detectDeviceCapability());
  const settings = getOptimizationSettings(capability);

  useEffect(() => {
    setCapability(detectDeviceCapability());
  }, []);

  if (isDismissed || !capability.isMobile) {
    return null;
  }

  const gestures = [];
  if (capability.supportsGestures) {
    gestures.push('👆 Tap to select');
    gestures.push('🤚 Pinch to zoom');
    gestures.push('👋 Swipe to navigate');
    gestures.push('👇 Double-tap to zoom');
  }

  if (!capability.supportsGestures) {
    return (
      <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 ${className}`}>
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-yellow-900 dark:text-yellow-100">Limited Touch Support</p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
              This device or browser has limited gesture support. Use buttons to navigate.
            </p>
          </div>
          {dismissable && (
            <button
              onClick={() => setIsDismissed(true)}
              className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-300 dark:hover:text-yellow-400 ml-2"
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">📱</span>
        <div className="flex-1">
          <p className="font-semibold text-blue-900 dark:text-blue-100">Mobile Gestures Available</p>
          <div className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
            {gestures.map((gesture, idx) => (
              <p key={idx}>{gesture}</p>
            ))}
          </div>
          {capability.supportsHaptic && (
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
              ✨ Haptic feedback enabled
            </p>
          )}
        </div>
        {dismissable && (
          <button
            onClick={() => setIsDismissed(true)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-400 ml-2"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default GestureCapabilityBanner;
