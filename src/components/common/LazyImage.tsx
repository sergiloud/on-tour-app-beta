import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    placeholder?: string;
    threshold?: number;
    className?: string;
}

/**
 * Lazy-loaded image component with IntersectionObserver
 * Shows placeholder until image enters viewport, then loads actual image
 */
export const LazyImage: React.FC<LazyImageProps> = React.memo(({
    src,
    alt,
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23222" width="400" height="300"/%3E%3C/svg%3E',
    threshold = 0.1,
    className = '',
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState<string>(placeholder);
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        // Skip if no browser IntersectionObserver support
        if (!('IntersectionObserver' in window)) {
            setImageSrc(src);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setImageSrc(src);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold,
                rootMargin: '50px', // Start loading 50px before entering viewport
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, [src, threshold]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            onLoad={handleLoad}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-50'} transition-opacity duration-300`}
            loading="lazy"
            decoding="async"
            {...props}
        />
    );
});

LazyImage.displayName = 'LazyImage';
