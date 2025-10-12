import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { getOrgById, listTeams, listMembers, ORG_AGENCY_SHALIZI, startViewAs } from '../../lib/tenants';
import { useFilteredShows } from '../../features/shows/selectors';
import { buildFinanceSnapshot } from '../../features/finance/snapshot';
import { selectThisMonth } from '../../features/finance/selectors';
import { useSettings } from '../../context/SettingsContext';

const ArtistHub: React.FC = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { shows } = useFilteredShows();
  const { fmtMoney } = useSettings();

  const org = artistId ? getOrgById(artistId) : undefined;
  const team = listTeams(ORG_AGENCY_SHALIZI).find(t => t.name === (org?.name||''));
  const members = team ? team.members.map(id => listMembers(ORG_AGENCY_SHALIZI).find(m => m.user.id===id)?.user.name || id) : [];

  // Calculate comprehensive KPIs for this artist
  const artistKpis = useMemo(() => {
    if (!artistId || !shows) return { 
      shows: 0, 
      net: 0, 
      travel: 0, 
      pendingCosts: 0, 
      travelAlerts: 0, 
      nextShow: null,
      totalShows: 0,
      confirmedShows: 0,
      thisMonthRevenue: 0,
      ytdRevenue: 0,
      activeAlerts: 0
    };

    const artistShows = (shows as any[]).filter((show: any) => show.orgId === artistId);
    const confirmedCompleted = artistShows.filter((show: any) =>
      show.status === 'confirmed' || show.status === 'completed'
    );

    const totalNet = confirmedCompleted.reduce((sum, show) => sum + (show.net || 0), 0);
    const totalTravel = confirmedCompleted.reduce((sum, show) => sum + (show.travelCost || 0), 0);

    // Calculate pending costs (unpaid expenses)
    const pendingCosts = artistShows.reduce((sum, show) => {
      const costs = show.costs || [];
      return sum + costs.filter((cost: any) => !cost.paid).reduce((costSum: number, cost: any) => costSum + (cost.amount || 0), 0);
    }, 0);

    // Count travel alerts (shows with travel in next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const travelAlerts = artistShows.filter((show: any) => {
      const showDate = new Date(show.date);
      return showDate >= now && showDate <= nextWeek && (show.travelCost || 0) > 0;
    }).length;

    // Find next upcoming show
    const upcomingShows = artistShows
      .filter((show: any) => new Date(show.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const nextShow = upcomingShows[0] || null;

    // Additional KPIs
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthRevenue = confirmedCompleted
      .filter(show => new Date(show.date).getMonth() === thisMonth && new Date(show.date).getFullYear() === thisYear)
      .reduce((sum, show) => sum + (show.net || 0), 0);

    const ytdRevenue = confirmedCompleted
      .filter(show => new Date(show.date).getFullYear() === thisYear)
      .reduce((sum, show) => sum + (show.net || 0), 0);

    // Count active alerts (pending costs + travel alerts + overdue tasks)
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

  // Get upcoming shows (next 14 days)
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
      .slice(0, 3); // Show next 3 upcoming
  }, [artistId, shows]);
  return (
    <div className="space-y-6 p-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{org?.name || 'Artist'}</h2>
          <p className="text-sm opacity-70">Mission Control Dashboard</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-ghost text-xs"
            onClick={() => navigate('/dashboard/org/links')}
          >
            {t('actions.editScopes') || 'Edit scopes'}
          </button>
          <button
            className="btn-ghost text-xs"
            onClick={() => {
              if (artistId) {
                try { startViewAs(artistId); } catch {}
              }
              navigate('/dashboard?restore=1');
            }}
          >
            {t('welcome.openArtistDashboard')?.replace('{artist}', org?.name || 'Artist') || 'Open artist dashboard'}
          </button>
        </div>
      </div>

      {/* Mission Control KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-xs opacity-70 mb-3">{t('kpi.nextShow') || 'Next Show'}</div>
          <div className="text-lg font-bold">
            {artistKpis.nextShow ? new Date(artistKpis.nextShow.date).toLocaleDateString() : '—'}
          </div>
          <div className="text-xs opacity-60 mt-1">
            {artistKpis.nextShow ? `${artistKpis.nextShow.city}, ${artistKpis.nextShow.country}` : 'No upcoming shows'}
          </div>
        </div>
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-xs opacity-70 mb-3">{t('kpi.monthRevenue') || 'This Month'}</div>
          <div className="text-2xl font-bold">{fmtMoney(artistKpis.thisMonthRevenue)}</div>
          <div className="text-xs opacity-60 mt-1">
            {t('kpi.revenue') || 'Revenue'}
          </div>
        </div>
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-xs opacity-70 mb-3">{t('kpi.ytdRevenue') || 'YTD Revenue'}</div>
          <div className="text-2xl font-bold">{fmtMoney(artistKpis.ytdRevenue)}</div>
          <div className="text-xs opacity-60 mt-1">
            {t('kpi.total') || 'Total earnings'}
          </div>
        </div>
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-xs opacity-70 mb-3">{t('kpi.pendingCosts') || 'Pending Costs'}</div>
          <div className={`text-2xl font-bold ${artistKpis.pendingCosts > 0 ? 'text-amber-400' : ''}`}>
            {fmtMoney(artistKpis.pendingCosts)}
          </div>
          <div className="text-xs opacity-60 mt-1">
            {artistKpis.pendingCosts > 0 ? 'Requires attention' : 'All paid'}
          </div>
        </div>
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-xs opacity-70 mb-3">{t('kpi.activeAlerts') || 'Active Alerts'}</div>
          <div className={`text-2xl font-bold ${artistKpis.activeAlerts > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {artistKpis.activeAlerts}
          </div>
          <div className="text-xs opacity-60 mt-1">
            {t('kpi.needsAttention') || 'Needs attention'}
          </div>
        </div>
      </div>

      {/* Mission Control Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold opacity-70">{t('overview.missionControl') || 'Mission Control'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              if (artistId) {
                try { startViewAs(artistId); } catch {}
              }
              navigate('/dashboard/shows?restore=1');
            }}
            className="glass p-6 rounded-lg border border-white/10 hover:bg-white/5 transition-all hover:scale-105 text-left group"
          >
            <div className="text-2xl mb-3 group-hover:scale-110 transition-transform" aria-hidden>🎵</div>
            <div className="font-semibold text-base mb-1">{t('nav.shows') || 'Shows'}</div>
            <div className="text-sm opacity-70">Manage performances & schedule</div>
          </button>
          <button
            onClick={() => {
              if (artistId) {
                try { startViewAs(artistId); } catch {}
              }
              navigate('/dashboard/finance?restore=1');
            }}
            className="glass p-6 rounded-lg border border-white/10 hover:bg-white/5 transition-all hover:scale-105 text-left group"
          >
            <div className="text-2xl mb-3 group-hover:scale-110 transition-transform" aria-hidden>💰</div>
            <div className="font-semibold text-base mb-1">{t('nav.finance') || 'Finance'}</div>
            <div className="text-sm opacity-70">Track revenue & expenses</div>
          </button>
          <button
            onClick={() => {
              if (artistId) {
                try { startViewAs(artistId); } catch {}
              }
              navigate('/dashboard/calendar?restore=1');
            }}
            className="glass p-6 rounded-lg border border-white/10 hover:bg-white/5 transition-all hover:scale-105 text-left group"
          >
            <div className="text-2xl mb-3 group-hover:scale-110 transition-transform" aria-hidden>📅</div>
            <div className="font-semibold text-base mb-1">{t('nav.calendar') || 'Calendar'}</div>
            <div className="text-sm opacity-70">View schedule & plan ahead</div>
          </button>
          <button
            onClick={() => {
              if (artistId) {
                try { startViewAs(artistId); } catch {}
              }
              navigate('/dashboard/travel?restore=1');
            }}
            className="glass p-6 rounded-lg border border-white/10 hover:bg-white/5 transition-all hover:scale-105 text-left group"
          >
            <div className="text-2xl mb-3 group-hover:scale-110 transition-transform" aria-hidden>✈️</div>
            <div className="font-semibold text-base mb-1">{t('nav.travel') || 'Travel'}</div>
            <div className="text-sm opacity-70">Plan logistics & itineraries</div>
          </button>
        </div>
      </div>

      {/* Quick Stats & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-sm font-medium mb-3">{t('stats.showStatus') || 'Show Status'}</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="opacity-70">{t('status.confirmed') || 'Confirmed'}</span>
              <span className="font-medium">{artistKpis.confirmedShows}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-70">{t('status.total') || 'Total Shows'}</span>
              <span className="font-medium">{artistKpis.totalShows}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-70">{t('stats.completion') || 'Completion Rate'}</span>
              <span className="font-medium">
                {artistKpis.totalShows > 0 ? Math.round((artistKpis.confirmedShows / artistKpis.totalShows) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="glass rounded border border-white/10 p-4">
          <div className="text-sm font-medium mb-3">{t('stats.financial') || 'Financial Overview'}</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="opacity-70">{t('stats.avgFee') || 'Avg Fee'}</span>
              <span className="font-medium">
                {artistKpis.confirmedShows > 0 ? fmtMoney(artistKpis.net / artistKpis.confirmedShows) : fmtMoney(0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-70">{t('stats.travelCost') || 'Travel Costs'}</span>
              <span className="font-medium">{fmtMoney(artistKpis.travel)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-70">{t('stats.profitMargin') || 'Profit Margin'}</span>
              <span className="font-medium text-green-400">
                {artistKpis.net > 0 ? Math.round(((artistKpis.net - artistKpis.travel) / artistKpis.net) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="glass rounded border border-white/10 p-4">
          <div className="text-sm font-medium mb-3">{t('stats.recentActivity') || 'Recent Activity'}</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="opacity-70">{t('activity.lastShow') || 'Last show completed'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="opacity-70">{t('activity.nextBooking') || 'Next booking confirmed'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${artistKpis.pendingCosts > 0 ? 'bg-amber-400' : 'bg-green-400'}`}></div>
              <span className="opacity-70">
                {artistKpis.pendingCosts > 0 ? 'Pending payments' : 'All payments up to date'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-sm font-medium mb-3">{t('welcome.upcoming.14d') || 'Upcoming 14 days'}</div>
          {upcomingShows.length === 0 ? (
            <div className="text-xs opacity-70">No upcoming shows</div>
          ) : (
            <div className="space-y-2">
              {upcomingShows.map((show: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium">{show.venue || 'TBD'}</div>
                    <div className="opacity-70">{new Date(show.date).toLocaleDateString()}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    show.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {show.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded border border-white/10 p-4">
          <div className="text-sm font-medium mb-3">{t('team.assigned') || 'Assigned Team'}</div>
          {members.length === 0 ? (
            <div className="text-xs opacity-70">No team members assigned</div>
          ) : (
            <div className="space-y-3">
              {members.map((member, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-xs font-medium">
                      {member.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{member}</div>
                      <div className="text-xs opacity-70">Account Manager</div>
                    </div>
                  </div>
                  <div className="text-xs opacity-60">
                    {i === 0 ? 'Lead' : 'Support'}
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-white/10">
                <div className="text-xs opacity-70">
                  {members.length} team member{members.length !== 1 ? 's' : ''} managing this artist
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistHub;
