import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';
import { trackEvent } from '../../lib/telemetry';

const OrgMembers: React.FC = () => {
  const { members, org } = useOrg();
  if (!org) return null;
  const isAgency = org.type === 'agency';

  useEffect(() => {
    try {
      trackEvent('org.section.view', { section: 'members' });
    } catch {}
  }, []);

  const handleInvite = () => {
    try {
      navigator.clipboard.writeText(window.location.origin + '/invite/demo');
    } catch {}
  };

  return (
    <motion.div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-4 pb-8" layoutId="org-members">
      {/* Header */}
      <div className="glass rounded-lg border border-white/10 p-3 md:p-4 bg-gradient-to-r from-white/6 to-white/3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
            <div>
              <h1 className="text-sm md:text-base font-semibold tracking-tight text-white/90">
                {t('org.members.title') || 'Members'}
              </h1>
              {isAgency && (
                <p className="text-xs text-white/60 mt-1">
                  {t('members.seats.usage') || 'Seat usage: 5/5 internal, 0/5 guests'}
                </p>
              )}
            </div>
          </div>

          <motion.button
            onClick={handleInvite}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 border border-accent-500/30 hover:border-accent-500/50 hover:from-accent-500/35 hover:via-accent-500/25 hover:to-accent-600/20 text-accent-200 font-semibold text-xs transition-all duration-300 shadow-lg shadow-accent-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('members.invite') || 'Invite'}
          </motion.button>
        </div>
      </div>

      {/* Members List */}
      <div className="glass rounded-lg border border-white/10 p-3 md:p-4 bg-gradient-to-r from-white/6 to-white/3">
        {members.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm text-white/70 mb-1">No members yet</p>
            <p className="text-xs text-white/60">Start by inviting team members</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {members.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="px-3 md:px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors duration-300"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/90">{member.user.name}</p>
                </div>
                <span className="px-2.5 py-1.5 rounded-lg bg-accent-500/15 border border-accent-500/20 hover:border-accent-500/40 text-xs font-semibold text-accent-200 transition-colors">
                  {member.role}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Copy Link Button (Mobile) */}
      <motion.button
        onClick={handleInvite}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="sm:hidden px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 border border-accent-500/30 hover:border-accent-500/50 text-accent-200 font-semibold text-xs transition-all w-full shadow-lg shadow-accent-500/10"
      >
        Copy Invite Link
      </motion.button>
    </motion.div>
  );
};

export default OrgMembers;
