import React from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';

interface WelcomeCardProps {
  onGetStarted?: () => void;
  onImportData?: () => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  onGetStarted,
  onImportData
}) => {
  const features = [
    {
      icon: '📊',
      title: t('welcome.feature.financial.title') || 'Financial Overview',
      description: t('welcome.feature.financial.description') || 'Track revenue, expenses, and profitability across all shows'
    },
    {
      icon: '🎭',
      title: t('welcome.feature.shows.title') || 'Show Management',
      description: t('welcome.feature.shows.description') || 'Plan, schedule, and manage your tour dates efficiently'
    },
    {
      icon: '🎯',
      title: t('welcome.feature.missions.title') || 'Mission Control',
      description: t('welcome.feature.missions.description') || 'Stay on top of tasks and objectives with smart prioritization'
    },
    {
      icon: '📈',
      title: t('welcome.feature.analytics.title') || 'Performance Analytics',
      description: t('welcome.feature.analytics.description') || 'Get insights into your tour performance and trends'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto p-8 rounded-2xl border border-slate-300 dark:border-white/20 bg-gradient-to-br from-white/10 to-slate-50 dark:to-white/5 backdrop-blur-sm"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
        >
          <span className="text-4xl">🎪</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="text-3xl font-bold text-slate-900 dark:text-white mb-4"
        >
          {t('welcome.title') || 'Welcome to On Tour App'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto"
        >
          {t('welcome.subtitle') || 'Your intelligent companion for managing tours, tracking finances, and staying organized on the road.'}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            className="p-6 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{feature.icon}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGetStarted}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {t('welcome.getStarted') || 'Get Started'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onImportData}
          className="px-8 py-3 border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-white font-semibold rounded-full transition-all duration-200"
        >
          {t('welcome.importData') || 'Import Existing Data'}
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="text-center mt-8 text-sm text-slate-400"
      >
        {t('welcome.footer') || 'Need help? Check out our documentation or contact support.'}
      </motion.div>
    </motion.div>
  );
};