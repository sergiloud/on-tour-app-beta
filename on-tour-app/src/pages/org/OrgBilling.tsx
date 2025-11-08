import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowRight } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';

const OrgBilling: React.FC = () => {
  const { seats } = useOrg();

  return (
    <div className="px-4 sm:px-6 flex flex-col gap-4 lg:gap-5 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-md hover:shadow-accent-500/5">
        <div className="relative px-6 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  {t('nav.billing') || 'Billing'}
                </h1>
                <p className="text-xs text-white/60 mt-1">Manage your subscription and seats</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              Upgrade Plan
            </motion.button>
          </div>
        </div>
      </div>

      {/* Billing Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 text-accent-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Current Plan</h3>
              <p className="text-xs text-white/50 mt-0.5">Free Trial</p>
            </div>
          </div>
          <p className="text-xs text-white/60 mb-4">Basic access to all features. Upgrade for more capacity.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all"
          >
            View Details
          </motion.button>
        </motion.div>

        {/* Seat Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white mb-3">Seat Usage</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Internal Seats</span>
                <span className="text-sm font-semibold text-accent-500">
                  {seats.internalUsed}/{seats.internalLimit}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(seats.internalUsed / seats.internalLimit) * 100}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-accent-500 to-blue-500"
                />
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all"
          >
            Add Seats
          </motion.button>
        </motion.div>
      </div>

      {/* Upgrade CTA */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden rounded-lg border border-accent-500/25 bg-gradient-to-br from-accent-500/8 via-transparent to-transparent backdrop-blur-sm hover:border-accent-500/40 hover:shadow-md hover:shadow-accent-500/10 transition-all cursor-pointer p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Ready to scale?</h3>
            <p className="text-xs text-white/60">Upgrade your plan to unlock advanced features</p>
          </div>
          <ArrowRight className="w-5 h-5 text-accent-500 flex-shrink-0" />
        </div>
      </motion.div>
    </div>
  );
};

export default OrgBilling;
