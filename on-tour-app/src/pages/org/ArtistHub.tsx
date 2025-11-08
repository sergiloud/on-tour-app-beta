import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, TrendingUp, AlertCircle, Calendar, Users, ChevronRight } from 'lucide-react';
import { t } from '../../lib/i18n';
import { getOrgById, listTeams, listMembers, ORG_AGENCY_SHALIZI, startViewAs } from '../../lib/tenants';
import { useFilteredShows } from '../../features/shows/selectors';
import { useSettings } from '../../context/SettingsContext';

const ArtistHub: React.FC = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { shows } = useFilteredShows();
  const { fmtMoney } = useSettings();

  const org = artistId ? getOrgById(artistId) : undefined;
  const team = listTeams(ORG_AGENCY_SHALIZI).find(t => t.name === (org?.name||''));
  const members = team ? team.members.map(id => listMembers(ORG_AGENCY_SHALIZI).find(m => m.user.id===id)?.user.name || id) : [];

  const artistKpis = useMemo(() => {
    if (!artistId || !shows) return {
      shows: 0, net: 0, travel: 0, pendingCosts: 0, travelAlerts: 0, nextShow: null,
      totalShows: 0, confirmedShows: 0, thisMonthRevenue: 0, ytdRevenue: 0, activeAlerts: 0
    };

    const artistShows = (shows as any[]).filter((show: any) => show.orgId === artistId);
    const confirmedCompleted = artistShows.filter((show: any) =>
      show.status === 'confirmed' || show.status === 'completed'
    );

    const totalNet = confirmedCompleted.reduce((sum, show) => sum + (show.net || 0), 0);
    const totalTravel = confirmedCompleted.reduce((sum, show) => sum + (show.travelCost || 0), 0);

    const pendingCosts = artistShows.reduce((sum, show) => {
      const costs = show.costs || [];
      return sum + costs.filter((cost: any) => !cost.paid).reduce((costSum: number, cost: any) => costSum + (cost.amount || 0), 0);
    }, 0);

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const travelAlerts = artistShows.filter((show: any) => {
      const showDate = new Date(show.date);
      return showDate >= now && showDate <= nextWeek && (show.travelCost || 0) > 0;
    }).length;

    const upcomingShows = artistShows
      .filter((show: any) => new Date(show.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const nextShow = upcomingShows[0] || null;

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthRevenue = confirmedCompleted
      .filter(show => new Date(show.date).getMonth() === thisMonth && new Date(show.date).getFullYear() === thisYear)
      .reduce((sum, show) => sum + (show.net || 0), 0);

    const ytdRevenue = confirmedCompleted
      .filter(show => new Date(show.date).getFullYear() === thisYear)
      .reduce((sum, show) => sum + (show.net || 0), 0);

    const activeAlerts = (pendingCosts > 0 ? 1 : 0) + travelAlerts;

    return {
      shows: confirmedCompleted.length,
      net: totalNet,
      travel: totalTravel,
      pendingCosts,
      travelAlerts,
      nextShow,
      totalShows: artistShows.length,
      confirmedShows: confirmedCompleted.length,
      thisMonthRevenue,
      ytdRevenue,
      activeAlerts
    };
  }, [artistId, shows]);

  const upcomingShows = useMemo(() => {
    if (!artistId || !shows) return [];
    const now = new Date();
    const in14Days = new Date();
    in14Days.setDate(now.getDate() + 14);

    return (shows as any[])
      .filter((show: any) => {
        if (show.orgId !== artistId) return false;
        const showDate = new Date(show.date);
        return showDate >= now && showDate <= in14Days &&
               (show.status === 'confirmed' || show.status === 'tentative');
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [artistId, shows]);

  const navigateAsArtist = (path: string) => {
    if (artistId) {
      try { startViewAs(artistId); } catch {}
    }
    navigate(path);
  };

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
                  {org?.name || 'Artist'}
                </h1>
                <p className="text-xs text-white/60 mt-1">Artist Mission Control Dashboard</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/org/links')}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-medium text-xs transition-all"
              >
                Edit Scopes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateAsArtist('/dashboard?restore=1')}
                className="px-3 py-1.5 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-xs transition-all"
              >
                Open Dashboard
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
        {/* Next Show */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Next Show</p>
            <Calendar className="w-5 h-5 text-blue-400 opacity-50" />
          </div>
          <p className="text-2xl font-bold text-white mb-2">
            {artistKpis.nextShow ? new Date(artistKpis.nextShow.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '—'}
          </p>
          <p className="text-xs text-white/50">
            {artistKpis.nextShow ? `${artistKpis.nextShow.city}, ${artistKpis.nextShow.country}` : 'No upcoming shows'}
          </p>
        </motion.div>

        {/* This Month Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-white/60 font-medium uppercase tracking-wider">This Month</p>
            <TrendingUp className="w-5 h-5 text-green-400 opacity-50" />
          </div>
          <p className="text-2xl font-bold text-white mb-2">{fmtMoney(artistKpis.thisMonthRevenue)}</p>
          <p className="text-xs text-white/50">Revenue</p>
        </motion.div>

        {/* YTD Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-white/60 font-medium uppercase tracking-wider">YTD Revenue</p>
            <Music className="w-5 h-5 text-purple-400 opacity-50" />
          </div>
          <p className="text-2xl font-bold text-white mb-2">{fmtMoney(artistKpis.ytdRevenue)}</p>
          <p className="text-xs text-white/50">Total earnings</p>
        </motion.div>

        {/* Pending Costs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Pending</p>
            <AlertCircle className={`w-5 h-5 opacity-50 ${artistKpis.pendingCosts > 0 ? 'text-amber-400' : 'text-green-400'}`} />
          </div>
          <p className={`text-2xl font-bold mb-2 ${artistKpis.pendingCosts > 0 ? 'text-amber-300' : 'text-white'}`}>
            {fmtMoney(artistKpis.pendingCosts)}
          </p>
          <p className="text-xs text-white/50">
            {artistKpis.pendingCosts > 0 ? 'Action needed' : 'All paid'}
          </p>
        </motion.div>

        {/* Active Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Alerts</p>
            <AlertCircle className={`w-5 h-5 opacity-50 ${artistKpis.activeAlerts > 0 ? 'text-red-400' : 'text-green-400'}`} />
          </div>
          <p className={`text-2xl font-bold mb-2 ${artistKpis.activeAlerts > 0 ? 'text-red-300' : 'text-green-300'}`}>
            {artistKpis.activeAlerts}
          </p>
          <p className="text-xs text-white/50">Need attention</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white px-1">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {[
            { icon: '🎵', label: 'Shows', desc: 'Manage performances', action: () => navigateAsArtist('/dashboard/shows?restore=1') },
            { icon: '💰', label: 'Finance', desc: 'Track revenue', action: () => navigateAsArtist('/dashboard/finance?restore=1') },
            { icon: '📅', label: 'Calendar', desc: 'View schedule', action: () => navigateAsArtist('/dashboard/calendar?restore=1') },
            { icon: '✈️', label: 'Travel', desc: 'Plan logistics', action: () => navigateAsArtist('/dashboard/travel?restore=1') }
          ].map((action, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.05 }}
              whileHover={{ scale: 1.01 }}
              onClick={action.action}
              className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-4 text-left group"
            >
              <p className="text-2xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</p>
              <p className="text-sm font-semibold text-white">{action.label}</p>
              <p className="text-xs text-white/50 mt-0.5">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {/* Show Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Music className="w-4 h-4 text-accent-500" />
            <h3 className="text-sm font-semibold text-white">Show Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70">Confirmed</span>
              <span className="font-semibold text-white">{artistKpis.confirmedShows}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70">Total Shows</span>
              <span className="font-semibold text-white">{artistKpis.totalShows}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
              <span className="text-white/70">Completion</span>
              <span className="font-semibold text-green-400">
                {artistKpis.totalShows > 0 ? Math.round((artistKpis.confirmedShows / artistKpis.totalShows) * 100) : 0}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-semibold text-white">Financial</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70">Avg Fee</span>
              <span className="font-semibold text-white">
                {artistKpis.confirmedShows > 0 ? fmtMoney(artistKpis.net / artistKpis.confirmedShows) : fmtMoney(0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70">Travel Costs</span>
              <span className="font-semibold text-white">{fmtMoney(artistKpis.travel)}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
              <span className="text-white/70">Profit Margin</span>
              <span className="font-semibold text-green-400">
                {artistKpis.net > 0 ? Math.round(((artistKpis.net - artistKpis.travel) / artistKpis.net) * 100) : 0}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-white">Activity</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/70">Last show completed</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-white/70">Next booking confirmed</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${artistKpis.pendingCosts > 0 ? 'bg-amber-400' : 'bg-green-400'}`} />
              <span className="text-white/70">
                {artistKpis.pendingCosts > 0 ? 'Pending payments' : 'All paid'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Shows & Team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {/* Upcoming Shows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Upcoming 14 Days</h3>
          </div>
          {upcomingShows.length === 0 ? (
            <p className="text-xs text-white/50">No upcoming shows</p>
          ) : (
            <div className="space-y-2">
              {upcomingShows.map((show: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{show.venue || 'TBD'}</p>
                    <p className="text-[11px] text-white/50">{new Date(show.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`ml-2 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ${
                    show.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {show.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Assigned Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Users className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Assigned Team</h3>
          </div>
          {members.length === 0 ? (
            <p className="text-xs text-white/50">No team members assigned</p>
          ) : (
            <div className="space-y-2">
              {members.map((member, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                      {member.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{member}</p>
                      <p className="text-[10px] text-white/50">Account Manager</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-white/30 flex-shrink-0 ml-2" />
                </div>
              ))}
              {members.length > 0 && (
                <p className="text-[11px] text-white/50 pt-2 border-t border-white/10 mt-2">
                  {members.length} member{members.length !== 1 ? 's' : ''} managing this artist
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile Quick Actions */}
      <div className="sm:hidden flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/org/links')}
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/70 font-medium text-xs transition-all"
        >
          Edit Scopes
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateAsArtist('/dashboard?restore=1')}
          className="flex-1 px-3 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-xs transition-all"
        >
          Open Dashboard
        </motion.button>
      </div>
    </div>
  );
};

export default ArtistHub;
