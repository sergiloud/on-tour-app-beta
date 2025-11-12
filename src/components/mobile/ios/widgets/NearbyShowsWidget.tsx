import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Calendar } from 'lucide-react';
import { useShows } from '../../../../hooks/useShows';
import type { Show } from '../../../../lib/shows';

interface NearbyShowsWidgetProps {
  className?: string;
}

export const NearbyShowsWidget: React.FC<NearbyShowsWidgetProps> = ({ className = '' }) => {
  const { shows } = useShows();
  
  // Get upcoming shows (next 30 days)
  const upcomingShows = React.useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return shows
      .filter((s: Show) => {
        const showDate = new Date(s.date);
        return showDate >= now && showDate <= thirtyDaysFromNow && s.status !== 'canceled';
      })
      .sort((a: Show, b: Show) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
      .map((s: Show) => {
        const showDate = new Date(s.date);
        const daysUntil = Math.ceil((showDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        
        let dateLabel = showDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        if (daysUntil === 0) dateLabel = 'Hoy';
        else if (daysUntil === 1) dateLabel = 'Mañana';
        else if (daysUntil <= 7) dateLabel = `En ${daysUntil} días`;
        
        return {
          id: s.id,
          title: `${s.city}, ${s.country}`,
          venue: s.venue || 'Sin venue',
          date: dateLabel,
          distance: daysUntil === 0 ? 'Hoy' : `${daysUntil}d`,
          city: s.city,
        };
      });
  }, [shows]);

  return (
    <div className={`relative bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-xl p-4 gpu-accelerate ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-blue-400" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-white tracking-tight">Cerca de ti</h2>
          <p className="text-[10px] text-white/50 font-medium">Shows próximos</p>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <Navigation className="w-4 h-4 text-accent-500" strokeWidth={2} />
        </button>
      </div>

      {/* Shows List */}
      <div className="space-y-2">
        {upcomingShows.length === 0 ? (
          <div className="text-center py-6 text-white/40">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">No hay shows próximos</p>
          </div>
        ) : (
          upcomingShows.map((show, index) => (
            <motion.button
              key={show.id}
              className="w-full bg-white/5 backdrop-blur-sm rounded-[16px] p-3 border border-white/10 hover:bg-white/10 hover:border-accent-500/30 transition-all text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-accent-500" strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{show.title}</h3>
                  <p className="text-xs text-white/60 truncate">{show.venue}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-white/50" strokeWidth={2} />
                      <span className="text-[10px] text-white/60 font-medium">{show.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-400" strokeWidth={2} />
                      <span className="text-[10px] text-blue-400 font-semibold">{show.distance}</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 self-center">
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* View All Button */}
      {upcomingShows.length > 0 && (
        <motion.button
          className="w-full mt-3 py-2 rounded-xl bg-accent-500/10 border border-accent-500/30 text-accent-500 text-sm font-semibold hover:bg-accent-500/20 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          Ver próximos shows
        </motion.button>
      )}
    </div>
  );
};
