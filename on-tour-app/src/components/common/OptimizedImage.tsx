import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    blurDataURL?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * OptimizedImage Component
 *
 * Provides automatic lazy loading, blur placeholder, and performance optimizations
 *
 * Features:
 * - Lazy loading with Intersection Observer
 * - Blur placeholder during load
 * - Fade-in animation on load
 * - Priority loading for above-the-fold images
 * - Responsive sizing
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    width,
    height,
    priority = false,
    blurDataURL,
    objectFit = 'cover'
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority); // Priority images load immediately
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (priority) return; // Skip observer for priority images

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before visible
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [priority]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* Blur placeholder */}
            {!isLoaded && blurDataURL && (
                <div
                    className="absolute inset-0 bg-cover bg-center filter blur-lg scale-110"
                    style={{ backgroundImage: `url(${blurDataURL})` }}
                    aria-hidden="true"
                />
            )}

            {/* Loading skeleton */}
            {!isLoaded && !blurDataURL && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 animate-pulse" aria-hidden="true" />
            )}

            {/* Actual image */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={handleLoad}
                    className={`
            w-full h-full
            object-${objectFit}
            transition-opacity duration-500
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
                    width={width}
                    height={height}
                />
            )}
        </div>
    );
};

/**
 * Utility function to generate blur placeholder from image URL
 * For production, use a build-time tool like sharp or imagemin
 */
export const getBlurDataURL = (src: string): string => {
    // Simple base64 encoded 1x1 px gray
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxYTFhMWEiLz48L3N2Zz4=';
};

export default OptimizedImage;
