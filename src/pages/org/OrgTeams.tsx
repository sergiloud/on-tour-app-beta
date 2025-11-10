import React from 'react';
import { motion } from 'framer-motion';
import { Users, Users2, Plus } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';
import PageHeader from '../../components/common/PageHeader';
import { OrgEmptyState, OrgSectionHeader } from '../../components/org/OrgModernCards';

const OrgTeams: React.FC = () => {
  const { org, teams } = useOrg();
  if (!org) return null;

  const handleCreateTeam = () => {
    // TODO: Implement team creation modal
  };

  return (
    <motion.div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-6 pb-8" layoutId="org-teams">
      {/* Header */}
      <PageHeader
        title={t('org.teams.title') || 'Teams'}
        subtitle={t('org.teams.subtitle') || 'Organize and manage your team members'}
        actions={
          <motion.button
            onClick={handleCreateTeam}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 border border-accent-500/30 hover:border-accent-500/50 hover:from-accent-500/35 hover:via-accent-500/25 hover:to-accent-600/20 text-accent-200 font-semibold text-xs transition-all duration-300 shadow-lg shadow-accent-500/10"
          >
            <Plus className="w-4 h-4" />
            {t('teams.create') || 'Create Team'}
          </motion.button>
        }
      />

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-8 md:p-12 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3">
          <OrgEmptyState
            icon="👥"
            title={t('empty.noTeams') || 'No teams yet'}
            description={t('empty.noTeams.desc') || 'Create teams to organize your members and streamline collaboration'}
            action={{
              label: t('teams.create') || 'Create Team',
              onClick: handleCreateTeam
            }}
          />
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          initial="hidden"
          animate="visible"
        >
          {teams.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              <div className="space-y-4">
                {/* Header */}
                <OrgSectionHeader
                  title={team.name}
                  icon={
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex items-center justify-center border border-blue-500/20">
                      <Users className="w-4 h-4 text-blue-300" />
                    </div>
                  }
                  action={
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-500/20 border border-accent-500/30 text-accent-200 text-xs font-bold">
                      {team.members.length}
                    </span>
                  }
                />

                {/* Members List */}
                {team.members.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 dark:text-white/60 font-semibold uppercase tracking-wide">Members</p>
                    <ul className="space-y-1.5">
                      {team.members.slice(0, 3).map((memberId, memberIdx) => (
                        <motion.li
                          key={memberIdx}
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-all text-xs"
                        >
                          <div className="w-2 h-2 rounded-full bg-accent-500/60 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-white/80">{memberId}</span>
                        </motion.li>
                      ))}
                      {team.members.length > 3 && (
                        <li className="text-xs text-slate-400 dark:text-white/60 pt-1 font-medium">
                          +{team.members.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-white/60 italic">No members in this team yet</p>
                )}

                {/* Footer CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:bg-white/12 text-slate-700 dark:text-slate-700 dark:text-white/90 font-semibold text-xs transition-all"
                >
                  Manage Team
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrgTeams;

