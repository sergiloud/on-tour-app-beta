import { useEffect, useRef, useState, ReactNode } from 'react';

interface StickyHeaderOptions {
  /** Offset from top (default: 0) */
  offset?: number;
  /** Z-index for sticky header (default: 30) */
  zIndex?: number;
  /** Enable smooth transition (default: true) */
  smooth?: boolean;
}

/**
 * Hook to create sticky headers in grouped lists
 * Headers stick to top until pushed by next header
 * 
 * @example
 * ```tsx
 * const { containerRef, headerRefs } = useStickyHeaders();
 * 
 * <div ref={containerRef}>
 *   {groups.map((group, i) => (
 *     <div key={group.id}>
 *       <h2 ref={el => headerRefs.current[i] = el}>
 *         {group.title}
 *       </h2>
 *       {group.items.map(item => <Item key={item.id} />)}
 *     </div>
 *   ))}
 * </div>
 * ```
 */
export const useStickyHeaders = (options: StickyHeaderOptions = {}) => {
  const { offset = 0, zIndex = 30, smooth = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const headers = headerRefs.current.filter(Boolean) as HTMLElement[];
    
    headers.forEach((header) => {
      header.style.position = 'sticky';
      header.style.top = `${offset}px`;
      header.style.zIndex = `${zIndex}`;
      header.style.backgroundColor = 'var(--sticky-header-bg, rgb(17 24 39))'; // gray-900
      
      if (smooth) {
        header.style.transition = 'transform 0.2s ease-out, box-shadow 0.2s ease-out';
      }
    });

    // Add scroll listener for shadow effect
    const handleScroll = () => {
      headers.forEach((header, index) => {
        const rect = header.getBoundingClientRect();
        const isStuck = rect.top <= offset;
        
        // Add shadow when stuck
        if (isStuck) {
          header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3)';
        } else {
          header.style.boxShadow = 'none';
        }
      });
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [offset, zIndex, smooth]);

  return {
    containerRef,
    headerRefs,
  };
};

/**
 * Component wrapper for sticky header sections
 * Handles styling and positioning automatically
 */
export const StickyHeaderSection = ({
  header,
  children,
  className = '',
}: {
  header: ReactNode;
  children: ReactNode;
  className?: string;
}) => {
  const [isStuck, setIsStuck] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className={className}>
      <div
        ref={headerRef}
        className={`
          sticky top-0 z-30
          bg-gray-900 
          transition-all duration-200
          ${isStuck ? 'shadow-lg' : ''}
        `}
      >
        {header}
      </div>
      {children}
    </div>
  );
};

/**
 * Create alphabetically grouped list with sticky headers
 * Perfect for contacts, artists, venues
 * 
 * @example
 * ```tsx
 * <AlphabeticalStickyList
 *   items={contacts}
 *   getKey={contact => contact.name[0].toUpperCase()}
 *   renderItem={contact => <ContactCard contact={contact} />}
 * />
 * ```
 */
export function AlphabeticalStickyList<T>({
  items,
  getKey,
  renderItem,
  emptyMessage = 'No items',
}: {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  emptyMessage?: string;
}) {
  // Group items by first letter
  const grouped = items.reduce((acc, item) => {
    const key = getKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);

  const sortedKeys = Object.keys(grouped).sort();

  if (sortedKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedKeys.map((letter) => (
        <StickyHeaderSection
          key={letter}
          header={
            <div className="px-5 py-2 font-sf-display text-sm font-semibold text-accent-400 uppercase tracking-wider">
              {letter}
            </div>
          }
        >
          <div className="space-y-2 px-5">
            {grouped[letter].map((item, index) => (
              <div key={index}>{renderItem(item)}</div>
            ))}
          </div>
        </StickyHeaderSection>
      ))}
    </div>
  );
}
