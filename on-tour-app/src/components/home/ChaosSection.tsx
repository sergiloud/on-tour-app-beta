import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ChaosSectionProps {
  className?: string;
}

const spreadsheetData = [
  { date: '2025-01-15', venue: 'Madison Square Garden', city: 'New York', tickets: 18000, revenue: '$450,000', expenses: '$125,000', net: '$325,000', status: 'CONFIRMED' },
  { date: '2025-01-18', venue: 'The Fillmore', city: 'San Francisco', tickets: 1200, revenue: '$36,000', expenses: '$18,000', net: '$18,000', status: 'PENDING' },
  { date: '2025-01-22', venue: 'Red Rocks Amphitheatre', city: 'Morrison', tickets: 9500, revenue: '$285,000', expenses: '$95,000', net: '$190,000', status: 'CONFIRMED' },
  { date: '2025-01-25', venue: 'The Greek Theatre', city: 'Los Angeles', tickets: 5800, revenue: '$174,000', expenses: '$67,000', net: '$107,000', status: 'TENTATIVE' },
  { date: '2025-01-28', venue: 'Austin City Limits', city: 'Austin', tickets: 7500, revenue: '$225,000', expenses: '$89,000', net: '$136,000', status: 'CONFIRMED' },
  { date: '2025-02-01', venue: 'Radio City Music Hall', city: 'New York', tickets: 6200, revenue: '$186,000', expenses: '$74,000', net: '$112,000', status: 'PENDING' },
  { date: '2025-02-05', venue: 'The Anthem', city: 'Washington DC', tickets: 4200, revenue: '$126,000', expenses: '$52,000', net: '$74,000', status: 'CONFIRMED' },
  { date: '2025-02-08', venue: 'The Tabernacle', city: 'Atlanta', tickets: 1100, revenue: '$33,000', expenses: '$16,000', net: '$17,000', status: 'TENTATIVE' },
];

const statusColors = {
  'CONFIRMED': 'bg-green-500',
  'PENDING': 'bg-yellow-500',
  'TENTATIVE': 'bg-orange-500'
};

export const ChaosSection: React.FC<ChaosSectionProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 0.8, 0.3, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.95, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <motion.section
      ref={containerRef}
      className={`w-full min-h-screen flex items-center justify-center py-16 md:py-24 sticky top-0 z-10 ${className}`}
      style={{ opacity, scale, y }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Still running your tour on this?
          </h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Scattered spreadsheets, endless tabs, and the constant fear of missing something critical.
          </p>
        </motion.div>

        {/* Chaotic Spreadsheet Visualization */}
        <motion.div
          className="relative overflow-hidden rounded-lg border-2 border-red-500/50 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Spreadsheet Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 text-white font-bold text-sm">
            <div className="grid grid-cols-8 gap-2">
              <div className="truncate">DATE</div>
              <div className="truncate">VENUE</div>
              <div className="truncate">CITY</div>
              <div className="truncate">TICKETS</div>
              <div className="truncate">REVENUE</div>
              <div className="truncate">EXPENSES</div>
              <div className="truncate">NET</div>
              <div className="truncate">STATUS</div>
            </div>
          </div>

          {/* Spreadsheet Body - Chaotic and Overwhelming */}
          <div className="bg-white overflow-x-auto max-h-96">
            <div className="min-w-[800px]">
              {spreadsheetData.map((row, index) => (
                <motion.div
                  key={index}
                  className={`grid grid-cols-8 gap-2 p-3 border-b border-gray-200 hover:bg-yellow-50 transition-colors ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <motion.div layoutId={`date-${index}`} className="text-xs font-mono text-gray-800 truncate bg-blue-100 p-1 rounded">
                    {row.date}
                  </motion.div>
                  <motion.div layoutId={`venue-${index}`} className="text-xs text-gray-800 truncate bg-green-100 p-1 rounded font-semibold">
                    {row.venue}
                  </motion.div>
                  <motion.div layoutId={`city-${index}`} className="text-xs text-gray-800 truncate bg-purple-100 p-1 rounded">
                    {row.city}
                  </motion.div>
                  <motion.div layoutId={`tickets-${index}`} className="text-xs text-gray-800 truncate bg-orange-100 p-1 rounded text-center font-bold">
                    {row.tickets.toLocaleString()}
                  </motion.div>
                  <motion.div layoutId={`revenue-${index}`} className="text-xs truncate bg-red-100 p-1 rounded text-right font-bold text-green-700">
                    {row.revenue}
                  </motion.div>
                  <motion.div layoutId={`expenses-${index}`} className="text-xs truncate bg-pink-100 p-1 rounded text-right font-bold text-red-700">
                    {row.expenses}
                  </motion.div>
                  <motion.div layoutId={`net-${index}`} className="text-xs truncate bg-teal-100 p-1 rounded text-right font-bold text-blue-700">
                    {row.net}
                  </motion.div>
                  <div className="flex items-center gap-1">
                    <motion.div layoutId={`status-${index}`} className={`w-3 h-3 rounded-full ${statusColors[row.status as keyof typeof statusColors] || 'bg-gray-500'}`}></motion.div>
                    <span className="text-xs text-gray-800 truncate bg-yellow-100 p-1 rounded">
                      {row.status}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Extra chaotic elements */}
              <div className="grid grid-cols-8 gap-2 p-3 border-b border-gray-200 bg-red-50">
                <div className="col-span-8 text-center text-red-600 font-bold text-sm py-4">
                  ⚠️ FORMULA ERROR: #DIV/0! ⚠️
                </div>
              </div>

              <div className="grid grid-cols-8 gap-2 p-3 border-b border-gray-200 bg-yellow-50">
                <div className="col-span-4 text-xs text-gray-600 italic">
                  *Note: These numbers might be outdated. Check tab "Budget_V3_Final_Updated.xlsx"
                </div>
                <div className="col-span-4 text-xs text-gray-600 italic text-right">
                  Last updated: 2 weeks ago by someone@oldemail.com
                </div>
              </div>
            </div>
          </div>

          {/* Chaos indicators */}
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded animate-pulse">
              47 Tabs Open
            </div>
            <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded animate-pulse">
              12 Versions
            </div>
          </div>

          {/* Horizontal scroll indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded">
            ↔ Scroll horizontally for more chaos
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <p className="text-lg text-white/80 mb-6">
            There's a better way. Keep scrolling to see the transformation.
          </p>
          <div className="animate-bounce">
            <svg className="w-6 h-6 mx-auto text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};