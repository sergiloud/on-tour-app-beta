import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardTeaser } from './DashboardTeaser';
import { t } from '../../lib/i18n';
import { sanitizeName } from '../../lib/sanitize';

// Enhanced Flying Element component for metamorphosis animation
interface MorphingElementProps {
  children: React.ReactNode;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  flyProgress: number;
  delay?: number;
  morphType?: 'marker' | 'chart-bar' | 'kpi-value';
  className?: string;
}

const MorphingElement: React.FC<MorphingElementProps> = ({
  children,
  startPosition,
  endPosition,
  flyProgress,
  delay = 0,
  morphType = 'marker',
  className = ''
}) => {
  const progress = Math.max(0, Math.min(1, (flyProgress - delay) / (1 - delay)));
  const easedProgress = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2; // easeOutQuad

  const currentX = startPosition.x + (endPosition.x - startPosition.x) * easedProgress;
  const currentY = startPosition.y + (endPosition.y - startPosition.y) * easedProgress;

  // Morphing transformations based on type
  let scale = 1;
  let opacity = 1;
  let borderRadius = '4px';
  let backgroundColor = 'rgba(0, 0, 0, 0.8)';

  if (morphType === 'marker') {
    // Spreadsheet row -> Map marker
    scale = progress < 0.3 ? 1 : 0.3 + (1 - progress) * 0.7; // Shrink to marker size
    opacity = progress < 0.1 ? 1 : progress > 0.9 ? 0.8 : 1;
    borderRadius = progress > 0.5 ? '50%' : '4px'; // Become circular
    backgroundColor = progress > 0.5 ? 'rgba(59, 130, 246, 0.9)' : 'rgba(0, 0, 0, 0.8)'; // Blue for markers
  } else if (morphType === 'chart-bar') {
    // Data -> Chart bar
    scale = progress < 0.4 ? 1 : 0.2 + (1 - progress) * 0.8; // Shrink to bar width
    opacity = progress < 0.1 ? 1 : progress > 0.9 ? 0.9 : 1;
    borderRadius = '2px';
    backgroundColor = progress > 0.6 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(0, 0, 0, 0.8)'; // Green for bars
  } else if (morphType === 'kpi-value') {
    // Revenue -> KPI number
    scale = progress < 0.5 ? 1 : 0.4 + (1 - progress) * 0.6; // Moderate shrink
    opacity = progress < 0.1 ? 1 : progress > 0.9 ? 0.95 : 1;
    backgroundColor = progress > 0.7 ? 'rgba(168, 85, 247, 0.9)' : 'rgba(0, 0, 0, 0.8)'; // Purple for KPIs
  }

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        left: currentX,
        top: currentY,
        transform: `scale(${scale})`,
        opacity,
        borderRadius,
        backgroundColor,
        zIndex: 10,
        transition: 'all 0.1s ease-out'
      }}
    >
      {children}
    </motion.div>
  );
};

interface StorytellingSectionProps {
  selectedPersona: 'artist' | 'agency' | null;
  selectedMarker: string | null;
  onKpiClick: (kpiType: 'pending' | 'monthNet' | 'yearNet') => void;
}

