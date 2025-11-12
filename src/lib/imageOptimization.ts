/**
 * Image optimization utilities
 * Generate responsive srcset, WebP conversion, compression
 */

/**
 * Device pixel ratios for responsive images
 */
export const devicePixelRatios = [1, 2, 3] as const;

/**
 * Common breakpoints for responsive images
 */
export const imageBreakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Generate srcset for responsive images
 * @param baseUrl - Base image URL (without size parameters)
 * @param widths - Array of widths to generate
 * @returns srcset string
 * 
 * @example
 * generateSrcSet('https://cdn.example.com/image.jpg', [320, 640, 1280])
 * // Returns: 'https://cdn.example.com/image.jpg?w=320 320w, ...'
 */
export const generateSrcSet = (
  baseUrl: string,
  widths: number[]
): string => {
  return widths
    .map((width) => {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}w=${width}`;
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * @param breakpoints - Object mapping breakpoints to sizes
 * @returns sizes string
 * 
 * @example
 * generateSizes({ sm: '100vw', md: '50vw', lg: '33vw' })
 * // Returns: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
 */
export const generateSizes = (
  breakpoints: Record<string, string>
): string => {
  const entries = Object.entries(breakpoints);
  const lastIndex = entries.length - 1;

  return entries
    .map(([breakpoint, size], index) => {
      if (index === lastIndex) {
        return size; // Last item doesn't need media query
      }
      const maxWidth = imageBreakpoints[breakpoint as keyof typeof imageBreakpoints];
      return `(max-width: ${maxWidth}px) ${size}`;
    })
    .join(', ');
};

/**
 * Convert image URL to WebP format
 * Assumes CDN supports format conversion via query parameter
 * 
 * @param url - Original image URL
 * @returns WebP URL
 */
export const toWebP = (url: string): string => {
  if (!url) return url;
  
  // If URL already has query params
  if (url.includes('?')) {
    return `${url}&format=webp`;
  }
  
  return `${url}?format=webp`;
};

/**
 * Generate optimized image URLs for different sizes
 * @param baseUrl - Base image URL
 * @param options - Optimization options
 * @returns Object with URLs for different contexts
 */
export const generateOptimizedUrls = (
  baseUrl: string,
  options: {
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    sizes?: number[];
  } = {}
) => {
  const {
    quality = 85,
    format = 'webp',
    sizes = [320, 640, 1024, 1920],
  } = options;

  const buildUrl = (width: number, fmt: string = format) => {
    const params = new URLSearchParams({
      w: width.toString(),
      q: quality.toString(),
      format: fmt,
    });
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params.toString()}`;
  };

  return {
    // Original
    original: baseUrl,
    
    // Thumbnail (for lists)
    thumbnail: buildUrl(320),
    thumbnailWebP: buildUrl(320, 'webp'),
    
    // Small (for cards)
    small: buildUrl(640),
    smallWebP: buildUrl(640, 'webp'),
    
    // Medium (for modals)
    medium: buildUrl(1024),
    mediumWebP: buildUrl(1024, 'webp'),
    
    // Large (for full screen)
    large: buildUrl(1920),
    largeWebP: buildUrl(1920, 'webp'),
    
    // Srcset for responsive
    srcSet: generateSrcSet(baseUrl, sizes),
    srcSetWebP: sizes
      .map((width) => `${buildUrl(width, 'webp')} ${width}w`)
      .join(', '),
  };
};

/**
 * Check if browser supports WebP
 * @returns Promise resolving to boolean
 */
export const supportsWebP = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  // Check if already cached
  const cached = sessionStorage.getItem('webp-support');
  if (cached !== null) return cached === 'true';

  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      const support = webP.height === 2;
      sessionStorage.setItem('webp-support', String(support));
      resolve(support);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Compress image client-side before upload
 * @param file - Image file
 * @param options - Compression options
 * @returns Compressed blob
 */
export const compressImage = async (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate blur hash placeholder data URL
 * Simple low-res version for blur-up effect
 */
export const generatePlaceholder = (
  originalUrl: string,
  size: number = 20
): string => {
  const separator = originalUrl.includes('?') ? '&' : '?';
  return `${originalUrl}${separator}w=${size}&q=10&blur=50`;
};
