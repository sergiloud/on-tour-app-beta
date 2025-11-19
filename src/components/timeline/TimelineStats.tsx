/**
 * Timeline Stats Component
 * 
 * Display timeline statistics and KPIs at a glance.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface TimelineStatsProps {
  totalEvents: number;
  confirmedEvents: number;
  tentativeEvents: number;
  conflicts: number;
  criticalPathDays?: number;
  projectedRevenue?: number;
  projectedExpenses?: number;
}

export default function TimelineStats({
  totalEvents,
  confirmedEvents,
  tentativeEvents,
  conflicts,
  criticalPathDays = 0,
  projectedRevenue = 0,
  projectedExpenses = 0,
}: TimelineStatsProps) {
  
  const netMargin = projectedRevenue - projectedExpenses;
  const marginPercent = projectedRevenue > 0 
    ? ((netMargin / projectedRevenue) * 100).toFixed(0) 
    : 0;
  
  const confirmationRate = totalEvents > 0 
    ? ((confirmedEvents / totalEvents) * 100).toFixed(0) 
    : 0;
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Events */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="glass rounded-lg border border-white/10 p-4 cursor-pointer hover:border-white/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-white/40">
            Events
          </div>
          <Clock className="w-4 h-4 text-white/30" />
        </div>
        <div className="text-2xl font-bold text-white tabular-nums">
          {totalEvents}
        </div>
        <div className="text-xs text-white/50 mt-1">
          {confirmedEvents} confirmed
        </div>
      </motion.div>
      
      {/* Confirmation Rate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="glass rounded-lg border border-white/10 p-4 cursor-pointer hover:border-white/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-white/40">
            Confirmed
          </div>
          <CheckCircle2 className="w-4 h-4 text-green-400/50" />
        </div>
        <div className="text-2xl font-bold text-green-400 tabular-nums">
          {confirmationRate}%
        </div>
        <div className="text-xs text-white/50 mt-1">
          {tentativeEvents} pending
        </div>
      </motion.div>
      
      {/* Conflicts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="glass rounded-lg border border-white/10 p-4 cursor-pointer hover:border-white/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-white/40">
            Conflicts
          </div>
          <AlertTriangle className={`w-4 h-4 ${conflicts > 0 ? 'text-amber-400' : 'text-white/30'}`} />
        </div>
        <div className={`text-2xl font-bold tabular-nums ${
          conflicts === 0 ? 'text-green-400' : 
          conflicts < 3 ? 'text-amber-400' : 
          'text-red-400'
        }`}>
          {conflicts}
        </div>
        <div className="text-xs text-white/50 mt-1">
          {conflicts === 0 ? 'All clear' : 'Needs attention'}
        </div>
      </motion.div>
      
      {/* Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="glass rounded-lg border border-white/10 p-4 cursor-pointer hover:border-white/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-white/40">
            Revenue
          </div>
          <TrendingUp className="w-4 h-4 text-green-400/50" />
        </div>
        <div className="text-2xl font-bold text-green-400 tabular-nums">
          {(projectedRevenue / 1000).toFixed(1)}K
        </div>
        <div className="text-xs text-white/50 mt-1">
          Projected
        </div>
      </motion.div>
      
      {/* Net Margin */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="glass rounded-lg border border-white/10 p-4 cursor-pointer hover:border-white/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-white/40">
            Margin
          </div>
          {netMargin >= 0 ? (
            <TrendingUp className="w-4 h-4 text-accent-400/50" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400/50" />
          )}
        </div>
        <div className={`text-2xl font-bold tabular-nums ${
          netMargin >= 0 ? 'text-accent-400' : 'text-red-400'
        }`}>
          {marginPercent}%
        </div>
        <div className="text-xs text-white/50 mt-1">
          {(netMargin / 1000).toFixed(1)}K net
        </div>
      </motion.div>
    </div>
  );
}
