import React, { useEffect, useRef, useState, ComponentType, LazyExoticComponent } from 'react';

interface LazyComponentProps {
  component: LazyExoticComponent<ComponentType<any>>;
  fallback?: React.ReactNode;
  threshold?: number;
  [key: string]: any;
}

/**
 * LazyComponent - Solo carga un componente cuando está visible en viewport
 * Útil para charts, mapas, y otros componentes pesados
 */
export const LazyComponent: React.FC<LazyComponentProps> = ({
  component: Component,
  fallback = <div className="w-full h-64 bg-interactive animate-pulse rounded-lg" />,
  threshold = 0.1,
  ...props
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin: '100px' } // Cargar 100px antes
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <React.Suspense fallback={fallback}>
          <Component {...props} />
        </React.Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};
