import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { getLinkAgencyToArtist, getSeatsUsage, listLinks, listMembers, listTeams, ORG_AGENCY_SHALIZI, ORG_ARTIST_DANNY, type Link as DemoLink } from '../../lib/tenants';
import { useFilteredShows } from '../../features/shows/selectors';
import { buildFinanceSnapshot } from '../../features/finance/snapshot';
import { selectThisMonth } from '../../features/finance/selectors';
import { useSettings } from '../../context/SettingsContext';
import PageHeader from '../../components/common/PageHeader';
import { Link } from 'react-router-dom';
import { Events, trackEvent } from '../../lib/telemetry';
import InviteManagerModal from '../welcome/components/InviteManagerModal';
import OrgSwitcher from '../welcome/components/OrgSwitcher';
import { logger } from '../../lib/logger';
import ConnectArtistDrawer from '../welcome/components/ConnectArtistDrawer';
import BrandingModal from '../welcome/components/BrandingModal';
import IntegrationsModal from '../welcome/components/IntegrationsModal';
import ArtistQuickPanel from '../welcome/components/ArtistQuickPanel';
import { useNavigate } from 'react-router-dom';
import { setCurrentOrgId } from '../../lib/tenants';
import { activityTracker, trackPageView, getRecentActivity, type Activity } from '../../lib/activityTracker';

const ScopeChips: React.FC<{ scopes: DemoLink['scopes'] }> = ({ scopes }) => {
  const chip = (label: string, kind: 'ok' | 'warn' | 'info', title?: string) => (
    <span title={title} className={`px-1.5 py-0.5 rounded text-[10px] border ${kind === 'ok' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20' : kind === 'warn' ? 'bg-amber-500/15 text-amber-200 border-amber-400/25' : 'bg-sky-500/15 text-sky-200 border-sky-400/25'}`}>{label}</span>
  );
  return (
    <div className="flex flex-wrap gap-1.5">
      {chip(`${t('scopes.shows') || 'Shows'}: ${scopes.shows}`, scopes.shows === 'write' ? 'ok' : 'info', t('scopes.tooltip.shows') || 'Shows access')}
      {chip(`${t('scopes.travel') || 'Travel'}: ${scopes.travel}`, scopes.travel === 'book' ? 'ok' : 'info', t('scopes.tooltip.travel') || 'Travel access')}
      {chip(`${t('scopes.finance') || 'Finance'}: ${scopes.finance}`, scopes.finance === 'read' ? 'warn' : 'info', t('scopes.tooltip.finance') || 'Finance access')}
    </div>
  );
};

const EmptyState: React.FC<{ icon?: string; title: string; desc?: string; cta?: { label: string; onClick: () => void } }> = ({ icon = '•', title, desc, cta }) => (
  <div className="glass rounded border border-dashed border-white/12 p-4 text-sm text-center">
    <div className="text-2xl mb-1" aria-hidden>{icon}</div>
    <div className="opacity-90">{title}</div>
    {desc && <div className="text-xs opacity-70 mt-1">{desc}</div>}
    {cta && <div className="mt-2"><button className="px-2 py-1 rounded bg-accent-500 text-black text-xs shadow-glow" onClick={cta.onClick}>{cta.label}</button></div>}
  </div>
);

