import { useRef } from 'react';
import { useMotionValue } from 'framer-motion';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPull?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxPull = 100,
}: UsePullToRefreshOptions) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pullY = useMotionValue(0);
  const isRefreshingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = scrollRef.current?.scrollTop || 0;
    if (scrollTop === 0 && !isRefreshingRef.current) {
      const touch = e.touches[0];
      if (!touch) return;

      const startY = touch.clientY;

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;

        const deltaY = Math.max(0, touch.clientY - startY);
        pullY.set(Math.min(deltaY, maxPull));
      };

      const handleTouchEnd = async () => {
        if (pullY.get() > threshold && !isRefreshingRef.current) {
          isRefreshingRef.current = true;
          
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(10);
          }

          try {
            await onRefresh();
          } finally {
            isRefreshingRef.current = false;
            pullY.set(0);
          }
        } else {
          pullY.set(0);
        }
        
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };

      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
  };

  return {
    scrollRef,
    pullY,
    handleTouchStart,
    isRefreshing: isRefreshingRef.current,
  };
};