export const StorytellingSection: React.FC<StorytellingSectionProps> = ({
  selectedPersona,
  selectedMarker,
  onKpiClick,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [chaosLevel, setChaosLevel] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [internalTargetCoordinates, setInternalTargetCoordinates] = useState<{ pending: { x: number; y: number; }; monthNet: { x: number; y: number; }; yearNet: { x: number; y: number; }; } | null>(null);

  // Internal state for marker selection within this component's teaser
  const [internalSelectedMarker, setInternalSelectedMarker] = useState<string | null>(selectedMarker);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate scroll progress through the section
      const sectionTop = rect.top + window.pageYOffset;
      const sectionHeight = rect.height;

      // Progress from 0 to 1 as user scrolls through section
      const progress = Math.max(0, Math.min(1,
        (window.pageYOffset - (sectionTop - windowHeight * 0.5)) / (sectionHeight - windowHeight * 0.5)
      ));

      setScrollProgress(progress);

      // Trigger visibility and chaos animation
      if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
        setIsVisible(true);
        // Start chaos animation based on scroll progress
        setChaosLevel(Math.min(10, progress * 15));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate target coordinates dynamically from the internal DashboardTeaser
  useEffect(() => {
    const updateCoordinates = () => {
      if (!sectionRef.current) return;

      const containerRect = sectionRef.current.querySelector('.relative.h-\\[500px\\]')?.getBoundingClientRect();
      if (!containerRect) return;

      // Use default positions since we don't have direct ref access
      setInternalTargetCoordinates({
        pending: { x: 100, y: 100 },
        monthNet: { x: 200, y: 100 },
        yearNet: { x: 300, y: 100 },
      });
    };

    // Update coordinates immediately
    updateCoordinates();

    window.addEventListener('resize', updateCoordinates);
    return () => {
      window.removeEventListener('resize', updateCoordinates);
    };
  }, []); // Recalculate on mount and resize

  // Sync internal marker with external prop
  useEffect(() => {
    setInternalSelectedMarker(selectedMarker);
  }, [selectedMarker]);

  // Transform progress for morphing effects (0 = chaos, 1 = clarity)
  const transformProgress = Math.min(1, scrollProgress * 1.5);
  const chaosOpacity = Math.max(0, 1 - transformProgress * 1.2);
  const clarityOpacity = Math.max(0, Math.min(1, (transformProgress - 0.2) * 1.5));

  // Calculate flying animation progress
  const flyProgress = Math.max(0, Math.min(1, (transformProgress - 0.3) / 0.7));

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[200vh] w-full"
      style={{ height: '200vh' }} // Make section taller for scroll-based animation
    >
      {/* Sticky container for morphing content */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl mx-auto px-6">
          {/* Left Column: Storytelling Text */}
          <div className="flex flex-col justify-center">
            <div className="relative h-64">
              {/* Chaos Text */}
              <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: chaosOpacity }}>
                <h2 className="text-2xl font-bold text-red-400 mb-4">The Reality of Tour Management</h2>
                <p className="text-lg opacity-80">Before our platform, this was your daily struggle...</p>
              </div>
              {/* Clarity Text */}
              <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: clarityOpacity }}>
                <h2 className="text-2xl font-bold text-accent-400 mb-4">From Chaos to Clarity</h2>
                <p className="text-lg opacity-80">
                  {selectedPersona === 'artist'
                    ? 'Every number tells a story. See your tour finances and logistics in a single, unified view.'
                    : 'Every alert matters. Manage your entire roster with proactive insights and centralized control.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Transformation */}
          <div className="relative h-[500px] flex items-center justify-center">
            {/* Chaos state content */}
            <AnimatePresence>
              {chaosOpacity > 0.1 && (
                <motion.div
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{
                    opacity: chaosOpacity,
                    scale: 1 - transformProgress * 0.1,
                    y: transformProgress * -40
                  }}
                  exit={{ opacity: 0, scale: 0.8, y: -60 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {selectedPersona === 'artist' ? (
                    <ArtistChaosView chaosLevel={chaosLevel} isVisible={isVisible} flyProgress={flyProgress} targetCoordinates={internalTargetCoordinates} />
                  ) : (
                    <AgencyChaosView chaosLevel={chaosLevel} isVisible={isVisible} flyProgress={flyProgress} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clarity state content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 80 }}
              animate={{
                opacity: clarityOpacity,
                scale: 0.9 + transformProgress * 0.1,
                y: 80 - transformProgress * 80
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <DashboardTeaser
                className="w-full"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Artist Chaos View Component
const ArtistChaosView: React.FC<{ chaosLevel: number; isVisible: boolean; flyProgress: number; targetCoordinates: { pending: { x: number; y: number }; monthNet: { x: number; y: number }; yearNet: { x: number; y: number } } | null }> = ({ chaosLevel, isVisible, flyProgress, targetCoordinates }) => {
  // Define spreadsheet data that will transform
  const spreadsheetData = [
    { id: 'berlin', city: 'Berlin', venue: 'Arena', date: '12/01', revenue: '€45000', expenses: '€12000', net: '€33000', status: 'confirmed', color: 'text-green-400', morphType: 'kpi-value' as const },
    { id: 'paris', city: 'Paris', venue: 'Club', date: '12/03', revenue: '€52000', expenses: '€15000', net: '€37000', status: 'pending', color: 'text-yellow-400', morphType: 'marker' as const },
    { id: 'madrid', city: 'Madrid', venue: 'Hall', date: '12/05', revenue: '€38000', expenses: '€10000', net: '€28000', status: 'confirmed', color: 'text-green-400', morphType: 'chart-bar' as const },
    { id: 'london', city: 'London', venue: 'Theater', date: '12/07', revenue: '€61000', expenses: '€18000', net: '€43000', status: 'offer', color: 'text-blue-400', morphType: 'kpi-value' as const },
  ];

  return (
    <div className="w-full max-w-2xl relative">
      <div className="text-center mb-8">
        <motion.h2
          className="text-xl font-bold text-red-400 mb-2"
          animate={{
            scale: flyProgress > 0.3 ? 0.8 : 1,
            opacity: flyProgress > 0.5 ? 0.5 : 1
          }}
          transition={{ duration: 0.5 }}
        >
          Spreadsheet Nightmare
        </motion.h2>
      </div>

      <div className="glass p-6 relative">
        <div className="text-center mb-6">
          <motion.div
            className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-full text-sm font-medium"
            animate={{
              scale: flyProgress > 0.2 ? 0.9 : 1,
              opacity: flyProgress > 0.4 ? 0.7 : 1
            }}
            transition={{ duration: 0.5 }}
          >
            <span className="animate-pulse">🔴</span>
            Artist's Spreadsheet Nightmare
          </motion.div>
        </div>

        {/* Chaotic Spreadsheet Simulation */}
        <div className="bg-black/40 rounded-lg p-4 font-mono text-xs overflow-hidden relative">
          <div className="grid grid-cols-7 gap-2 mb-2 text-gray-400 border-b border-gray-600 pb-1">
            <div>Show</div>
            <div>Venue</div>
            <div>Date</div>
            <div>Revenue</div>
            <div>Expenses</div>
            <div>Net</div>
            <div>Status</div>
          </div>

          {/* Animated spreadsheet rows that detach and fly */}
          {spreadsheetData.map((row, index) => {
            const detachProgress = Math.max(0, Math.min(1, (flyProgress - index * 0.1) / 0.3));
            const rowOpacity = 1 - detachProgress * 0.8;
            const rowScale = 1 - detachProgress * 0.2;

            return (
              <motion.div
                key={row.id}
                className="grid grid-cols-7 gap-2 py-1 border-b border-gray-800/50"
                style={{
                  opacity: rowOpacity,
                  transform: `scale(${rowScale})`,
                  transformOrigin: 'left center'
                }}
                animate={{
                  x: detachProgress * -20,
                  y: detachProgress * (index % 2 === 0 ? -10 : 10)
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <div className="text-gray-300 font-bold">{sanitizeName(row.city)}</div>
                <div className="text-gray-300">{sanitizeName(row.venue)}</div>
                <div className="text-gray-300">{row.date}</div>
                <div className="text-gray-300 font-bold">{row.revenue}</div>
                <div className="text-gray-300">{row.expenses}</div>
                <div className="font-bold text-green-400">{row.net}</div>
                <div className={`flex items-center gap-1 ${row.color}`}>
                  <span className={`w-2 h-2 rounded-full ${row.status === 'confirmed' ? 'bg-green-400' :
                    row.status === 'pending' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`} />
                  {row.status}
                </div>
              </motion.div>
            );
          })}

          {/* Morphing Elements - spreadsheet data transforming into dashboard elements */}
          {spreadsheetData.map((element, index) => {
            // Start positions in spreadsheet (relative to container)
            const startX = 20 + (index % 2) * 140; // Position in spreadsheet grid
            const startY = 60 + Math.floor(index / 2) * 25;

            // Map element IDs to KPI types for dynamic positioning
            const kpiTypeMap = {
              berlin: 'yearNet', // Berlin shows year net
              paris: 'pending',  // Paris shows pending
              madrid: 'monthNet', // Madrid shows month net
              london: 'yearNet'  // London shows year net
            };

            const kpiType = kpiTypeMap[element.id as keyof typeof kpiTypeMap];
            const endPosition = targetCoordinates?.[kpiType as keyof typeof targetCoordinates];

            // Only render if we have valid target coordinates
            if (!endPosition) return null;

            return (
              <MorphingElement
                key={element.id}
                startPosition={{ x: startX, y: startY }}
                endPosition={endPosition}
                flyProgress={flyProgress}
                delay={index * 0.15}
                morphType={element.morphType}
                className="rounded px-2 py-1 border border-white/20 shadow-lg"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold">{element.city}</span>
                  <span className={element.color}>{element.net}</span>
                  <span className={`w-2 h-2 rounded-full ${element.status === 'confirmed' ? 'bg-green-400' :
                    element.status === 'pending' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`} />
                </div>
              </MorphingElement>
            );
          })}
        </div>

        {/* Chaos indicators */}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className={`flex items-center gap-1 transition-all duration-500 ${isVisible && chaosLevel > 3 ? 'text-red-400 animate-bounce' : 'text-gray-500'}`}>
            <span>⚠️</span> Numbers don't add up
          </div>
          <div className={`flex items-center gap-1 transition-all duration-500 ${isVisible && chaosLevel > 5 ? 'text-orange-400 animate-bounce' : 'text-gray-500'}`}>
            <span>📅</span> Double bookings
          </div>
          <div className={`flex items-center gap-1 transition-all duration-500 ${isVisible && chaosLevel > 7 ? 'text-red-500 animate-bounce' : 'text-gray-500'}`}>
            <span>💸</span> Lost revenue
          </div>
        </div>
      </div>
    </div>
  );
};

// Agency Chaos View Component
const AgencyChaosView: React.FC<{ chaosLevel: number; isVisible: boolean; flyProgress: number }> = ({ chaosLevel, isVisible, flyProgress }) => (
  <div className="w-full max-w-2xl">
    <div className="text-center mb-8">
      <h2 className="text-xl font-bold text-red-400 mb-2">Inbox Overload</h2>
    </div>

    <div className="glass p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-full text-sm font-medium">
          <span className="animate-pulse">🔴</span>
          Agency Inbox Overload
        </div>
      </div>

      {/* Email Chaos Simulation */}
      <div className="space-y-2 max-h-80 overflow-y-hidden">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={`glass-sm p-3 transition-all duration-300 ${isVisible && chaosLevel > i * 0.6 ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500'][i % 4]}`}></div>
                <span className="font-medium text-sm">
                  {[
                    'Artist Manager - Berlin Show Update',
                    'Venue - Contract Signed',
                    'Tech Rider - Equipment List',
                    'Catering - Menu Confirmation',
                    'Hotel - Booking Details',
                    'Transportation - Flight Changes',
                    'Press - Interview Request',
                    'Fan Club - Meet & Greet',
                    'Merch - Inventory Update',
                    'Security - Access Requirements',
                    'Sound Engineer - Tech Notes',
                    'Tour Accountant - Invoice'
                  ][i]}
                </span>
              </div>
              <span className="text-xs opacity-60">
                {['2m ago', '5m ago', '12m ago', '1h ago', '2h ago', '3h ago', '4h ago', '5h ago', '6h ago', '7h ago', '8h ago', '9h ago'][i]}
              </span>
            </div>
            <div className="text-xs opacity-70">
              {[
                'URGENT: Berlin venue has changed capacity from 2000 to 1800 seats...',
                'Contract signed! Payment terms: 50% upfront, 50% on show day...',
                'Updated tech rider attached. Please confirm lighting requirements...',
                'Menu finalized for Berlin show. Vegan options available...',
                'Hotel booking confirmed for 15 rooms, check-in 2pm...',
                'Flight delay: Munich to Berlin now departs at 16:30...',
                'Rolling Stone wants to interview the artist after the show...',
                'Fan club requesting 50 VIP tickets for meet & greet...',
                'Merch sales report: T-shirts selling out in Berlin...',
                'Security briefing: Backstage access for 8 personnel...',
                'Sound check notes: Monitor mix needs adjustment...',
                'Invoice for €45,000 processed. Payment due in 30 days...'
              ][i]}
            </div>
          </div>
        ))}
      </div>

      {/* Chaos indicators */}
      <div className="mt-6 flex justify-center gap-6 text-xs">
        <div className={`flex items-center gap-1 transition-all duration-500 ${isVisible && chaosLevel > 4 ? 'text-red-400 animate-bounce' : 'text-gray-500'}`}>
          <span>📧</span> 247 unread emails
        </div>
        <div className={`flex items-center gap-1 transition-all duration-500 ${isVisible && chaosLevel > 6 ? 'text-orange-400 animate-bounce' : 'text-gray-500'}`}>
          <span>🔥</span> 12 urgent issues
        </div>
        <div className={`flex items-center gap-1 transition-all duration-500 ${isVisible && chaosLevel > 8 ? 'text-red-500 animate-bounce' : 'text-gray-500'}`}>
          <span>😰</span> Information overload
        </div>
      </div>
    </div>
  </div>
);
