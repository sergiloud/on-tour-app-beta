import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { t } from '../../lib/i18n';

const OrgIntegrations: React.FC = () => {
  const integrations = [
    { name: 'Stripe', description: 'Payment processing and invoicing', status: 'coming-soon' },
    { name: 'Zapier', description: 'Automation and workflow integration', status: 'coming-soon' },
    { name: 'Slack', description: 'Notifications and team updates', status: 'coming-soon' },
  ];

  return (
    <motion.div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-4 pb-8" layoutId="org-integrations">
      {/* Header */}
      <div className="glass rounded-lg border border-slate-200 dark:border-white/10 p-3 md:p-4 bg-gradient-to-r from-slate-100 dark:from-white/6 to-white/3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
          <div>
            <h1 className="text-sm md:text-base font-semibold tracking-tight text-slate-700 dark:text-white/90">
              {t('nav.integrations') || 'Integrations'}
            </h1>
            <p className="text-xs text-slate-400 dark:text-white/60 mt-1">Connect external services and automate workflows</p>
          </div>
        </div>
      </div>

      {/* Available Integrations */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase tracking-wide px-3 md:px-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration, idx) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-lg border border-slate-200 dark:border-white/10 p-3 md:p-4 bg-gradient-to-r from-slate-100 dark:from-white/6 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center flex-shrink-0 border border-accent-500/20">
                  <Zap className="w-4 h-4 text-accent-300" />
                </div>
                <span className="px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-white/15 text-[10px] font-semibold text-slate-400 dark:text-white/60 uppercase tracking-wider">
                  {integration.status === 'coming-soon' ? 'Coming Soon' : 'Active'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-700 dark:text-white/90 mb-1">{integration.name}</h3>
              <p className="text-xs text-slate-500 dark:text-white/70 mb-3">{integration.description}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={integration.status === 'coming-soon'}
                className="w-full px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:bg-white/12 text-slate-700 dark:text-slate-700 dark:text-white/90 font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {integration.status === 'coming-soon' ? 'Coming Soon' : 'Connect'}
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* API Documentation */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="glass rounded-lg border border-accent-500/30 p-3 md:p-4 bg-gradient-to-r from-accent-500/8 to-transparent hover:border-accent-500/40 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-700 dark:text-white/90 mb-1">API Access</h3>
            <p className="text-xs text-slate-500 dark:text-white/70">Build custom integrations with our API</p>
          </div>
          <ArrowRight className="w-5 h-5 text-accent-500 flex-shrink-0" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrgIntegrations;

