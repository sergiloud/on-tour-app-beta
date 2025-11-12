import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLazyImage } from '../../../hooks/useLazyImage';

interface OptimizedImageProps {
  src: string;
  alt: string;
  /** WebP source (will fallback to src if not supported) */
  webpSrc?: string;
  /** Placeholder image (low-res or blur hash) */
  placeholder?: string;
  /** Blur amount for placeholder (default: 20px) */
  blurAmount?: string;
  /** Aspect ratio (e.g., '16/9', '1/1', '4/3') */
  aspectRatio?: string;
  /** Responsive image sizes for srcset */
  srcSet?: string;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Object fit (cover, contain, fill) */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  className?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
}

/**
 * Optimized image component with:
 * - Lazy loading (Intersection Observer)
 * - WebP support with fallback
 * - Blur-up progressive loading
 * - Responsive srcset
 * - Smooth fade-in animation
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  webpSrc,
  placeholder,
  blurAmount = '20px',
  aspectRatio,
  srcSet,
  sizes,
  objectFit = 'cover',
  className = '',
  onLoad,
  onError,
}) => {
  const [hasError, setHasError] = useState(false);
  const { imgRef, src: loadedSrc, isLoaded } = useLazyImage(src, { placeholder });

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Fallback placeholder color
  const placeholderBg = 'bg-white/5';

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: aspectRatio,
      }}
    >
      {/* Placeholder blur-up effect */}
      {placeholder && !isLoaded && (
        <motion.img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-${objectFit}`}
          style={{
            filter: `blur(${blurAmount})`,
            transform: 'scale(1.1)', // Prevent blur edge artifacts
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !placeholder && (
        <div className={`absolute inset-0 ${placeholderBg} animate-pulse`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Main image with WebP support */}
      {!hasError && (
        <picture>
          {/* WebP source for modern browsers */}
          {webpSrc && (
            <source
              type="image/webp"
              srcSet={webpSrc}
              sizes={sizes}
            />
          )}
          
          {/* Fallback to original format */}
          <motion.img
            ref={imgRef}
            src={loadedSrc}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-${objectFit}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            loading="lazy"
            decoding="async"
          />
        </picture>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className={`absolute inset-0 ${placeholderBg} flex items-center justify-center`}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-6 h-6 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-xs text-white/40">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};
