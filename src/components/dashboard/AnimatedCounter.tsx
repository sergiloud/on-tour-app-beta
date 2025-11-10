import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.5,
  formatValue = (val) => val.toLocaleString(),
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplayValue(Math.round(latest))
    });

    return controls.stop;
  }, [value, duration, motionValue]);

  return (
    <span className={className}>
      {formatValue(displayValue)}
    </span>
  );
};

interface AnimatedSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
}

export const AnimatedSparkline: React.FC<AnimatedSparklineProps> = ({
  data,
  width = 80,
  height = 30,
  strokeColor = '#60a5fa',
  strokeWidth = 2,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipData, setTooltipData] = useState<{ value: number; x: number; y: number } | null>(null);

  if (!data.length) return null;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const index = Math.round((x / width) * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
    const value = data[clampedIndex] ?? 0;
    const pointX = (clampedIndex / (data.length - 1)) * width;
    const pointY = height - ((value - minValue) / range) * height;

    setTooltipData({ value, x: pointX, y: pointY });
  };

  return (
    <div className={`relative ${className}`}>
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setTooltipData(null);
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Background line */}
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={0.3}
        />

        {/* Animated foreground line */}
        <motion.polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isHovered ? strokeWidth + 1 : strokeWidth}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Data points */}
        {isHovered && data.map((value, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - ((value - minValue) / range) * height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={strokeColor}
              opacity={0.8}
            />
          );
        })}

        {/* Tooltip */}
        {tooltipData && (
          <g>
            <line
              x1={tooltipData.x}
              y1={0}
              x2={tooltipData.x}
              y2={height}
              stroke={strokeColor}
              strokeWidth="1"
              opacity={0.5}
            />
            <circle
              cx={tooltipData.x}
              cy={tooltipData.y}
              r="4"
              fill={strokeColor}
              opacity={0.8}
            />
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute z-10 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg pointer-events-none"
          style={{
            left: tooltipData.x - 20,
            top: tooltipData.y - 35,
          }}
        >
          {tooltipData.value.toLocaleString()}
        </motion.div>
      )}
    </div>
  );
};