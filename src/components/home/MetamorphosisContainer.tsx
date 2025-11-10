import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChaosSection } from './ChaosSection';
import { DashboardTeaser } from './DashboardTeaser';

// Create motion components to avoid TypeScript issues with custom props
const MotionDiv = motion.div;

interface MetamorphosisContainerProps {
  onHotspotHover?: (feature: string | null) => void;
  className?: string;
}

interface FlyingData {
  id: string;
  content: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  delay: number;
}

export const MetamorphosisContainer: React.FC<MetamorphosisContainerProps> = ({
  onHotspotHover,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [flyingData, setFlyingData] = useState<FlyingData[]>([]);
  const [showGlowEffects, setShowGlowEffects] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform values for the metamorphosis
  const chaosOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [1, 0.7, 0.2, 0]);
  const chaosY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -50, -150]);
  const dashboardOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 0.6, 0.9, 1]);
  const dashboardScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 0.98, 1]);

  // Flying data animation progress
  const flyProgress = useTransform(scrollYProgress, [0.3, 0.8], [0, 1]);

  // Initialize flying data elements
  useEffect(() => {
    const dataElements: FlyingData[] = [
      { id: 'revenue-0', content: '$450K', startX: 60, startY: 40, endX: 20, endY: 20, color: '#10b981', delay: 0 },
      { id: 'tickets-1', content: '18K', startX: 40, startY: 60, endX: 80, endY: 15, color: '#f59e0b', delay: 0.1 },
      { id: 'net-2', content: '$325K', startX: 70, startY: 80, endX: 60, endY: 25, color: '#3b82f6', delay: 0.2 },
      { id: 'venue-0', content: 'MSG', startX: 25, startY: 45, endX: 40, endY: 60, color: '#8b5cf6', delay: 0.3 },
      { id: 'city-1', content: 'NYC', startX: 35, startY: 65, endX: 90, endY: 70, color: '#ec4899', delay: 0.4 },
      { id: 'status-2', content: '✓', startX: 85, startY: 85, endX: 30, endY: 80, color: '#06d6a0', delay: 0.5 },
    ];
    setFlyingData(dataElements);
  }, []);

  // Show glow effects when flying is complete
  useEffect(() => {
    const unsubscribe = flyProgress.onChange((value) => {
      if (value > 0.9) {
        setShowGlowEffects(true);
      }
    });
    return unsubscribe;
  }, [flyProgress]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Flying Data Elements */}
      <AnimatePresence>
        {flyingData.map((data) => (
          <MotionDiv
            key={data.id}
            className="fixed z-30 pointer-events-none"
            style={{
              left: `${data.startX}%`,
              top: `${data.startY}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              x: flyProgress.get() * (data.endX - data.startX) * 10,
              y: flyProgress.get() * (data.endY - data.startY) * 8,
              scale: flyProgress.get() > 0.8 ? 1.2 : 1,
              opacity: flyProgress.get() > 0.1 ? 1 : 0,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              delay: data.delay,
              duration: 1.5,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for curved path
            }}
          >
            <MotionDiv
              className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: data.color }}
              animate={{
                boxShadow: showGlowEffects ? `0 0 20px ${data.color}80` : '0 4px 6px rgba(0,0,0,0.1)',
              }}
              transition={{ duration: 0.3 }}
            >
              {data.content}
            </MotionDiv>
          </MotionDiv>
        ))}
      </AnimatePresence>

      {/* DashboardTeaser - positioned above ChaosSection */}
      <MotionDiv
        className="sticky top-24 z-20"
        style={{
          opacity: dashboardOpacity,
          scale: dashboardScale
        }}
      >
        <DashboardTeaser onHotspotHover={onHotspotHover || ((_feature: string | null) => {})} />
      </MotionDiv>

      {/* ChaosSection - sticky and transforms */}
      <MotionDiv
        className="relative z-10"
        style={{
          opacity: chaosOpacity,
          y: chaosY
        }}
      >
        <ChaosSection />
      </MotionDiv>
    </div>
  );
};