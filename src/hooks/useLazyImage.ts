import { useEffect, useRef, useState } from 'react';

interface UseLazyImageOptions {
  /** Placeholder image to show before real image loads */
  placeholder?: string;
  /** IntersectionObserver rootMargin (default: '50px') */
  rootMargin?: string;
  /** Threshold for visibility (default: 0.01) */
  threshold?: number;
}

interface UseLazyImageReturn {
  /** Ref to attach to img element */
  imgRef: React.RefObject<HTMLImageElement | null>;
  /** Image source to use (placeholder or real) */
  src: string;
  /** Whether the image has loaded */
  isLoaded: boolean;
  /** Whether the image is in viewport */
  isInView: boolean;
}

/**
 * Lazy load images using IntersectionObserver
 * Only loads image when it enters viewport
 * 
 * @example
 * const { imgRef, src, isLoaded } = useLazyImage(show.image);
 * <img ref={imgRef} src={src} className={isLoaded ? 'opacity-100' : 'opacity-0'} />
 */
export const useLazyImage = (
  realSrc: string,
  options: UseLazyImageOptions = {}
): UseLazyImageReturn => {
  const {
    placeholder = '',
    rootMargin = '50px',
    threshold = 0.01,
  } = options;

  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    // Create IntersectionObserver to detect when image enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(imgElement);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  useEffect(() => {
    if (!isInView) return;

    // Preload image
    const img = new Image();
    img.src = realSrc;

    img.onload = () => {
      setIsLoaded(true);
    };

    img.onerror = () => {
      console.warn(`Failed to load image: ${realSrc}`);
      setIsLoaded(true); // Still mark as loaded to avoid infinite loading state
    };
  }, [isInView, realSrc]);

  return {
    imgRef,
    src: isInView ? realSrc : placeholder,
    isLoaded,
    isInView,
  };
};
