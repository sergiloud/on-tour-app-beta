import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport is mobile size or a mobile device
 * Detects both screen size AND mobile user agents (iPhone, Android, etc.)
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    // Check if it's a mobile device via user agent
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    // Check if viewport is mobile size
    const isMobileSize = window.innerWidth < breakpoint;
    
    // Return true if either condition is met
    return isMobileDevice || isMobileSize;
  });

  useEffect(() => {
    const handleResize = () => {
      // Check user agent
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      
      // Check viewport size
      const isMobileSize = window.innerWidth < breakpoint;
      
      setIsMobile(isMobileDevice || isMobileSize);
    };

    // Use ResizeObserver for better performance if available
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });

      resizeObserver.observe(document.body);

      return () => {
        resizeObserver.disconnect();
      };
    }

    // Fallback to window resize event
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to automatically hide bottom navigation on scroll down
 * and show it on scroll up (useful for content-heavy pages)
 */
export function useBottomNavVisibility(threshold: number = 5): boolean {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (Math.abs(currentScrollY - lastScrollY) < threshold) {
            ticking = false;
            return;
          }

          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down & past threshold
            setIsVisible(false);
          } else {
            // Scrolling up or at top
            setIsVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, threshold]);

  return isVisible;
}