const PeopleList: React.FC<{ title: string; items: Array<{ name: string; role?: string; team?: string }>; action?: { label: string; onClick: (person: { name: string }) => void } }> = ({ title, items, action }) => (
  <div className="glass rounded border border-white/10 p-3">
    <div className="text-xs opacity-70 mb-2">{title}</div>
    {items.length === 0 && <EmptyState icon="👥" title={t('empty.noPeople') || 'No people yet'} desc={t('empty.inviteHint') || 'Invite someone to get started'} cta={action ? { label: action.label, onClick: () => action.onClick({ name: '' }) } : undefined} />}
    <ul className="text-sm space-y-1.5" role="list">
      {items.map((p, i) => (
        <li key={i} role="listitem" className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/10 text-[11px] flex items-center justify-center" aria-hidden>{(p.name || ' ').charAt(0).toUpperCase()}</span>
            <span>{p.name}</span>
          </span>
          <span className="text-[11px] opacity-70 flex items-center gap-2">
            <span>{[p.role, p.team].filter(Boolean).join(' • ')}</span>
            {action && <button className="btn-ghost text-[11px]" onClick={() => action.onClick(p)}>{action.label}</button>}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const SeatsUsageBar: React.FC<{ orgId: string }> = ({ orgId }) => {
  const seats = getSeatsUsage(orgId);
  const pct = Math.min(100, Math.round((seats.internalUsed / seats.internalLimit) * 100));
  return (
    <div className="glass rounded border border-white/10 p-3">
      <div className="text-xs opacity-70 mb-2">{t('welcome.seats.usage') || 'Seats used'}</div>
      <div className="h-2 bg-white/10 rounded overflow-hidden">
        <div className="h-full bg-accent-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[11px] opacity-70 mt-1">{seats.internalUsed}/{seats.internalLimit} internal • {seats.guestUsed}/{seats.guestLimit} guests</div>
    </div>
  );
};

const Checklist: React.FC<{ items: string[]; storageKey: string; done: boolean[]; setDone: React.Dispatch<React.SetStateAction<boolean[]>>; expanded?: boolean; onToggleExpanded?: () => void }> = ({ items, storageKey, done, setDone, expanded = true, onToggleExpanded }) => {
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(done)); } catch { } }, [done, storageKey]);
  const toggle = (i: number) => setDone(prev => {
    const next = prev.map((v, idx) => idx === i ? !v : v);
    const item = items[i];
    const checked = next[i];
    if (item !== undefined && checked !== undefined) {
      try { Events.welcomeChecklistToggle(item, checked); } catch { }
    }
    try {
      if (next.every(Boolean)) {
        Events.welcomeChecklistCompleted(storageKey);
      }
    } catch { }
    return next;
  });
  const completed = done.filter(Boolean).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total;
  return (
    <div className="glass rounded border border-white/10 p-3" data-checklist>
      <div className="text-xs opacity-70 mb-2 flex items-center justify-between">
        <span>{t('welcome.gettingStarted') || 'Getting started'}</span>
        {isComplete && onToggleExpanded && (
          <button
            onClick={onToggleExpanded}
            className="text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            {expanded ? '−' : '+'}
          </button>
        )}
      </div>

      {isComplete && !expanded ? (
        <div className="text-sm opacity-80 flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <span>Setup complete</span>
          {onToggleExpanded && (
            <button
              onClick={onToggleExpanded}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity ml-auto"
            >
              Show details
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Progress indicator */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="opacity-70">
                {isComplete
                  ? t('welcome.progress.complete') || 'Setup complete'
                  : (t('welcome.progress.incomplete') || '{completed}/{total} steps completed').replace('{completed}', String(completed)).replace('{total}', String(total))
                }
              </span>
              <span className="opacity-70">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-accent-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <ul className="text-sm space-y-1.5" role="list">
            {items.map((label, i) => (
              <li key={i} role="listitem" className="flex items-center gap-2">
                <input id={`chk-${i}`} type="checkbox" checked={!!done[i]} onChange={() => toggle(i)} aria-label={label} />
                <label htmlFor={`chk-${i}`} className={`cursor-pointer ${done[i] ? 'opacity-60 line-through' : ''}`}>{label}</label>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

const AssignmentMatrix: React.FC<{ orgId: string }> = ({ orgId }) => {
  // Build mapping Artist -> Team name -> Managers
  const links = listLinks(orgId).filter(l => l.agencyOrgId === orgId);
  const teams = listTeams(orgId);
  const members = listMembers(orgId);
  const rows = links.map(l => {
    const team = teams.find(t => t.name === 'Danny Avila'); // simple demo mapping
    const mgrs = team ? team.members.map(id => members.find(m => m.user.id === id)?.user.name || id) : [];
    return { artist: 'Danny Avila', team: team?.name || '—', managers: mgrs };
  });
  const onRowKey = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const row = e.currentTarget;
    const parent = row.parentElement;
    if (!parent) return;
    const rows = Array.from(parent.querySelectorAll('tr[tabindex="0"]')) as HTMLTableRowElement[];
    const idx = rows.indexOf(row);
    if (idx === -1) return;
    const nextIdx = e.key === 'ArrowDown' ? Math.min(rows.length - 1, idx + 1) : Math.max(0, idx - 1);
    rows[nextIdx]?.focus();
  };
  return (
    <div className="glass rounded border border-white/10 p-3">
      <div className="text-xs opacity-70 mb-2">{t('welcome.section.assignments') || 'Managers per artist'}</div>
      <table className="w-full text-sm" role="grid" aria-label={t('welcome.section.assignments') || 'Managers per artist'}>
        <thead className="text-xs opacity-70">
          <tr>
            <th className="text-left py-1" scope="col">Artist</th>
            <th className="text-left py-1" scope="col">Team</th>
            <th className="text-left py-1" scope="col">Managers</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} tabIndex={0} onKeyDown={onRowKey} className="border-t border-white/10 focus:outline-none focus:ring-1 focus:ring-accent-500/60">
              <td className="py-1">{r.artist}</td>
              <td className="py-1">{r.team}</td>
              <td className="py-1">{r.managers.join(', ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2">
        <button className="btn-ghost text-xs opacity-60 cursor-not-allowed" title={t('welcome.inlineOnly') || 'Manage assignments inline'} onClick={() => { try { Events.welcomeCta('teams'); } catch { } }} aria-disabled>
          {t('welcome.assign') || 'Assign'}
        </button>
      </div>
    </div>
  );
};

const PriorityActionsInbox: React.FC<{ isAgency: boolean; onActionClick: (action: string) => void }> = ({ isAgency, onActionClick }) => {
  // Mock priority actions - in real app, these would come from business logic
  const actions = isAgency ? [
    {
      id: 'contract_expiring',
      priority: 'high',
      title: 'Berlin show contract expires in 3 days',
      description: 'Review and sign the updated contract for Danny\'s Berlin performance',
      action: 'Review contract',
      actionType: 'navigate',
      target: '/shows/berlin-2024/contract'
    },
    {
      id: 'invoice_overdue',
      priority: 'high',
      title: 'Madrid show invoice is 15 days overdue',
      description: 'Send payment reminder to the venue for the completed show',
      action: 'Send reminder',
      actionType: 'modal',
      target: 'communication'
    },
    {
      id: 'flight_alert',
      priority: 'medium',
      title: 'UK tour flights have price drop alert',
      description: 'Flight prices for the UK tour have dropped by 12%. Consider rebooking.',
      action: 'Check flights',
      actionType: 'navigate',
      target: '/travel/uk-tour'
    }
  ] : [
    {
      id: 'contract_pending',
      priority: 'high',
      title: 'Amsterdam show contract needs your review',
      description: 'Your manager has sent the Amsterdam show contract for your approval',
      action: 'Review contract',
      actionType: 'navigate',
      target: '/contracts/amsterdam-2024'
    },
    {
      id: 'payment_due',
      priority: 'medium',
      title: 'Outstanding payment from Berlin show',
      description: 'Payment for the Berlin performance is 7 days overdue from the venue',
      action: 'Follow up',
      actionType: 'modal',
      target: 'communication'
    },
    {
      id: 'calendar_sync',
      priority: 'low',
      title: 'Calendar integration needs attention',
      description: 'Your Google Calendar hasn\'t synced for 2 days. Some events may be missing.',
      action: 'Fix sync',
      actionType: 'navigate',
      target: '/settings/integrations'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 bg-red-500/5';
      case 'medium': return 'border-amber-500/30 bg-amber-500/5';
      case 'low': return 'border-blue-500/30 bg-blue-500/5';
      default: return 'border-white/10 bg-white/5';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  return (
    <div className="glass rounded border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-lg">🎯</div>
        <div>
          <h3 className="text-sm font-medium">For Your Attention</h3>
          <p className="text-xs opacity-70">Critical tasks and decisions requiring your action</p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`rounded border p-3 ${getPriorityColor(action.priority)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm" aria-hidden>{getPriorityIcon(action.priority)}</span>
                  <h4 className="text-sm font-medium">{action.title}</h4>
                </div>
                <p className="text-xs opacity-80 mb-2">{action.description}</p>
              </div>
              <button
                onClick={() => onActionClick(action.id)}
                className="px-3 py-1.5 bg-accent-500 text-black text-xs font-medium rounded hover:brightness-95 transition-all whitespace-nowrap"
              >
                {action.action}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <button
          onClick={() => onActionClick('view_all')}
          className="text-xs opacity-70 hover:opacity-100 transition-opacity"
        >
          View all tasks →
        </button>
      </div>
    </div>
  );
};

const OrgOverview: React.FC = () => {
  const { profile } = useAuth();
  const { orgId, org } = useOrg();
  const navigate = useNavigate();
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [showSwitchOrg, setShowSwitchOrg] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showArtistPanel, setShowArtistPanel] = useState(false);

  if (!org) return null;
  const isAgency = org.type === 'agency';
  const link = getLinkAgencyToArtist();
  const title = (t('welcome.title') || 'Welcome, {name}').replace('{name}', profile.name || '');
  const subtitle = isAgency ? (t('welcome.subtitle.agency') || 'Manage your managers and artists') : (t('welcome.subtitle.artist') || 'All set for your upcoming shows');
  const checklistItems = isAgency
    ? [t('welcome.gettingStarted.invite') || 'Invite a manager', t('welcome.gettingStarted.connect') || 'Connect an artist', t('welcome.gettingStarted.review') || 'Review teams & links']
    : [t('welcome.gettingStarted.branding') || 'Complete branding', t('welcome.gettingStarted.shows') || 'Review shows', t('welcome.gettingStarted.calendar') || 'Connect calendar'];

  const checklistStorageKey = `demo:welcome:steps:${profile.id}`;
  const [checklistDone, setChecklistDone] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem(checklistStorageKey);
      if (raw) return JSON.parse(raw);
      const legacy = localStorage.getItem(checklistStorageKey.replace(':steps:', ':checklist:'));
      return legacy ? JSON.parse(legacy) : checklistItems.map(() => false);
    } catch { return checklistItems.map(() => false); }
  });
  const checklistCompleted = checklistDone.filter(Boolean).length;
  const checklistTotal = checklistItems.length;
  const isChecklistComplete = checklistCompleted === checklistTotal;
  const [checklistExpanded, setChecklistExpanded] = useState(!isChecklistComplete);

  const handlePriorityAction = (actionId: string) => {
    // Handle priority action clicks - in real app, this would navigate or open modals
    logger.debug('Priority action clicked', { component: 'OrgOverview', actionId });
    trackEvent('org.priority_action', { actionId });
    // For demo, just show an alert
    alert(`Action: ${actionId} - This would navigate to the relevant section in a real app`);
  };

  // Track page view activity
  useEffect(() => {
    if (profile.id) {
      trackPageView('org_overview', { orgType: org?.type });
    }
  }, [profile.id, org?.type]);

  const { shows } = useFilteredShows();
  const upcoming = useMemo(() => {
    const now = new Date();
    const in14 = new Date(); in14.setDate(now.getDate() + 14);
    return (shows as any[]).filter(s => {
      const d = new Date(s.date); return d >= now && d <= in14 && (s.status === 'confirmed' || s.status === 'pending');
    }).slice(0, 5);
  }, [shows]);
  const { fmtMoney } = useSettings();
  const monthAgg = useMemo(() => selectThisMonth(buildFinanceSnapshot()), []);

  // Build current and previous month snapshots for KPIs
  const snapshot = useMemo(() => buildFinanceSnapshot(), []);
  const prevSnapshot = useMemo(() => {
    // For demo, create a previous snapshot with ~80% of current values
    return {
      ...snapshot,
      month: {
        ...snapshot.month,
        net: Math.round(snapshot.month.net * 0.8),
        income: Math.round(snapshot.month.income * 0.8),
        expenses: Math.round(snapshot.month.expenses * 0.8)
      },
      year: {
        ...snapshot.year,
        net: Math.round(snapshot.year.net * 0.8),
        income: Math.round(snapshot.year.income * 0.8),
        expenses: Math.round(snapshot.year.expenses * 0.8)
      }
    };
  }, [snapshot]);

  // Calculate show counts for current and previous month
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const currentCount = shows.filter(s => {
      const showMonth = `${new Date(s.date).getFullYear()}-${String(new Date(s.date).getMonth() + 1).padStart(2, '0')}`;
      return showMonth === currentMonth && (s.status === 'confirmed' || s.status === 'pending');
    }).length;

    const prevCount = shows.filter(s => {
      const showMonth = `${new Date(s.date).getFullYear()}-${String(new Date(s.date).getMonth() + 1).padStart(2, '0')}`;
      return showMonth === prevMonth && (s.status === 'confirmed' || s.status === 'pending');
    }).length;

    return { current: currentCount, previous: prevCount };
  }, [shows]);

  // Helper function to calculate and format trends
  const formatTrend = (current: number, previous?: number) => {
    if (!previous || previous === 0) {
      return { text: 'No data', color: 'text-gray-400', symbol: '—' };
    }

    const change = ((current - previous) / Math.abs(previous)) * 100;
    const isPositive = change > 0;
    const isNegative = change < 0;

    const symbol = isPositive ? '▲' : isNegative ? '▼' : '—';
    const color = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400';
    const formattedChange = Math.abs(change) < 1 ? '<1%' : `${Math.round(Math.abs(change))}%`;
    const text = `${isPositive ? '+' : isNegative ? '-' : ''}${formattedChange} vs last month`;

    return { text, color, symbol };
  };
  // Recents and changes since last visit (real activity data)
  const [lastVisit, setLastVisit] = useState<number>(() => { try { return Number(localStorage.getItem(`demo:welcome:lastVisit:${profile.id}`) || 0); } catch { return 0; } });
  useEffect(() => {
    // update on unmount
    return () => { try { localStorage.setItem(`demo:welcome:lastVisit:${profile.id}`, String(Date.now())); } catch { } };
  }, [profile.id]);

  // Get real recent activity
  const recentActivities = useMemo(() => activityTracker.getRecentActivities(10), [profile.id]);
  const newActivities = useMemo(() => activityTracker.getRecentActivities(10, lastVisit), [profile.id, lastVisit]);

  // Format activities for display
  const formatActivity = (activity: Activity) => {
    const timeAgo = Math.floor((Date.now() - activity.timestamp) / (1000 * 60)); // minutes ago
    let timeString = '';
    if (timeAgo < 60) {
      timeString = `${timeAgo}m ago`;
    } else if (timeAgo < 1440) {
      timeString = `${Math.floor(timeAgo / 60)}h ago`;
    } else {
      timeString = `${Math.floor(timeAgo / 1440)}d ago`;
    }

    switch (activity.type) {
      case 'page_view':
        return { text: `Viewed ${activity.item.replace('_', ' ')}`, time: timeString };
      case 'show_view':
        return { text: `Reviewed show details`, time: timeString };
      case 'contract_action':
        return { text: `Updated contract`, time: timeString };
      case 'finance_view':
        return { text: `Checked ${activity.item} finances`, time: timeString };
      case 'travel_view':
        return { text: `Viewed ${activity.item} travel`, time: timeString };
      case 'calendar_view':
        return { text: `Viewed ${activity.item} calendar`, time: timeString };
      case 'settings_view':
        return { text: `Updated ${activity.item} settings`, time: timeString };
      case 'report_view':
        return { text: `Generated ${activity.item} report`, time: timeString };
      default:
        return { text: `${String(activity.type).replace('_', ' ')}: ${activity.item}`, time: timeString };
    }
  };

  return (
    <motion.div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6" layoutId="dashboard-teaser">
      <div>
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={(
            <div className="flex items-center gap-2">
              {isAgency ? (
                <>
                  <button className="btn-ghost text-xs" title={t('welcome.tooltip.inviteManager') || 'Invite team members to collaborate on shows and finances'} onClick={() => { try { Events.welcomeCta('invite'); } catch { }; setShowInvite(true); }}>
                    {t('welcome.cta.inviteManager') || 'Invite manager'}
                  </button>
                  <button className="btn-ghost text-xs" title={t('welcome.tooltip.connectArtist') || 'Link with artists to manage their tours'} onClick={() => { try { Events.welcomeCta('link'); } catch { }; setShowConnect(true); }}>
                    {t('welcome.cta.connectArtist') || 'Connect artist'}
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-ghost text-xs" title={t('welcome.tooltip.completeBranding') || 'Set up your organization\'s branding and profile'} onClick={() => { try { Events.welcomeCta('branding'); } catch { }; setShowBranding(true); }}>
                    {t('welcome.cta.completeBranding') || 'Complete branding'}
                  </button>
                  <button className="btn-ghost text-xs" title={t('welcome.tooltip.connectCalendar') || 'Sync your calendar for automatic show scheduling'} onClick={() => { try { Events.welcomeCta('calendar'); } catch { }; setShowIntegrations(true); }}>
                    {t('welcome.cta.connectCalendar') || 'Connect calendar'}
                  </button>
                </>
              )}
              <button
                className="btn-ghost text-xs"
                title={t('welcome.tooltip.switchOrg') || 'Switch between different organizations you manage'}
                onClick={() => { try { Events.welcomeCta('switchOrg'); } catch { }; setShowSwitchOrg(true); }}
              >{t('welcome.cta.switchOrg') || 'Change organization'}</button>
              {isChecklistComplete ? (
                <a
                  href={`${(((import.meta as any).env?.BASE_URL ?? '/').replace(/\/$/, ''))}/dashboard?landing=1`}
                  className="btn-ghost text-xs"
                  onClick={(e) => {
                    try { setCurrentOrgId(ORG_ARTIST_DANNY); Events.welcomeCta('dashboard'); } catch { }
                    // Force hard navigation to ensure URL change
                    try {
                      const href = `${(((import.meta as any).env?.BASE_URL ?? '/').replace(/\/$/, ''))}/dashboard?landing=1`;
                      e.preventDefault();
                      window.location.assign(href);
                    } catch { }
                  }}
                >{t('welcome.cta.dashboard') || 'Go to dashboard'}</a>
              ) : (
                <button
                  className="btn-ghost text-xs"
                  onClick={() => {
                    // Scroll to checklist
                    const checklistElement = document.querySelector('[data-checklist]');
                    if (checklistElement) {
                      checklistElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                >{t('welcome.cta.completeSetup') || 'Complete setup'}</button>
              )}
            </div>
          )}
        />
        {/* Focus anchor to satisfy "focus H1" requirement */}
        <h1 ref={h1Ref} tabIndex={-1} className="sr-only">{title}</h1>
      </div>

      {/* Executive KPIs - Most Important Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-sm font-medium mb-2">{t('kpi.totalRevenue') || 'Total Revenue'}</div>
          <div className="text-2xl font-bold text-green-400 mb-1">
            {fmtMoney(snapshot.month.net)}
          </div>
          <div className="text-xs opacity-70 flex items-center gap-1">
            <span className={formatTrend(snapshot.month.net, prevSnapshot?.month.net).color}>
              {formatTrend(snapshot.month.net, prevSnapshot?.month.net).symbol}
            </span>
            <span>{formatTrend(snapshot.month.net, prevSnapshot?.month.net).text}</span>
          </div>
        </div>

        {/* Total Shows */}
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-sm font-medium mb-2">{t('kpi.totalShows') || 'Total Shows'}</div>
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {shows.length}
          </div>
          <div className="text-xs opacity-70 flex items-center gap-1">
            <span className={formatTrend(shows.length, currentMonthStats.previous).color}>
              {formatTrend(shows.length, currentMonthStats.previous).symbol}
            </span>
            <span>{formatTrend(shows.length, currentMonthStats.previous).text}</span>
          </div>
        </div>

        {/* Average Fee */}
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-sm font-medium mb-2">{t('kpi.avgFee') || 'Avg Fee'}</div>
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {fmtMoney(shows.length > 0 ? snapshot.month.net / shows.length : 0)}
          </div>
          <div className="text-xs opacity-70">
            Per confirmed show
          </div>
        </div>

        {/* Growth Rate */}
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-sm font-medium mb-2">{t('kpi.growthRate') || 'Growth Rate'}</div>
          <div className="text-2xl font-bold text-orange-400 mb-1">
            {prevSnapshot ? Math.round(((snapshot.month.net - prevSnapshot.month.net) / Math.max(prevSnapshot.month.net, 1)) * 100) : 0}%
          </div>
          <div className="text-xs opacity-70">
            {prevSnapshot ? 'vs last month' : 'No data'}
          </div>
        </div>
      </div>

      {/* Performance Rankings & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Artists */}
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-sm font-medium mb-4">{t('ranking.topArtists') || 'Top Performing Artists'}</div>
          <div className="space-y-3">
            {isAgency ? (
              // For agencies: show artists by revenue
              <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-sm font-medium">
                    D
                  </div>
                  <div>
                    <div className="text-sm font-medium">Danny Avila</div>
                    <div className="text-xs opacity-70">Electronic DJ</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-400">{fmtMoney(snapshot.month.net)}</div>
                  <div className="text-xs opacity-70">{shows.length} shows</div>
                </div>
              </div>
            ) : (
              // For artists: show performance metrics
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Shows this month</span>
                  <span className="font-medium">{currentMonthStats.current}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Revenue this month</span>
                  <span className="font-medium text-green-400">{fmtMoney(snapshot.month.net)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Avg. attendance</span>
                  <span className="font-medium">2,450</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Trends */}
        <div className="glass rounded border border-white/10 p-4">
          <div className="text-sm font-medium mb-4">{t('analytics.revenueTrends') || 'Revenue Trends'}</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-70">This month</span>
              <span className="text-sm font-medium text-green-400">{fmtMoney(snapshot.month.net)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-70">Last month</span>
              <span className="text-sm font-medium opacity-60">{fmtMoney(prevSnapshot?.month.net || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-70">Year to date</span>
              <span className="text-sm font-medium text-blue-400">{fmtMoney(snapshot.year.net)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs opacity-70 mb-2">Monthly growth</div>
              <div className="h-2 bg-white/10 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400"
                  style={{ width: `${Math.min(100, Math.max(0, prevSnapshot ? ((snapshot.month.net - prevSnapshot.month.net) / Math.max(prevSnapshot.month.net, 1)) * 100 + 50 : 50))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Actions Inbox - Secondary Section */}
      <PriorityActionsInbox isAgency={isAgency} onActionClick={handlePriorityAction} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-3">
          {/* People */}
          {isAgency ? (
            <PeopleList title={t('welcome.section.team') || 'Your team'} items={listMembers(ORG_AGENCY_SHALIZI).map(m => ({ name: m.user.name, role: m.role }))} />
          ) : (
            <>
              <PeopleList title={t('welcome.section.team') || 'Your team'} items={listMembers(ORG_ARTIST_DANNY).map(m => ({ name: m.user.name, role: m.role }))} />
              {link && (
                <div className="glass rounded border border-white/10 p-3">
                  <div className="text-xs opacity-70 mb-2">{t('welcome.section.links') || 'Connections & scopes'}</div>
                  <div className="text-sm mb-2">Shalizi Group</div>
                  <ScopeChips scopes={link.scopes} />
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-3">
          {/* Relationships */}
          {isAgency ? (
            <>
              <div className="glass rounded border border-white/10 p-3">
                <div className="text-xs opacity-70 mb-2">{t('welcome.section.clients') || 'Your artists'}</div>
                <ul className="text-sm space-y-1.5" role="list">
                  <li role="listitem" className="flex items-center justify-between">
                    <span>Danny Avila</span>
                    <button className="btn-ghost text-xs" onClick={() => setShowArtistPanel(true)} title={t('welcome.inlineOnly') || 'Open inline panel from here'}>
                      {t('welcome.openArtistInline')?.replace('{artist}', 'Danny') || 'Open Danny panel'}
                    </button>
                  </li>
                </ul>
              </div>
              <AssignmentMatrix orgId={ORG_AGENCY_SHALIZI} />
            </>
          ) : (
            <div className="glass rounded border border-white/10 p-3">
              <div className="text-xs opacity-70 mb-2">{t('welcome.upcoming.14d') || 'Upcoming 14 days'}</div>
              {upcoming.length === 0 ? (
                <EmptyState icon="📅" title={t('empty.noUpcoming') || 'No upcoming events'} desc={t('empty.noUpcoming.hint') || 'Review your calendar or connect your calendar'} cta={{ label: t('welcome.cta.connectCalendar') || 'Connect calendar', onClick: () => { try { Events.welcomeCta('calendar'); } catch { }; setShowIntegrations(true); } }} />
              ) : (
                <ul className="text-sm space-y-1.5" role="list">
                  {upcoming.map((u: any, i: number) => (
                    <li key={i} role="listitem" className="flex items-center justify-between gap-2">
                      <span className="opacity-85">{new Date(u.date).toLocaleDateString()} • {u.city}, {u.country}</span>
                      <span className="text-[11px] opacity-70">{u.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Actions and State */}
          <Checklist
            items={checklistItems}
            storageKey={checklistStorageKey}
            done={checklistDone}
            setDone={setChecklistDone}
            expanded={checklistExpanded}
            onToggleExpanded={() => setChecklistExpanded(!checklistExpanded)}
          />
          {isAgency ? (
            <SeatsUsageBar orgId={ORG_AGENCY_SHALIZI} />
          ) : (
            <div className="glass rounded border border-white/10 p-3">
              <div className="text-xs opacity-70 mb-2">{t('welcome.section.kpis') || 'This month'}</div>
              <div className="grid grid-cols-3 gap-2 text-sm text-center">
                <div className="glass rounded p-2">
                  <div className="opacity-75 text-[11px]">{t('kpi.shows') || 'Shows'}</div>
                  <div className="text-lg font-bold">{currentMonthStats.current}</div>
                  <div className="text-[10px] opacity-60 flex items-center justify-center gap-1">
                    <span className={formatTrend(currentMonthStats.current, currentMonthStats.previous).color}>
                      {formatTrend(currentMonthStats.current, currentMonthStats.previous).symbol}
                    </span>
                    <span>{formatTrend(currentMonthStats.current, currentMonthStats.previous).text}</span>
                  </div>
                </div>
                <div className="glass rounded p-2">
                  <div className="opacity-75 text-[11px]">{t('kpi.net') || 'Net'}</div>
                  <div className="text-lg font-bold">{fmtMoney ? fmtMoney(monthAgg.net) : monthAgg.net}</div>
                  <div className="text-[10px] opacity-60 flex items-center justify-center gap-1">
                    <span className={formatTrend(monthAgg.net, monthAgg.prev?.net).color}>
                      {formatTrend(monthAgg.net, monthAgg.prev?.net).symbol}
                    </span>
                    <span>{formatTrend(monthAgg.net, monthAgg.prev?.net).text}</span>
                  </div>
                </div>
                <div className="glass rounded p-2">
                  <div className="opacity-75 text-[11px]">{t('kpi.travel') || 'Travel'}</div>
                  <div className="text-lg font-bold">—</div>
                  <div className="text-[10px] opacity-60">No data yet</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs opacity-80">
            <span></span>
            <span className="text-xs opacity-60">Complete setup to unlock full features</span>
          </div>
        </div>
      </div>

      {/* Recents & Changes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="glass rounded border border-white/10 p-3">
          <div className="text-xs opacity-70 mb-2">{t('welcome.recentlyViewed') || 'Recently viewed'}</div>
          {recentActivities.length === 0 ? (
            <EmptyState icon="🕘" title={t('empty.noRecent') || 'No recent activity'} desc="Start exploring to see your activity here" />
          ) : (
            <ul className="text-sm space-y-1.5" role="list">
              {recentActivities.slice(0, 3).map((activity, i) => {
                const formatted = formatActivity(activity);
                return (
                  <li key={i} role="listitem" className="flex items-center justify-between">
                    <span className="opacity-85">{formatted.text}</span>
                    <span className="text-[11px] opacity-60">{formatted.time}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="glass rounded border border-white/10 p-3">
          <div className="text-xs opacity-70 mb-2">{t('welcome.changesSince') || 'Changes since your last visit'}</div>
          {newActivities.length === 0 ? (
            <EmptyState icon="✓" title={t('welcome.noChanges') || 'No new activity'} desc="Everything is up to date" />
          ) : (
            <ul className="text-sm space-y-1.5" role="list">
              {newActivities.slice(0, 3).map((activity, i) => {
                const formatted = formatActivity(activity);
                return (
                  <li key={i} role="listitem" className="flex items-center gap-2">
                    <span aria-hidden>📝</span>
                    <span>{formatted.text}</span>
                    <span className="text-[11px] opacity-60 ml-auto">{formatted.time}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Inline modals/drawers */}
      <InviteManagerModal orgId={orgId} open={showInvite} onClose={() => setShowInvite(false)} />
      <OrgSwitcher open={showSwitchOrg} onClose={() => setShowSwitchOrg(false)} />
      <ConnectArtistDrawer open={showConnect} onClose={() => setShowConnect(false)} />
      <BrandingModal open={showBranding} onClose={() => setShowBranding(false)} />
      <IntegrationsModal open={showIntegrations} onClose={() => setShowIntegrations(false)} />
      <ArtistQuickPanel open={showArtistPanel} onClose={() => setShowArtistPanel(false)} />
    </motion.div>
  );
};

export default OrgOverview;
