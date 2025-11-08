import React from 'react';
import { motion } from 'framer-motion';
import { Users, Users2 } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';

const OrgTeams: React.FC = () => {
  const { org, teams } = useOrg();
  if (!org) return null;

  return (
    <motion.div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-4 pb-8" layoutId="org-teams">
      {/* Header */}
      <div className="glass rounded-lg border border-white/10 p-3 md:p-4 bg-gradient-to-r from-white/6 to-white/3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
          <div>
            <h1 className="text-sm md:text-base font-semibold tracking-tight text-white/90">
              {t('org.teams.title') || 'Teams'}
            </h1>
            <p className="text-xs text-white/60 mt-1">Manage your organization teams and members</p>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg border border-white/10 p-8 md:p-12 bg-gradient-to-r from-white/6 to-white/3 text-center"
        >
          <Users2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm text-white/70 mb-1">No teams yet</p>
          <p className="text-xs text-white/60">Teams will help you organize and collaborate with your team</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="glass rounded-lg border border-white/10 p-3 md:p-4 bg-gradient-to-r from-white/6 to-white/3 hover:border-white/20 transition-all"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center border border-accent-500/20">
                      <Users className="w-4 h-4 text-accent-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/90">{team.name}</p>
                      <p className="text-xs text-white/60 mt-0.5">Team ID: {team.id}</p>
                    </div>
                  </div>
                </div>

                {/* Members Count */}
                <div className="flex items-center justify-between p-2.5 md:p-3 bg-white/5 hover:bg-white/8 rounded-lg border border-white/10 transition-colors">
                  <span className="text-xs text-white/70 font-semibold">Team Members</span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-500/20 border border-accent-500/30 text-accent-200 text-xs font-bold">
                    {team.members.length}
                  </span>
                </div>

                {/* Members List */}
                {team.members.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-white/60 font-semibold uppercase tracking-wide">Members:</p>
                    <ul className="space-y-1.5">
                      {team.members.slice(0, 3).map((memberId, memberIdx) => (
                        <li key={memberIdx} className="flex items-center gap-2 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-500/60 flex-shrink-0" />
                          <span className="text-white/80">{memberId}</span>
                        </li>
                      ))}
                      {team.members.length > 3 && (
                        <li className="text-xs text-white/60 pt-1 font-medium">
                          +{team.members.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Footer CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-white/30 hover:bg-white/12 text-white/90 font-semibold text-xs transition-all"
                >
                  Manage Team
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="glass rounded-lg border border-white/10 p-3 md:p-4 bg-gradient-to-r from-white/6 to-white/3 hover:border-white/20 transition-all"
      >
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-accent-300 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white/90 mb-1">Collaborate Effectively</p>
            <p className="text-xs text-white/70 leading-relaxed">
              Teams help you organize members by role or project. Assign team members to shows, events, and coordinate travel logistics.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrgTeams;

