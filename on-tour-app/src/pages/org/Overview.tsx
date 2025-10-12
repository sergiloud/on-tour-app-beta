import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { useFilteredShows } from '../../features/shows/selectors';
import { buildFinanceSnapshot } from '../../features/finance/snapshot';
import { selectThisMonth } from '../../features/finance/selectors';
import { useSettings } from '../../context/SettingsContext';
import { useUserBehavior } from '../../hooks/useUserBehavior';
import PageHeader from '../../components/common/PageHeader';
import { Events, trackEvent } from '../../lib/telemetry';
import { showStore } from '../../shared/showStore';
import { getRecentActivity, type ActivityItem } from '../../lib/demoActivity';

const PriorityAction: React.FC<{
  icon: string;
  title: string;
  description: string;
  action: { label: string; to?: string; onClick?: () => void };
  urgent?: boolean;
}> = ({ icon, title, description, action, urgent }) => (
  <div className={`glass rounded-lg border p-5 transition-all duration-200 hover:scale-[1.02] ${urgent
      ? 'border-red-400/40 bg-red-500/10 shadow-lg shadow-red-500/10 animate-pulse'
      : 'border-white/20 bg-white/5 hover:bg-white/10'
    }`}>
    <div className="flex items-start gap-4">
      <div className={`text-3xl ${urgent ? 'animate-bounce' : ''}`} aria-hidden>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className={`font-semibold text-sm ${urgent ? 'text-red-300' : 'text-white'}`}>{title}</div>
          {urgent && (
            <div className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full font-medium border border-red-500/30">
              Urgente
            </div>
          )}
        </div>
        <div className="text-xs opacity-80 leading-relaxed mb-4">{description}</div>
        <div>
          {action.to ? (
            <Link
              to={action.to}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${urgent
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                  : 'btn-ghost'
                }`}
            >
              {action.label}
              <span aria-hidden>→</span>
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${urgent
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                  : 'btn-ghost'
                }`}
            >
              {action.label}
              <span aria-hidden>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => (
  <div className="glass rounded border border-white/10 p-4">
    <div className="text-sm font-medium mb-3">{t('overview.changesSince') || 'Changes since your last visit'}</div>
    {activities.length === 0 ? (
      <div className="text-xs opacity-70 text-center py-4">
        <div className="text-lg mb-2" aria-hidden>✓</div>
        {t('overview.noChanges') || 'No recent changes'}
      </div>
    ) : (
      <ul className="space-y-3" role="list">
        {activities.map((activity, i) => (
          <li key={i} role="listitem" className="flex items-start gap-3">
            <div className="text-lg" aria-hidden>{activity.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm">{activity.title}</div>
              <div className="text-xs opacity-70">{activity.description}</div>
              <div className="text-xs opacity-50 mt-1">{activity.timestamp}</div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const RecentlyViewed: React.FC<{ items: Array<{ id: string; title: string; subtitle: string; to: string; type: string }> }> = ({ items }) => (
  <div className="glass rounded border border-white/10 p-4">
    <div className="text-sm font-medium mb-3">{t('overview.recentlyViewed') || 'Recently viewed'}</div>
    {items.length === 0 ? (
      <div className="text-xs opacity-70 text-center py-4">
        <div className="text-lg mb-2" aria-hidden>🕘</div>
        {t('overview.noRecent') || 'No recent items'}
      </div>
    ) : (
      <ul className="space-y-2" role="list">
        {items.map((item, i) => (
          <li key={i} role="listitem">
            <Link to={item.to} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs" aria-hidden>
                {item.type === 'show' ? '🎵' : item.type === 'artist' ? '👤' : '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.title}</div>
                <div className="text-xs opacity-70 truncate">{item.subtitle}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const Overview: React.FC = () => {
  const { profile } = useAuth();
  const { org } = useOrg();
  const { trackPageVisit, personalizedAccess } = useUserBehavior();
  const navigate = useNavigate();
  const { shows } = useFilteredShows();
  const { fmtMoney } = useSettings();

  // Track last visit for activity feed
  const [lastVisit, setLastVisit] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(`demo:overview:lastVisit:${profile.id}`) || 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    // Track page visit for personalization
    trackPageVisit('overview');

    // Update last visit timestamp on unmount
    return () => {
      try {
        localStorage.setItem(`demo:overview:lastVisit:${profile.id}`, String(Date.now()));
      } catch { }
    };
  }, [profile.id, trackPageVisit]);

  // Get recent activities since last visit
  const recentActivities = useMemo(() => {
    return getRecentActivity(lastVisit);
  }, [lastVisit]);

  // Calculate real KPIs
  const financeSnapshot = useMemo(() => buildFinanceSnapshot(), []);
  const thisMonth = useMemo(() => selectThisMonth(financeSnapshot), [financeSnapshot]);

  // Calculate this year net
  const thisYearNet = useMemo(() => {
    const thisYear = new Date().getFullYear();
    let net = 0;
    (shows as any[]).forEach((show: any) => {
      const showYear = new Date(show.date).getFullYear();
      if (showYear === thisYear && (show.status === 'confirmed' || show.status === 'completed')) {
        net += show.net || 0;
      }
    });
    return net;
  }, [shows]);

  // Check if user is new (no data)
  const isNewUser = useMemo(() => {
    return (shows as any[]).length === 0 && thisYearNet === 0 && thisMonth.net === 0;
  }, [shows, thisYearNet, thisMonth.net]);

  // Calculate trends and comparisons
  const trends = useMemo(() => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Calculate last month net (simplified)
    let lastMonthNet = 0;
    (shows as any[]).forEach((show: any) => {
      const showDate = new Date(show.date);
      if (showDate.getMonth() === lastMonth.getMonth() &&
        showDate.getFullYear() === lastMonth.getFullYear() &&
        (show.status === 'confirmed' || show.status === 'completed')) {
        lastMonthNet += show.net || 0;
      }
    });

    const monthChange = thisMonth.net - lastMonthNet;
    const monthChangePercent = lastMonthNet !== 0 ? (monthChange / Math.abs(lastMonthNet)) * 100 : 0;

    // Calculate this year net (simplified)
    const thisYear = new Date().getFullYear();
    let thisYearNet = 0;
    (shows as any[]).forEach((show: any) => {
      const showYear = new Date(show.date).getFullYear();
      if (showYear === thisYear && (show.status === 'confirmed' || show.status === 'completed')) {
        thisYearNet += show.net || 0;
      }
    });

    // Year-over-year comparison (simplified)
    const lastYear = thisYear - 1;
    let lastYearNet = 0;
    (shows as any[]).forEach((show: any) => {
      const showYear = new Date(show.date).getFullYear();
      if (showYear === lastYear && (show.status === 'confirmed' || show.status === 'completed')) {
        lastYearNet += show.net || 0;
      }
    });

    const yearChange = thisYearNet - lastYearNet;
    const yearChangePercent = lastYearNet !== 0 ? (yearChange / Math.abs(lastYearNet)) * 100 : 0;

    return {
      monthNet: { change: monthChange, percent: monthChangePercent },
      yearNet: { change: yearChange, percent: yearChangePercent }
    };
  }, [shows, thisMonth.net, thisYearNet]);

  // Get upcoming shows (next 14 days)
  const upcomingShows = useMemo(() => {
    const now = new Date();
    const in14Days = new Date();
    in14Days.setDate(now.getDate() + 14);

    return (shows as any[])
      .filter((show: any) => {
        const showDate = new Date(show.date);
        return showDate >= now && showDate <= in14Days && (show.status === 'confirmed' || show.status === 'pending');
      })
      .slice(0, 5);
  }, [shows]);

  // Get recently viewed items (mock data for now)
  const recentlyViewed = useMemo(() => {
    if (!org) return [];

    // Mock recent items - in real app this would come from user activity tracking
    if (org.type === 'agency') {
      return [
        { id: '1', title: 'Danny Avila', subtitle: 'Artist profile', to: '/dashboard/clients/danny-avila', type: 'artist' },
        { id: '2', title: 'Berlin Show Report', subtitle: 'Finance report', to: '/dashboard/finance', type: 'report' },
        { id: '3', title: 'Tour Contract', subtitle: 'Legal document', to: '/dashboard/org/documents', type: 'document' },
      ];
    } else {
      return [
        { id: '1', title: 'Berlin Arena Show', subtitle: 'Dec 15, 2024', to: '/dashboard/shows/berlin-arena', type: 'show' },
        { id: '2', title: 'Monthly Finance', subtitle: 'November summary', to: '/dashboard/finance', type: 'report' },
        { id: '3', title: 'Travel Itinerary', subtitle: 'Europe tour', to: '/dashboard/travel', type: 'document' },
      ];
    }
  }, [org]);

  // Priority actions based on current state
  const priorityActions = useMemo(() => {
    if (!org) return [];

    const actions = [];

    // Check for pending shows that need confirmation
    const pendingShows = (shows as any[]).filter((show: any) => show.status === 'pending');
    if (pendingShows.length > 0) {
      actions.push({
        icon: '⏰',
        title: t('overview.action.confirmShows') || '⚡ Action needed: Confirm your pending shows',
        description: `${pendingShows.length} show${pendingShows.length > 1 ? 's' : ''} waiting for your confirmation - don't let opportunities slip away`,
        action: { label: t('overview.action.viewShows') || 'Confirm now', to: '/dashboard/shows' },
        urgent: pendingShows.length > 2
      });
    }

    // Check for upcoming shows without travel booked
    const upcomingWithoutTravel = upcomingShows.filter((show: any) => !show.travelBooked);
    if (upcomingWithoutTravel.length > 0) {
      actions.push({
        icon: '✈️',
        title: t('overview.action.bookTravel') || '🚨 Travel alert: Book flights now',
        description: `${upcomingWithoutTravel.length} upcoming show${upcomingWithoutTravel.length > 1 ? 's' : ''} still need travel arrangements - time is running out`,
        action: { label: t('overview.action.viewTravel') || 'Book travel', to: '/dashboard/travel' }
      });
    }

    // Check for finance alerts (negative net for recent shows)
    const recentShows = (shows as any[]).slice(0, 5);
    const showsWithLosses = recentShows.filter((show: any) => show.net && show.net < 0);
    if (showsWithLosses.length > 0) {
      actions.push({
        icon: '⚠️',
        title: t('overview.action.reviewFinance') || '💰 Critical: Financial losses detected',
        description: `${showsWithLosses.length} recent show${showsWithLosses.length > 1 ? 's' : ''} showing losses - review and optimize pricing`,
        action: { label: t('overview.action.viewFinance') || 'Fix finances', to: '/dashboard/finance' },
        urgent: true
      });
    }

    // Default actions if nothing urgent
    if (actions.length === 0) {
      if (org.type === 'agency') {
        actions.push({
          icon: '📊',
          title: t('overview.action.viewReports') || '📈 Ready for insights? Check performance reports',
          description: t('overview.action.reportsDesc') || 'Discover trending artists and revenue opportunities waiting for you',
          action: { label: t('overview.action.viewReports') || 'Explore reports', to: '/dashboard/org/reports' }
        });
      } else {
        actions.push({
          icon: '📅',
          title: t('overview.action.checkCalendar') || '🎯 Optimize your schedule',
          description: t('overview.action.calendarDesc') || 'Fine-tune your tour calendar and ensure smooth logistics',
          action: { label: t('overview.action.viewCalendar') || 'Review calendar', to: '/dashboard/calendar' }
        });
      }
    }

    return actions.slice(0, 3); // Max 3 priority actions
  }, [org, shows, upcomingShows]);

  if (!org) return null;

  const isAgency = org.type === 'agency';
  const title = t('overview.title') || 'Overview';
  const subtitle = isAgency
    ? (t('overview.subtitle.agency') || 'Monitor your artists and team performance')
    : (t('overview.subtitle.artist') || 'Track your tour progress and finances');

  useEffect(() => {
    try {
      trackEvent('overview.view', { orgType: org.type });
    } catch { }
  }, [org.type]);

  // If new user with no data, show onboarding instead of empty dashboard
  if (isNewUser) {
    return <NewUserOnboarding org={org} isAgency={isAgency} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <PageHeader title={title} subtitle={subtitle} />

      {/* Priority Actions - Bandeja de Entrada Inteligente */}
      <div className="bg-gradient-to-r from-accent-500/10 to-accent-600/5 rounded-xl border border-accent-500/20 p-6 mb-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center">
            <span className="text-2xl" aria-hidden>🎯</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{t('overview.attentionHub') || 'Para tu Atención'}</h2>
            <p className="text-sm opacity-80 mt-1">{t('overview.attentionDesc') || 'Acciones críticas que requieren tu atención inmediata'}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${priorityActions.some(a => a.urgent)
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-accent-500/20 text-accent-300'
              }`}>
              {priorityActions.length} acción{priorityActions.length > 1 ? 'es' : ''} pendiente{priorityActions.length > 1 ? 's' : ''}
            </div>
            {priorityActions.some(a => a.urgent) && (
              <div className="text-xs text-red-400 font-medium animate-pulse">
                ⚡ Acción{priorityActions.filter(a => a.urgent).length > 1 ? 'es' : ''} urgente{priorityActions.filter(a => a.urgent).length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorityActions.map((action, i) => (
            <PriorityAction key={i} {...action} />
          ))}
        </div>
      </div>

      {/* Key Metrics Row with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-4 rounded border border-white/10">
          <div className="text-xs opacity-70 uppercase tracking-wide">
            {isAgency ? (t('kpi.artists') || 'Artists') : (t('kpi.shows') || 'Shows')}
          </div>
          <div className="text-2xl font-bold mt-1">
            {isAgency ? '1' : upcomingShows.length}
          </div>
          <div className="text-xs opacity-60 mt-1">
            {isAgency ? (t('kpi.managed') || 'managed') : (t('kpi.upcoming') || 'upcoming')}
          </div>
        </div>

        <div className="glass p-4 rounded border border-white/10">
          <div className="text-xs opacity-70 uppercase tracking-wide">
            {t('kpi.net') || 'Net Revenue'}
          </div>
          <div className="text-2xl font-bold mt-1">
            {fmtMoney ? fmtMoney(thisMonth.net) : `€${thisMonth.net.toLocaleString()}`}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="text-xs opacity-60">
              {t('kpi.thisMonth') || 'this month'}
            </div>
            {trends.monthNet.change !== 0 && (
              <div className={`flex items-center gap-1 text-xs ${trends.monthNet.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trends.monthNet.change > 0 ? '↗' : '↘'}
                {Math.abs(trends.monthNet.percent).toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        <div className="glass p-4 rounded border border-white/10">
          <div className="text-xs opacity-70 uppercase tracking-wide">
            {t('kpi.yearTotal') || 'Year Total'}
          </div>
          <div className="text-2xl font-bold mt-1">
            {fmtMoney ? fmtMoney(thisYearNet) : `€${thisYearNet.toLocaleString()}`}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="text-xs opacity-60">
              {t('kpi.netIncome') || 'net income'}
            </div>
            {trends.yearNet.change !== 0 && (
              <div className={`flex items-center gap-1 text-xs ${trends.yearNet.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trends.yearNet.change > 0 ? '↗' : '↘'}
                {Math.abs(trends.yearNet.percent).toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        <div className="glass p-4 rounded border border-white/10">
          <div className="text-xs opacity-70 uppercase tracking-wide">
            {t('kpi.documents') || 'Documents'}
          </div>
          <div className="text-2xl font-bold mt-1">12</div>
          <div className="text-xs opacity-60 mt-1">
            {t('kpi.active') || 'active'}
          </div>
        </div>
      </div>

      {/* Personalized Quick Access */}
      {personalizedAccess.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">🚀 {t('overview.personalizedAccess') || 'Personalized Quick Access'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personalizedAccess.slice(0, 3).map((item, i) => (
              <Link
                key={i}
                to={item.to}
                className="glass p-4 rounded border border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="text-lg mb-2" aria-hidden>{item.icon}</div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs opacity-70">{item.description}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Activity Feed and Recently Viewed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={recentActivities} />
        <RecentlyViewed items={recentlyViewed} />
      </div>

      {/* Quick Access for Agency */}
      {isAgency && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t('overview.quickAccess') || 'Quick Access'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/dashboard/clients/danny-avila"
              className="glass p-4 rounded border border-white/10 hover:bg-white/5 transition-colors"
            >
              <div className="text-lg mb-2" aria-hidden>👤</div>
              <div className="font-medium">Danny Avila</div>
              <div className="text-xs opacity-70">View artist dashboard</div>
            </Link>
            <Link
              to="/dashboard/org/reports"
              className="glass p-4 rounded border border-white/10 hover:bg-white/5 transition-colors"
            >
              <div className="text-lg mb-2" aria-hidden>📊</div>
              <div className="font-medium">Reports</div>
              <div className="text-xs opacity-70">Performance analytics</div>
            </Link>
            <Link
              to="/dashboard/org/teams"
              className="glass p-4 rounded border border-white/10 hover:bg-white/5 transition-colors"
            >
              <div className="text-lg mb-2" aria-hidden>👥</div>
              <div className="font-medium">Team</div>
              <div className="text-xs opacity-70">Manage team members</div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const NewUserOnboarding: React.FC<{ org: any; isAgency: boolean }> = ({ org, isAgency }) => {
  const navigate = useNavigate();

  const onboardingSteps = [
    {
      icon: '🎵',
      title: isAgency ? 'Add your first artist' : 'Create your first show',
      description: isAgency
        ? 'Start by adding artists to your roster and managing their careers'
        : 'Set up your first performance to begin tracking your tour',
      action: {
        label: isAgency ? 'Add Artist' : 'Create Show',
        to: isAgency ? '/dashboard/org/clients' : '/dashboard/shows'
      }
    },
    {
      icon: '📅',
      title: 'Set up your calendar',
      description: 'Organize your schedule and never miss important dates',
      action: {
        label: 'Open Calendar',
        to: '/dashboard/calendar'
      }
    },
    {
      icon: '💰',
      title: 'Configure finances',
      description: 'Set up your pricing, expenses, and financial tracking',
      action: {
        label: 'Finance Setup',
        to: '/dashboard/finance'
      }
    },
    {
      icon: '✈️',
      title: 'Plan travel logistics',
      description: 'Manage flights, hotels, and transportation for your tour',
      action: {
        label: 'Travel Planning',
        to: '/dashboard/travel'
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="text-center space-y-4">
        <div className="text-4xl sm:text-5xl md:text-6xl mb-4" aria-hidden>🎯</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {t('onboarding.welcome') || 'Welcome to On Tour!'}
        </h1>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">
          {t('onboarding.welcomeDesc') ||
            "Let's get you started with a few simple steps to set up your tour management system. We'll guide you through everything you need to know."}
        </p>
      </div>

      {/* Onboarding Steps */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white text-center">
          {t('onboarding.getStarted') || 'Get Started in 4 Easy Steps'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {onboardingSteps.map((step, i) => (
            <div key={i} className="glass p-6 rounded border border-white/10 hover:bg-white/5 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-3xl" aria-hidden>{step.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm opacity-70 mb-4">{step.description}</p>
                  <Link
                    to={step.action.to}
                    className="btn-primary text-sm"
                  >
                    {step.action.label}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="glass p-6 rounded border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          💡 {t('onboarding.quickTips') || 'Quick Tips'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-white">{t('onboarding.tip1Title') || 'Track Everything'}</strong>
            <p className="opacity-70 mt-1">
              {t('onboarding.tip1Desc') || 'Keep all your shows, finances, and travel in one place for better insights.'}
            </p>
          </div>
          <div>
            <strong className="text-white">{t('onboarding.tip2Title') || 'Stay Organized'}</strong>
            <p className="opacity-70 mt-1">
              {t('onboarding.tip2Desc') || 'Use the calendar to plan ahead and avoid scheduling conflicts.'}
            </p>
          </div>
          <div>
            <strong className="text-white">{t('onboarding.tip3Title') || 'Monitor Performance'}</strong>
            <p className="opacity-70 mt-1">
              {t('onboarding.tip3Desc') || 'Review your financial reports regularly to optimize profitability.'}
            </p>
          </div>
          <div>
            <strong className="text-white">{t('onboarding.tip4Title') || 'Automate Travel'}</strong>
            <p className="opacity-70 mt-1">
              {t('onboarding.tip4Desc') || 'Let the system help you find the best travel options and deals.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
