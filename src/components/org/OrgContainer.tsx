import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import clsx from 'clsx';

interface OrgContainerProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  layoutId?: string;
}

/**
 * OrgContainer - Reusable page container for org pages
 *
 * Features:
 * - Consistent max-width and centering
 * - Responsive padding
 * - Framer Motion support for animations
 * - Proper spacing for content
 *
 * Provides:
 * - max-w-[1400px] (consistent with design system)
 * - mx-auto (center alignment)
 * - px-3 md:px-4 (responsive padding)
 * - space-y-4 (vertical spacing)
 * - pb-8 (bottom padding)
 *
 * Usage:
 * ```tsx
 * <OrgContainer layoutId="page-name">
 *   <OrgCard>...</OrgCard>
 *   <OrgGrid>...</OrgGrid>
 * </OrgContainer>
 * ```
 */
export const OrgContainer = React.forwardRef<
  HTMLDivElement,
  OrgContainerProps
>(({
  children,
  className,
  layoutId,
  ...motionProps
}, ref) => {
  const baseClasses = clsx(
    'max-w-[1400px] mx-auto px-3 md:px-4 space-y-4 pb-8',
    className
  );

  return (
    <motion.div
      ref={ref}
      className={baseClasses}
      layoutId={layoutId}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
});

OrgContainer.displayName = 'OrgContainer';

export default OrgContainer;
