import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export type EventData = {
  date: string;
  count: number;
  revenue: number;
  type: 'show' | 'travel' | 'rest';
};

type Props = {
  eventsData: EventData[];
  onPredictionClick?: (prediction: Prediction) => void;
};

export type Prediction = {
  type: 'peak-day' | 'quiet-period' | 'high-revenue' | 'travel-intensive' | 'burnout-risk';
  date?: string;
  confidence: number;
  description: string;
  recommendation: string;
};

/**
 * Advanced Pattern Analysis & AI Predictions
 * Analyzes scheduling patterns and suggests optimizations
 */
const PatternAnalyzer: React.FC<Props> = ({ eventsData, onPredictionClick }) => {
  const predictions = useMemo(() => {
    if (!eventsData.length) return [];

    const pred: Prediction[] = [];
    const avgCount = eventsData.reduce((sum, e) => sum + e.count, 0) / eventsData.length;
    const avgRevenue = eventsData.reduce((sum, e) => sum + e.revenue, 0) / eventsData.length;

    // Find peak days
    const peakDay = eventsData.reduce((max, e) => (e.count > max.count ? e : max));
    if (peakDay.count > avgCount * 1.5) {
      pred.push({
        type: 'peak-day',
        date: peakDay.date,
        confidence: Math.min(95, 60 + (peakDay.count / avgCount) * 20),
        description: `Peak activity on ${new Date(peakDay.date).toLocaleDateString()}`,
        recommendation: 'Consider scheduling important events on peak activity days for maximum reach',
      });
    }

    // Find quiet periods
    const quietDays = eventsData.filter((e) => e.count === 0);
    if (quietDays.length > eventsData.length * 0.3) {
      pred.push({
        type: 'quiet-period',
        confidence: 85,
        description: `${quietDays.length} days with no events detected`,
        recommendation: 'Use quiet periods for planning, recovery, or exclusive content creation',
      });
    }

    // High revenue days
    const highRevenueDay = eventsData.reduce((max, e) => (e.revenue > max.revenue ? e : max));
    if (highRevenueDay.revenue > avgRevenue * 2) {
      pred.push({
        type: 'high-revenue',
        date: highRevenueDay.date,
        confidence: Math.min(92, 50 + (highRevenueDay.revenue / avgRevenue) * 25),
        description: `High revenue potential on ${new Date(highRevenueDay.date).toLocaleDateString()}`,
        recommendation: 'Premium pricing strategy recommended for high-value dates',
      });
    }

    // Travel-intensive periods
    const travelCount = eventsData.filter((e) => e.type === 'travel').length;
    if (travelCount > eventsData.length * 0.3) {
      pred.push({
        type: 'travel-intensive',
        confidence: 78,
        description: `${Math.round((travelCount / eventsData.length) * 100)}% of time involves travel`,
        recommendation: 'Consolidate nearby events or increase travel allowance in budget',
      });
    }

    // Burnout risk detection
    const recentLoad = eventsData.slice(-7).reduce((sum, e) => sum + e.count, 0);
    if (recentLoad > 20) {
      pred.push({
        type: 'burnout-risk',
        confidence: 88,
        description: 'Recent schedule intensity increasing',
        recommendation: 'Schedule rest days and recovery time to prevent burnout',
      });
    }

    return pred;
  }, [eventsData]);

  const stats = useMemo(
    () => ({
      totalEvents: eventsData.reduce((sum, e) => sum + e.count, 0),
      totalRevenue: eventsData.reduce((sum, e) => sum + e.revenue, 0),
      avgEventsPerDay: (eventsData.reduce((sum, e) => sum + e.count, 0) / eventsData.length).toFixed(1),
      busyDays: eventsData.filter((e) => e.count > 0).length,
    }),
    [eventsData]
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      'peak-day': '📈',
      'quiet-period': '🌙',
      'high-revenue': '💰',
      'travel-intensive': '✈️',
      'burnout-risk': '⚠️',
    };
    return icons[type] || '📊';
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-4 gap-3"
      >
        {[
          { label: 'Total Events', value: stats.totalEvents, color: 'from-blue-500 to-blue-600' },
          { label: 'Total Revenue', value: `€${(stats.totalRevenue / 100).toFixed(0)}`, color: 'from-green-500 to-green-600' },
          { label: 'Avg/Day', value: stats.avgEventsPerDay, color: 'from-purple-500 to-purple-600' },
          { label: 'Busy Days', value: stats.busyDays, color: 'from-orange-500 to-orange-600' },
        ].map(({ label, value, color }) => (
          <motion.div
            key={label}
            whileHover={{ scale: 1.05 }}
            className={`p-3 rounded-lg bg-gradient-to-br ${color} bg-opacity-10 border border-white/10`}
          >
            <p className="text-xs text-white/60 mb-1">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Predictions */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white">AI Insights & Recommendations</p>
        {predictions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-lg bg-white/5 border border-white/10 text-center text-white/60 text-sm"
          >
            Not enough data to generate predictions yet. Add more events to your calendar.
          </motion.div>
        ) : (
          predictions.map((pred, idx) => (
            <motion.div
              key={pred.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onPredictionClick?.(pred)}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all hover:border-white/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-2xl">{getIcon(pred.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white capitalize">{pred.type.replace(/-/g, ' ')}</p>
                  <p className="text-xs text-white/60 mt-1">{pred.description}</p>
                  <p className="text-xs text-white/50 mt-2 italic">{pred.recommendation}</p>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-sm font-bold ${getConfidenceColor(pred.confidence)} whitespace-nowrap`}
                >
                  {pred.confidence}%
                </motion.div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Trend Chart (Simple) */}
      {eventsData.length > 0 && (
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm font-semibold text-white mb-3">Activity Trend</p>
          <div className="flex items-end justify-between gap-1 h-24">
            {eventsData.slice(-14).map((day, idx) => {
              const maxEvents = Math.max(...eventsData.map((d) => d.count), 1);
              const height = (day.count / maxEvents) * 100;
              return (
                <motion.div
                  key={idx}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-accent-500 to-accent-300 hover:from-accent-600 hover:to-accent-400 transition-colors"
                  title={`${day.count} events on ${day.date}`}
                />
              );
            })}
          </div>
          <p className="text-xs text-white/50 mt-2 text-center">Last 14 days activity</p>
        </div>
      )}
    </div>
  );
};

export default PatternAnalyzer;
