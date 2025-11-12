import { useState, useEffect, useRef } from 'react';
import { animate, AnimationOptions } from 'framer-motion';

/**
 * Hook to animate numeric values (counters, KPIs, prices)
 * Creates smooth counting animations when values change
 * 
 * @example
 * ```tsx
 * const { displayValue } = useAnimatedNumber(revenue, { duration: 1.2 });
 * return <span>${displayValue.toFixed(2)}</span>
 * ```
 */
export const useAnimatedNumber = (
  target: number,
  options: {
    duration?: number;
    delay?: number;
    ease?: AnimationOptions['ease'];
    formatDecimals?: number;
  } = {}
) => {
  const {
    duration = 0.8,
    delay = 0,
    ease = 'easeOut',
    formatDecimals,
  } = options;

  const [displayValue, setDisplayValue] = useState(target);
  const prevTargetRef = useRef(target);

  useEffect(() => {
    // Don't animate on first render
    if (prevTargetRef.current === target) {
      return;
    }

    const controls = animate(prevTargetRef.current, target, {
      duration,
      delay,
      ease,
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    prevTargetRef.current = target;

    return () => controls.stop();
  }, [target, duration, delay, ease]);

  const formatted = formatDecimals !== undefined 
    ? parseFloat(displayValue.toFixed(formatDecimals))
    : displayValue;

  return {
    displayValue: formatted,
    isAnimating: displayValue !== target,
  };
};

/**
 * Hook to animate text changes with cross-fade effect
 * Useful for status badges, labels, dynamic text
 * 
 * @example
 * ```tsx
 * const { displayText, key } = useAnimatedText(show.status);
 * return (
 *   <motion.span key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
 *     {displayText}
 *   </motion.span>
 * );
 * ```
 */
export const useAnimatedText = (
  text: string,
  options: {
    duration?: number;
    fadeOutDuration?: number;
  } = {}
) => {
  const { duration = 0.3, fadeOutDuration = 0.15 } = options;
  const [displayText, setDisplayText] = useState(text);
  const [key, setKey] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (displayText === text) return;

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Fade out old text, then update
    timeoutRef.current = setTimeout(() => {
      setDisplayText(text);
      setKey((k) => k + 1);
    }, fadeOutDuration * 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, fadeOutDuration, displayText]);

  return {
    displayText,
    key, // Use this as React key to trigger re-animation
    duration,
    fadeOutDuration,
  };
};

/**
 * Hook to animate percentage values with visual indicator
 * Useful for progress bars, completion rates, growth percentages
 * 
 * @example
 * ```tsx
 * const { displayValue, color } = useAnimatedPercentage(75, { 
 *   thresholds: { low: 30, medium: 60, high: 90 } 
 * });
 * return <span style={{ color }}>{displayValue}%</span>
 * ```
 */
export const useAnimatedPercentage = (
  percentage: number,
  options: {
    duration?: number;
    thresholds?: {
      low: number;
      medium: number;
      high: number;
    };
    colors?: {
      low: string;
      medium: string;
      high: string;
      veryHigh: string;
    };
  } = {}
) => {
  const {
    duration = 1.0,
    thresholds = { low: 25, medium: 50, high: 75 },
    colors = {
      low: '#ef4444', // red-500
      medium: '#f59e0b', // amber-500
      high: '#10b981', // emerald-500
      veryHigh: '#06b6d4', // cyan-500
    },
  } = options;

  const { displayValue } = useAnimatedNumber(percentage, { 
    duration,
    formatDecimals: 1,
  });

  // Determine color based on value
  let color = colors.low;
  if (displayValue >= thresholds.high) {
    color = colors.veryHigh;
  } else if (displayValue >= thresholds.medium) {
    color = colors.high;
  } else if (displayValue >= thresholds.low) {
    color = colors.medium;
  }

  return {
    displayValue,
    color,
    isGood: displayValue >= thresholds.high,
    isMedium: displayValue >= thresholds.medium && displayValue < thresholds.high,
    isLow: displayValue < thresholds.medium,
  };
};

/**
 * Hook to create pulsing effect for values that update frequently
 * Useful for live data, notifications, real-time updates
 * 
 * @example
 * ```tsx
 * const { scale, opacity } = usePulseOnChange(liveCount);
 * return (
 *   <motion.div animate={{ scale, opacity }}>
 *     {liveCount} viewers
 *   </motion.div>
 * );
 * ```
 */
export const usePulseOnChange = (value: any) => {
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current === value) return;

    // Pulse animation
    setScale(1.15);
    setOpacity(0.7);

    const timeout = setTimeout(() => {
      setScale(1);
      setOpacity(1);
    }, 200);

    prevValueRef.current = value;

    return () => clearTimeout(timeout);
  }, [value]);

  return {
    scale,
    opacity,
    transition: { type: 'spring', stiffness: 500, damping: 25 },
  };
};
