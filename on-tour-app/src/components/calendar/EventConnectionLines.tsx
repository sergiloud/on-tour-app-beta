import React from 'react';
import { motion } from 'framer-motion';
import type { EventLink } from './EventLinkingModal';

type Props = {
  links: EventLink[];
  eventElements: Map<string, HTMLElement | null>;
  containerRect?: DOMRect;
};

/**
 * Renders SVG lines connecting linked events
 * Shows relationship with animated lines
 */
const EventConnectionLines: React.FC<Props> = ({ links, eventElements, containerRect }) => {
  const [lines, setLines] = React.useState<
    Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      type: 'before' | 'after' | 'sameDay';
      isConflict?: boolean;
    }>
  >([]);

  React.useEffect(() => {
    const updateLines = () => {
      if (!containerRect) return;

      const newLines = links
        .map((link) => {
          const fromEl = eventElements.get(link.fromId);
          const toEl = eventElements.get(link.toId);

          if (!fromEl || !toEl) return null;

          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();

          return {
            id: `${link.fromId}-${link.toId}`,
            x1: fromRect.right - containerRect.left,
            y1: fromRect.top - containerRect.top + fromRect.height / 2,
            x2: toRect.left - containerRect.left,
            y2: toRect.top - containerRect.top + toRect.height / 2,
            type: link.type,
            isConflict: false,
          };
        })
        .filter((l) => l !== null) as typeof lines;

      setLines(newLines);
    };

    updateLines();
    window.addEventListener('resize', updateLines);
    window.addEventListener('scroll', updateLines);

    return () => {
      window.removeEventListener('resize', updateLines);
      window.removeEventListener('scroll', updateLines);
    };
  }, [links, eventElements, containerRect]);

  if (lines.length === 0) return null;

  const svgWidth = containerRect?.width || 800;
  const svgHeight = containerRect?.height || 600;

  const getStrokeColor = (type: string, isConflict: boolean) => {
    if (isConflict) return '#ef4444'; // red for conflicts
    switch (type) {
      case 'before':
        return '#06b6d4'; // cyan
      case 'after':
        return '#8b5cf6'; // purple
      case 'sameDay':
        return '#10b981'; // emerald
      default:
        return '#6b7280'; // gray
    }
  };

  const getStrokeDasharray = (type: string) => {
    switch (type) {
      case 'before':
        return '0'; // solid
      case 'after':
        return '5,5'; // dashed
      case 'sameDay':
        return '10,5'; // dotted
      default:
        return '0';
    }
  };

  return (
    <motion.svg
      className="absolute inset-0 pointer-events-none"
      width={svgWidth}
      height={svgHeight}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {lines.map((line) => (
        <g key={line.id}>
          {/* Main line */}
          <motion.line
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={getStrokeColor(line.type, line.isConflict || false)}
            strokeWidth={line.isConflict ? 3 : 2}
            strokeDasharray={getStrokeDasharray(line.type)}
            opacity={0.6}
            animate={{
              opacity: line.isConflict ? 0.8 : 0.6,
            }}
            transition={{
              duration: line.isConflict ? 0.5 : 1,
              repeat: line.isConflict ? Infinity : 0,
            }}
          />

          {/* Arrow head */}
          <defs>
            <marker
              id={`arrow-${line.id}`}
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,6 L9,3 z"
                fill={getStrokeColor(line.type, line.isConflict || false)}
              />
            </marker>
          </defs>

          {/* Arrow line */}
          <motion.line
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={getStrokeColor(line.type, line.isConflict || false)}
            strokeWidth={1.5}
            fill="none"
            markerEnd={`url(#arrow-${line.id})`}
            opacity={0.3}
          />
        </g>
      ))}
    </motion.svg>
  );
};

export default React.memo(EventConnectionLines);
