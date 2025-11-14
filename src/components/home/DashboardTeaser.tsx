import React, { useEffect, useState } from 'react';
import { motion } from '../../framer-entry';
import { SimpleButton } from '../../ui/SimpleButton';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { MapPreview } from '../map/MapPreview';

interface DashboardTeaserProps {
  className?: string;
  onHotspotHover?: (feature: string | null) => void;
}

export const DashboardTeaser: React.FC<DashboardTeaserProps> = ({ className = '', onHotspotHover }) => {
  const [yearNet, setYearNet] = useState(0);
  const [pending, setPending] = useState(0);
  const [monthNet, setMonthNet] = useState(0);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  // Simulate streaming demo updates
  useEffect(() => {
    const interval = setInterval(() => {
      setYearNet(v => Math.min(250000, v + Math.random() * 4000));
      setPending(v => Math.min(50000, v + Math.random() * 800));
      setMonthNet(v => Math.min(60000, v + Math.random() * 1200));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const yearNetDisplay = useAnimatedNumber(yearNet, { format: v => '€' + v.toFixed(0) });
  const pendingDisplay = useAnimatedNumber(pending, { format: v => '€' + v.toFixed(0) });
  const monthNetDisplay = useAnimatedNumber(monthNet, { format: v => '€' + v.toFixed(0) });

  const progress = Math.min(1, yearNet / 250000);

  return (
    <motion.div
      className={`relative z-10 grid gap-6 sm:grid-cols-2 w-full max-w-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Ken Burns effect - subtle pan and zoom */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          scale: [1, 1.02, 1],
          x: [0, 5, 0],
          y: [0, -2, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Interactive hotspots */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Finance hotspot */}
        <motion.div
          className="absolute top-4 left-4 w-3 h-3 bg-accent-500/80 rounded-full cursor-pointer pointer-events-auto"
          animate={{
            scale: hoveredHotspot === 'Finance' ? 1.5 : [1, 1.2, 1],
            opacity: hoveredHotspot === 'Finance' ? 1 : [0.6, 1, 0.6],
          }}
          transition={{
            scale: { duration: 0.2 },
            opacity: { duration: 2, repeat: hoveredHotspot === 'Finance' ? 0 : Infinity }
          }}
          onMouseEnter={() => {
            setHoveredHotspot('Finance');
            onHotspotHover?.('Finance');
          }}
          onMouseLeave={() => {
            setHoveredHotspot(null);
            onHotspotHover?.(null);
          }}
          whileHover={{ scale: 1.5 }}
        />
        {hoveredHotspot === 'Finance' && (
          <motion.div
            className="absolute top-2 left-10 bg-ink-900/90 text-white px-2 py-1 rounded text-xs pointer-events-none z-20"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            Real-time Finance
          </motion.div>
        )}

        {/* Map hotspot */}
        <motion.div
          className="absolute bottom-4 left-4 w-3 h-3 bg-accent-500/80 rounded-full cursor-pointer pointer-events-auto"
          animate={{
            scale: hoveredHotspot === 'Map' ? 1.5 : [1, 1.2, 1],
            opacity: hoveredHotspot === 'Map' ? 1 : [0.6, 1, 0.6],
          }}
          transition={{
            scale: { duration: 0.2 },
            opacity: { duration: 2, repeat: hoveredHotspot === 'Map' ? 0 : Infinity, delay: 0.5 }
          }}
          onMouseEnter={() => {
            setHoveredHotspot('Map');
            onHotspotHover?.('Map');
          }}
          onMouseLeave={() => {
            setHoveredHotspot(null);
            onHotspotHover?.(null);
          }}
          whileHover={{ scale: 1.5 }}
        />
        {hoveredHotspot === 'Map' && (
          <motion.div
            className="absolute bottom-2 left-10 bg-ink-900/90 text-white px-2 py-1 rounded text-xs pointer-events-none z-20"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            Smart Routing
          </motion.div>
        )}

        {/* Actions hotspot */}
        <motion.div
          className="absolute bottom-4 right-4 w-3 h-3 bg-accent-500/80 rounded-full cursor-pointer pointer-events-auto"
          animate={{
            scale: hoveredHotspot === 'Actions' ? 1.5 : [1, 1.2, 1],
            opacity: hoveredHotspot === 'Actions' ? 1 : [0.6, 1, 0.6],
          }}
          transition={{
            scale: { duration: 0.2 },
            opacity: { duration: 2, repeat: hoveredHotspot === 'Actions' ? 0 : Infinity, delay: 1 }
          }}
          onMouseEnter={() => {
            setHoveredHotspot('Actions');
            onHotspotHover?.('Actions');
          }}
          onMouseLeave={() => {
            setHoveredHotspot(null);
            onHotspotHover?.(null);
          }}
          whileHover={{ scale: 1.5 }}
        />
        {hoveredHotspot === 'Actions' && (
          <motion.div
            className="absolute bottom-2 right-10 bg-ink-900/90 text-white px-2 py-1 rounded text-xs pointer-events-none z-20"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            Action Hub
          </motion.div>
        )}
      </div>

      {/* Metamorphosis elements - these will animate from the spreadsheet */}
      <motion.div layoutId="date-0" className="absolute top-20 left-20 opacity-0 text-xs font-mono bg-blue-100 p-1 rounded">
        2025-01-15
      </motion.div>
      <motion.div layoutId="venue-0" className="absolute top-32 left-32 opacity-0 text-xs bg-green-100 p-1 rounded font-semibold">
        Madison Square Garden
      </motion.div>
      <motion.div layoutId="revenue-0" className="absolute bottom-20 right-20 opacity-0 text-xs bg-red-100 p-1 rounded text-green-700 font-bold">
        $450,000
      </motion.div>
      <motion.div layoutId="status-0" className="absolute bottom-32 right-32 opacity-0 w-3 h-3 rounded-full bg-green-500"></motion.div>

      <motion.div
        className="glass p-5 flex flex-col gap-4"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-wide uppercase font-medium" style={{color:'var(--text-secondary)'}}>Year Net</span>
          <span className="badge-soft">Live</span>
        </div>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">{yearNetDisplay}</div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
          <motion.span
            className="block h-full bg-accent-500/80 transition-all duration-700"
            style={{ width: `${Math.max(progress * 100, 4)}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(progress * 100, 4)}%` }}
            transition={{ duration: 0.7 }}
          />
        </div>
        <div className="text-xs" style={{color:'var(--text-secondary)'}}>Target €250k • Demo feed</div>
      </motion.div>

      <motion.div
        className="glass p-5 flex flex-col gap-3"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-xs tracking-wide uppercase font-medium" style={{color:'var(--text-secondary)'}}>Itinerary</span>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span style={{color:'var(--text-primary)'}}>Berlin</span>
            <span className="badge-soft">Confirmed</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{color:'var(--text-primary)'}}>Paris</span>
            <span className="badge-soft">Pending</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{color:'var(--text-primary)'}}>Madrid</span>
            <span className="badge-soft">Offer</span>
          </div>
        </div>
        <SimpleButton tone="ghost" className="mt-2 text-xs px-3 py-2">
          View all
        </SimpleButton>
      </motion.div>

      <motion.div
        className="glass sm:col-span-2 p-5 flex flex-col md:flex-row gap-5 items-center"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex-1">
          <MapPreview />
        </div>
        <div className="flex-1 text-center md:text-left">
          <motion.h3
            className="text-lg font-semibold mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            Smart Routing
          </motion.h3>
          <motion.p
            className="text-sm opacity-80 mb-4"
            style={{color:'var(--text-secondary)'}}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            AI-optimized routes that minimize travel time and maximize performance days.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <SimpleButton className="text-sm px-4 py-2">
              Plan Route
            </SimpleButton>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
