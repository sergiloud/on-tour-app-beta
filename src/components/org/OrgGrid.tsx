import React from 'react';
import clsx from 'clsx';

type OrgGridColumns = 1 | 2 | 3 | 4;
type OrgGridGap = 'compact' | 'normal' | 'loose';

interface OrgGridProps {
  children: React.ReactNode;
  columns?: OrgGridColumns;
  responsiveColumns?: {
    mobile?: OrgGridColumns;
    tablet?: OrgGridColumns;
    desktop?: OrgGridColumns;
  };
  gap?: OrgGridGap;
  className?: string;
}

/**
 * OrgGrid - Reusable grid component for org pages
 *
 * Features:
 * - Responsive column configuration
 * - Multiple gap options
 * - Mobile-first approach
 * - Consistent with design system
 *
 * Column values:
 * - 1: Single column (mobile)
 * - 2: Two columns (tablet)
 * - 3: Three columns (desktop)
 * - 4: Four columns (wide desktop)
 *
 * Gap options:
 * - compact: gap-3
 * - normal: gap-4 (default)
 * - loose: gap-6
 *
 * Usage:
 * ```tsx
 * <OrgGrid responsiveColumns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="normal">
 *   <Card />
 *   <Card />
 *   <Card />
 * </OrgGrid>
 *
 * // Or simple:
 * <OrgGrid columns={3} gap="normal">
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </OrgGrid>
 * ```
 */
export const OrgGrid = React.forwardRef<
  HTMLDivElement,
  OrgGridProps
>(({
  children,
  columns = 1,
  responsiveColumns,
  gap = 'normal',
  className,
}, ref) => {
  // Convert column count to grid-cols class
  const getColumnClass = (cols: OrgGridColumns) => {
    const colMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    };
    return colMap[cols];
  };

  // Get responsive column classes
  const mobileClass = getColumnClass(responsiveColumns?.mobile || columns);
  const tabletClass = responsiveColumns?.tablet ? `md:${getColumnClass(responsiveColumns.tablet)}` : '';
  const desktopClass = responsiveColumns?.desktop ? `lg:${getColumnClass(responsiveColumns.desktop)}` : '';

  // Convert gap option to Tailwind class
  const gapMap = {
    compact: 'gap-3',
    normal: 'gap-4',
    loose: 'gap-6',
  };

  const baseClasses = clsx(
    'grid',
    mobileClass,
    tabletClass,
    desktopClass,
    gapMap[gap],
    className
  );

  return (
    <div ref={ref} className={baseClasses}>
      {children}
    </div>
  );
});

OrgGrid.displayName = 'OrgGrid';

export default OrgGrid;
