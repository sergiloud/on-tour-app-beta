import React from 'react';
import { motion } from 'framer-motion';
import { Users, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrg } from '../../context/OrgContext';
import { startViewAs } from '../../lib/tenants';
import { t } from '../../lib/i18n';

const OrgClients: React.FC = () => {
  const { org, links } = useOrg();
  const navigate = useNavigate();

  if (!org || org.type !== 'agency') {
    return (
      <div className="px-4 sm:px-6 flex items-center justify-center py-12">
        <p className="text-xs opacity-70">{t('org.clients.title') || 'Clients'}</p>
      </div>
    );
  }

  const clientLinks = links.filter(l => l.agencyOrgId === org.id);

  return (
    <div className="px-4 sm:px-6 flex flex-col gap-4 lg:gap-5 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md hover:shadow-accent-500/5">
        <div className="relative px-6 pt-5 pb-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {t('org.clients.title') || 'Clients'}
                </h1>
                <p className="text-xs text-slate-400 dark:text-white/60 mt-1">Manage your connected artists and agencies</p>
              </div>
            </div>

            <motion.button
              onClick={() => navigate('/dashboard/org/links')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all"
            >
              <Users className="w-4 h-4" />
              Manage Links
            </motion.button>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      {clientLinks.length === 0 ? (
        <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm transition-all duration-300 p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm text-slate-500 dark:text-white/70 mb-1">No connected clients yet</p>
          <p className="text-xs text-slate-300 dark:text-white/50 mb-4">Invite artists or connect agencies to get started</p>
          <motion.button
            onClick={() => navigate('/dashboard/org/links')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all inline-flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Connect First Client
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {clientLinks.map((link, idx) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-accent-500" />
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-medium text-slate-500 dark:text-white/70 uppercase tracking-wider">
                  {link.status}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Artist Link</h3>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-slate-300 dark:text-white/40" />
                  <span className="text-xs text-slate-400 dark:text-white/60">
                    Status: <span className="text-slate-900 dark:text-white font-medium">{link.status}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-slate-300 dark:text-white/40" />
                  <span className="text-xs text-slate-400 dark:text-white/60">
                    Finance: <span className="text-slate-900 dark:text-white font-medium">{link.scopes.finance}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/dashboard/clients/${link.artistOrgId}`)}
                  className="px-3 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-xs transition-all flex items-center justify-center gap-1"
                >
                  <Users className="w-3 h-3" />
                  Open Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/org/links')}
                  className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-500 dark:text-white/70 font-medium text-xs transition-all flex items-center justify-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  Edit Scopes
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Manage Links CTA */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => navigate('/dashboard/org/links')}
        className="relative overflow-hidden rounded-lg border border-accent-500/25 bg-gradient-to-br from-accent-500/8 via-transparent to-transparent backdrop-blur-sm hover:border-accent-500/40 hover:shadow-md hover:shadow-accent-500/10 transition-all cursor-pointer p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Manage All Connections</h3>
            <p className="text-xs text-slate-400 dark:text-white/60">View and edit scopes for all connected clients</p>
          </div>
          <ArrowRight className="w-5 h-5 text-accent-500 flex-shrink-0" />
        </div>
      </motion.div>
    </div>
  );
};

export default OrgClients;
