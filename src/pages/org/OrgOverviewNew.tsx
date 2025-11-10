import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { getLinkAgencyToArtist, getSeatsUsage, listLinks, listMembers, listTeams, type Link as DemoLink } from '../../lib/tenants';
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
import { Clock, CheckCircle2, Circle, Calendar, Users, Briefcase, TrendingUp, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { setCurrentOrgId } from '../../lib/tenants';
import { activityTracker, trackPageView, getRecentActivity, type Activity } from '../../lib/activityTracker';
import { OrgKPICard, OrgListItem, OrgSectionHeader, OrgEmptyState, OrgStatRow, OrgActionCard, OrgContainerSection } from '../../components/org/OrgModernCards';

const ScopeChips: React.FC<{ scopes: DemoLink['scopes'] }> = ({ scopes }) => {
  const chip = (label: string, kind: 'ok' | 'warn' | 'info', title?: string) => (
    <span title={title} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-colors cursor-default ${kind === 'ok' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20 hover:border-emerald-400/40' : kind === 'warn' ? 'bg-amber-500/15 text-amber-200 border-amber-400/25 hover:border-amber-400/45' : 'bg-sky-500/15 text-sky-200 border-sky-400/25 hover:border-sky-400/45'}`}>{label}</span>
  );
  return (
    <div className="flex flex-wrap gap-2">
      {chip(`${t('scopes.shows') || 'Shows'}: ${scopes.shows}`, scopes.shows === 'write' ? 'ok' : 'info', t('scopes.tooltip.shows') || 'Shows access')}
      {chip(`${t('scopes.travel') || 'Travel'}: ${scopes.travel}`, scopes.travel === 'book' ? 'ok' : 'info', t('scopes.tooltip.travel') || 'Travel access')}
      {chip(`${t('scopes.finance') || 'Finance'}: ${scopes.finance}`, scopes.finance === 'read' ? 'warn' : 'info', t('scopes.tooltip.finance') || 'Finance access')}
    </div>
  );
};

const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; desc?: string; cta?: { label: string; onClick: () => void } }> = ({ icon = <Circle className="w-5 h-5" />, title, desc, cta }) => (
  <div className="glass rounded-xl border border-dashed border-white/15 p-4 text-sm text-center bg-white/2 hover:border-slate-300 dark:border-white/20 transition-all duration-300">
    <div className="flex justify-center mb-2 text-slate-300 dark:text-white/50" aria-hidden>{icon}</div>
    <div className="text-slate-700 dark:text-slate-700 dark:text-white/90 font-medium">{title}</div>
    {desc && <div className="text-xs opacity-60 mt-2">{desc}</div>}
    {cta && <div className="mt-3"><button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 hover:from-accent-500/35 hover:to-accent-600/20 text-accent-100 border border-accent-500/40 font-semibold text-xs shadow-lg hover:shadow-lg transition-all cursor-pointer" onClick={cta.onClick}>{cta.label}</button></div>}
  </div>
);

const PeopleList: React.FC<{ title: string; items: Array<{ name: string; role?: string; team?: string }>; action?: { label: string; onClick: (person: { name: string }) => void } }> = ({ title, items, action }) => (
  <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
    <div className="text-xs font-semibold text-slate-500 dark:text-white/70 mb-3 uppercase tracking-wider">{title}</div>
    {items.length === 0 && <EmptyState icon="users" title={t('empty.noPeople') || 'No people yet'} desc={t('empty.inviteHint') || 'Invite someone to get started'} cta={action ? { label: action.label, onClick: () => action.onClick({ name: '' }) } : undefined} />}
    <ul className="text-sm space-y-2" role="list">
      {items.map((p, i) => (
        <li key={i} role="listitem" className="flex items-center justify-between gap-3 hover:bg-slate-100 dark:bg-white/5 px-2 py-1.5 rounded-lg transition-colors cursor-pointer">
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent-500/20 border border-accent-500/40 text-accent-100 text-[11px] font-semibold flex items-center justify-center flex-shrink-0">{(p.name || ' ').charAt(0).toUpperCase()}</span>
            <span className="text-slate-700 dark:text-white/90">{p.name}</span>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-white/60 flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              {p.role && <span>{p.role}</span>}
              {p.role && p.team && <span className="text-slate-300 dark:text-slate-200 dark:text-white/30">|</span>}
              {p.team && <span>{p.team}</span>}
            </span>
            {action && <button className="px-2.5 py-1.5 rounded-lg hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-accent-100 font-semibold text-[11px] transition-colors cursor-pointer" onClick={() => action.onClick(p)}>{action.label}</button>}
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
    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
      <div className="text-xs font-semibold text-slate-500 dark:text-white/70 mb-3 uppercase tracking-wider">
        {t('welcome.seats.usage') || 'Seats used'}
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent-500/60 to-accent-600/40 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[11px] text-slate-400 dark:text-white/60 mt-3 flex items-center gap-3">
        <span>{seats.internalUsed}/{seats.internalLimit} internal</span>
        <span className="text-slate-300 dark:text-slate-200 dark:text-white/30">|</span>
        <span>{seats.guestUsed}/{seats.guestLimit} guests</span>
      </div>
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
    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300" data-checklist>
      <div className="text-xs font-semibold text-slate-500 dark:text-white/70 mb-3 uppercase tracking-wider flex items-center justify-between">
        <span>{t('welcome.gettingStarted') || 'Getting started'}</span>
        {isComplete && onToggleExpanded && (
          <button
            onClick={onToggleExpanded}
            className="text-xs text-slate-400 dark:text-white/60 hover:text-slate-700 dark:text-slate-700 dark:text-white/90 transition-colors"
          >
            {expanded ? '−' : '+'}
          </button>
        )}
      </div>

      {isComplete && !expanded ? (
        <div className="text-sm text-slate-700 dark:text-slate-700 dark:text-white/90 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Setup complete</span>
          {onToggleExpanded && (
            <button
              onClick={onToggleExpanded}
              className="text-xs text-slate-400 dark:text-white/60 hover:text-slate-700 dark:text-slate-700 dark:text-white/90 transition-colors ml-auto"
            >
              Show details
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-500 dark:text-white/70 font-medium">
                {isComplete
                  ? t('welcome.progress.complete') || 'Setup complete'
                  : (t('welcome.progress.incomplete') || '{completed}/{total} steps completed').replace('{completed}', String(completed)).replace('{total}', String(total))
                }
              </span>
              <span className="text-slate-500 dark:text-white/70 font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`h-full rounded-full transition-all ${isComplete ? 'bg-gradient-to-r from-emerald-500/60 to-emerald-600/40' : 'bg-gradient-to-r from-accent-500/60 to-accent-600/40'}`}
              />
            </div>
          </div>
          <motion.ul
            className="text-sm space-y-2"
            role="list"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.03 }
              }
            }}
          >
            {items.map((label, i) => (
              <motion.li
                key={i}
                role="listitem"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-colors group"
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <input id={`chk-${i}`} type="checkbox" checked={!!done[i]} onChange={() => toggle(i)} aria-label={label} className="rounded-md border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 checked:bg-accent-500/60 checked:border-accent-500/60 cursor-pointer transition-all" />
                <label htmlFor={`chk-${i}`} className={`cursor-pointer text-slate-700 dark:text-slate-700 dark:text-white/90 transition-all group-hover:text-white ${done[i] ? 'opacity-60 line-through' : ''}`}>{label}</label>
              </motion.li>
            ))}
          </motion.ul>
        </>
      )}
    </div>
  );
};

const AssignmentMatrix: React.FC<{ orgId: string; orgName: string }> = ({ orgId, orgName }) => {
  // Build mapping Artist -> Team name -> Managers
  const links = listLinks(orgId).filter(l => l.agencyOrgId === orgId);
  const teams = listTeams(orgId);
  const members = listMembers(orgId);
  const rows = links.map(l => {
    const team = teams.find(t => t.name === orgName);
    const mgrs = team ? team.members.map(id => members.find(m => m.user.id === id)?.user.name || id) : [];
    return { artist: orgName, team: team?.name || 'N/A', managers: mgrs };
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
    <div className="glass rounded-lg border border-slate-200 dark:border-white/10 p-3 md:p-4 bg-gradient-to-r from-slate-100 dark:from-white/6 to-white/3">
      <div className="text-xs font-semibold text-slate-500 dark:text-white/70 mb-3 uppercase tracking-wide">{t('welcome.section.assignments') || 'Managers per artist'}</div>
      <table className="w-full text-sm" role="grid" aria-label={t('welcome.section.assignments') || 'Managers per artist'}>
        <thead className="text-xs text-slate-400 dark:text-white/60 font-semibold">
          <tr className="border-b border-white/10">
            <th className="text-left py-2 px-2" scope="col">Artist</th>
            <th className="text-left py-2 px-2" scope="col">Team</th>
            <th className="text-left py-2 px-2" scope="col">Managers</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} tabIndex={0} onKeyDown={onRowKey} className="border-t border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-accent-500/60 transition-colors">
              <td className="py-2 px-2 text-slate-700 dark:text-white/90">{r.artist}</td>
              <td className="py-2 px-2 text-slate-700 dark:text-white/90">{r.team}</td>
              <td className="py-2 px-2 text-slate-600 dark:text-white/80">{r.managers.join(', ') || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <button className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:bg-white/12 text-slate-700 dark:text-slate-700 dark:text-white/90 text-xs font-semibold transition-all opacity-50 cursor-not-allowed" title={t('welcome.inlineOnly') || 'Manage assignments inline'} onClick={() => { try { Events.welcomeCta('teams'); } catch { } }} aria-disabled>
          {t('welcome.assign') || 'Assign'}
        </button>
      </div>
    </div>
  );
};

const PriorityActionsInbox: React.FC<{ isAgency: boolean; onActionClick: (action: string) => void; orgName: string }> = ({ isAgency, onActionClick, orgName }) => {
  // Mock priority actions - in real app, these would come from business logic
  const actions = isAgency ? [
    {
      id: 'contract_expiring',
      priority: 'high' as const,
      title: 'Show contract expires in 3 days',
      description: `Review and sign the updated contract for ${orgName}'s upcoming performance`,
      action: 'Review contract',
    },
    {
      id: 'invoice_overdue',
      priority: 'high' as const,
      title: 'Show invoice is 15 days overdue',
      description: 'Send payment reminder to the venue for the completed show',
      action: 'Send reminder',
    },
    {
      id: 'flight_alert',
      priority: 'medium' as const,
      title: 'Tour flights have price drop alert',
      description: 'Flight prices for upcoming shows have dropped by 12%. Consider rebooking.',
      action: 'Check flights',
    }
  ] : [
    {
      id: 'contract_pending',
      priority: 'high' as const,
      title: 'Show contract needs your review',
      description: 'Your manager has sent a show contract for your approval',
      action: 'Review contract',
    },
    {
      id: 'payment_due',
      priority: 'medium' as const,
      title: 'Outstanding payment from recent show',
      description: 'Payment for a recent performance is 7 days overdue from the venue',
      action: 'Follow up',
    },
    {
      id: 'calendar_sync',
      priority: 'low' as const,
      title: 'Calendar integration needs attention',
      description: 'Your Google Calendar hasn\'t synced for 2 days. Some events may be missing.',
      action: 'Fix sync',
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 space-y-4"
    >
      <OrgSectionHeader
        title="Acciones Rápidas"
        subtitle="Tareas críticas que requieren tu atención"
      />
      <div className="space-y-3">
        {actions.map((action) => (
          <OrgActionCard
            key={action.id}
            id={action.id}
            priority={action.priority}
            title={action.title}
            description={action.description}
            action={action.action}
            onAction={() => onActionClick(action.id)}
          />
        ))}
      </div>
      <div className="pt-3 border-t border-white/10">
        <button
          onClick={() => onActionClick('view_all')}
          className="text-xs text-slate-400 dark:text-white/60 hover:text-slate-700 dark:text-slate-700 dark:text-white/90 hover:text-accent-300 transition-colors duration-300 font-semibold cursor-pointer"
        >
          Ver todas las tareas →
        </button>
      </div>
    </motion.div>
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
  const links = listLinks(orgId).filter(l => l.agencyOrgId === orgId);
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
      return { text: 'No data', color: 'text-gray-400', symbol: <span className="inline-block w-3 h-3" /> };
    }

    const change = ((current - previous) / Math.abs(previous)) * 100;
    const isPositive = change > 0;
    const isNegative = change < 0;

    const symbol = isPositive ? <TrendingUp className="w-3 h-3 inline" /> : isNegative ? <TrendingUp className="w-3 h-3 inline rotate-180" /> : <span className="inline-block w-3 h-3" />;
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
    <motion.div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-4" layoutId="dashboard-teaser">
      {/* Organization Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/30 to-accent-600/20 flex items-center justify-center text-xl font-bold text-accent-100 border border-accent-500/30 flex-shrink-0">
              {org.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg md:text-xl font-bold text-white/95">{org.name}</h2>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium border bg-sky-500/15 text-sky-200 border-sky-400/25">
                  {org.type === 'agency' ? 'Agency' : 'Artist'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-white/60">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>{listMembers(orgId).length} team members</span>
                </div>
                {profile.email && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{profile.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div>
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={(
            <div className="flex items-center gap-2 flex-wrap">
              {isAgency ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:bg-white/12 text-slate-700 dark:text-slate-700 dark:text-white/90 text-xs font-semibold transition-all duration-300"
                    title={t('welcome.tooltip.inviteManager') || 'Invite team members to collaborate on shows and finances'}
                    onClick={() => { try { Events.welcomeCta('invite'); } catch { }; setShowInvite(true); }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {t('welcome.cta.inviteManager') || 'Invite manager'}
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:bg-white/12 text-slate-700 dark:text-slate-700 dark:text-white/90 text-xs font-semibold transition-all duration-300"
                    title={t('welcome.tooltip.connectArtist') || 'Link with artists to manage their tours'}
                    onClick={() => { try { Events.welcomeCta('link'); } catch { }; setShowConnect(true); }}
                  >
                    {t('welcome.cta.connectArtist') || 'Connect artist'}
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:bg-white/12 text-slate-700 dark:text-slate-700 dark:text-white/90 text-xs font-semibold transition-all duration-300"
                    title={t('welcome.tooltip.completeBranding') || 'Set up your organization\'s branding and profile'}
                    onClick={() => { try { Events.welcomeCta('branding'); } catch { }; setShowBranding(true); }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      {t('welcome.cta.completeBranding') || 'Complete branding'}
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:bg-white/12 text-slate-700 dark:text-slate-700 dark:text-white/90 text-xs font-semibold transition-all duration-300"
                    title={t('welcome.tooltip.connectCalendar') || 'Sync your calendar for automatic show scheduling'}
                    onClick={() => { try { Events.welcomeCta('calendar'); } catch { }; setShowIntegrations(true); }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {t('welcome.cta.connectCalendar') || 'Connect calendar'}
                    </div>
                  </motion.button>
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:bg-white/12 text-slate-700 dark:text-slate-700 dark:text-white/90 text-xs font-semibold transition-all duration-300"
                title={t('welcome.tooltip.switchOrg') || 'Switch between different organizations you manage'}
                onClick={() => { try { Events.welcomeCta('switchOrg'); } catch { }; setShowSwitchOrg(true); }}
              >
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {t('welcome.cta.switchOrg') || 'Change organization'}
                </div>
              </motion.button>
              {isChecklistComplete ? (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={`${(((import.meta as any).env?.BASE_URL ?? '/').replace(/\/$/, ''))}/dashboard?landing=1`}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500/30 via-accent-500/20 to-accent-600/15 hover:from-accent-500/40 hover:to-accent-600/25 text-accent-100 border border-accent-500/40 font-semibold text-xs shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  onClick={(e) => {
                    try { Events.welcomeCta('dashboard'); } catch { }
                    try {
                      const href = `${(((import.meta as any).env?.BASE_URL ?? '/').replace(/\/$/, ''))}/dashboard?landing=1`;
                      e.preventDefault();
                      window.location.assign(href);
                    } catch { }
                  }}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {t('welcome.cta.dashboard') || 'Go to dashboard'}
                </motion.a>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500/30 via-accent-500/20 to-accent-600/15 hover:from-accent-500/40 hover:to-accent-600/25 text-accent-100 border border-accent-500/40 font-semibold text-xs shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  onClick={() => {
                    const checklistElement = document.querySelector('[data-checklist]');
                    if (checklistElement) {
                      checklistElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('welcome.cta.completeSetup') || 'Complete setup'}
                </motion.button>
              )}
            </div>
          )}
        />
        {/* Focus anchor to satisfy "focus H1" requirement */}
        <h1 ref={h1Ref} tabIndex={-1} className="sr-only">{title}</h1>
      </div>

      {/* Executive KPIs - Most Important Section - Modernized */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0 }
          }
        }}
        initial="hidden"
        animate="visible"
      >
        <OrgKPICard
          label={t('kpi.totalRevenue') || 'Total Revenue'}
          value={fmtMoney(snapshot.month.net)}
          trend={formatTrend(snapshot.month.net, prevSnapshot?.month.net)}
          color="green"
          accent
        />
        <OrgKPICard
          label={t('kpi.totalShows') || 'Total Shows'}
          value={shows.length}
          trend={formatTrend(shows.length, currentMonthStats.previous)}
          color="blue"
        />
        <OrgKPICard
          label={t('kpi.avgFee') || 'Avg Fee'}
          value={fmtMoney(shows.length > 0 ? snapshot.month.net / shows.length : 0)}
          subValue="Per confirmed show"
          color="purple"
        />
        <OrgKPICard
          label={t('kpi.growthRate') || 'Growth Rate'}
          value={`${prevSnapshot ? Math.round(((snapshot.month.net - prevSnapshot.month.net) / Math.max(prevSnapshot.month.net, 1)) * 100) : 0}%`}
          subValue={prevSnapshot ? 'vs last month' : 'No data'}
          color="amber"
        />
      </motion.div>

      {/* Performance Rankings & Analytics */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.3 }
          }
        }}
        initial="hidden"
        animate="visible"
      >
        {/* Top Performing Artists */}
        <motion.div
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
          whileHover={{ scale: 1.01 }}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
        >
          <div className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase tracking-wider mb-4">
            {t('ranking.topArtists') || 'Top Performing Artists'}
          </div>
          <div className="space-y-2">
            {isAgency ? (
              // For agencies: show artists by revenue
              links.length > 0 ? (
                links.slice(0, 3).map((link, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 bg-slate-100 dark:bg-white/5 hover:bg-white/8 rounded-lg border border-slate-200 dark:border-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500/30 to-accent-600/20 flex items-center justify-center text-sm font-semibold text-accent-200 border border-accent-500/20"
                      >
                        {org.name.charAt(0).toUpperCase()}
                      </motion.div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-white/90">{org.name}</div>
                        <div className="text-xs text-slate-400 dark:text-white/60">{org.type === 'agency' ? 'Management' : 'Artist'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-400">{fmtMoney(snapshot.month.net)}</div>
                      <div className="text-xs text-slate-400 dark:text-white/60">{shows.length} shows</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-sm text-slate-400 dark:text-white/60 p-4 text-center">
                  {t('welcome.noArtistsYet') || 'No artists connected yet'}
                </div>
              )
            ) : (
              // For artists: show performance metrics
              <div className="space-y-2">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex justify-between items-center p-2.5 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-colors"
                >
                  <span className="text-sm text-slate-500 dark:text-white/70 font-medium">Shows this month</span>
                  <motion.span
                    key={currentMonthStats.current}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-semibold text-slate-700 dark:text-slate-700 dark:text-white/90 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md"
                  >
                    {currentMonthStats.current}
                  </motion.span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex justify-between items-center p-2.5 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-colors"
                >
                  <span className="text-sm text-slate-500 dark:text-white/70 font-medium">Revenue this month</span>
                  <motion.span
                    key={snapshot.month.net}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-md"
                  >
                    {fmtMoney(snapshot.month.net)}
                  </motion.span>
                </motion.div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-white/70">Avg. attendance</span>
                  <span className="font-semibold text-slate-700 dark:text-white/90">2,450</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Revenue Trends */}
        <motion.div
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 }
          }}
          whileHover={{ scale: 1.01 }}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
        >
          <div className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase tracking-wider mb-4">
            {t('analytics.revenueTrends') || 'Revenue Trends'}
          </div>
          <div className="space-y-2">
            <motion.div whileHover={{ x: 4 }} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-colors">
              <span className="text-sm text-slate-500 dark:text-white/70">This month</span>
              <motion.span initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-sm font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-md">
                {fmtMoney(snapshot.month.net)}
              </motion.span>
            </motion.div>
            <motion.div whileHover={{ x: 4 }} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-colors">
              <span className="text-sm text-slate-500 dark:text-white/70">Last month</span>
              <motion.span initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 }} className="text-sm font-semibold text-slate-400 dark:text-white/60 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                {fmtMoney(prevSnapshot?.month.net || 0)}
              </motion.span>
            </motion.div>
            <motion.div whileHover={{ x: 4 }} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-colors">
              <span className="text-sm text-slate-500 dark:text-white/70">Year to date</span>
              <motion.span initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                {fmtMoney(snapshot.year.net)}
              </motion.span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-slate-400 dark:text-white/60 mb-2 font-semibold">Monthly growth</div>
              <div className="h-2 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, prevSnapshot ? ((snapshot.month.net - prevSnapshot.month.net) / Math.max(prevSnapshot.month.net, 1)) * 100 + 50 : 50))}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-green-400"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Priority Actions Inbox - Secondary Section */}
      <PriorityActionsInbox isAgency={isAgency} onActionClick={handlePriorityAction} orgName={org.name} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        <div className="space-y-4 lg:space-y-5">
          {/* People */}
          {isAgency ? (
            <PeopleList title={t('welcome.section.team') || 'Your team'} items={listMembers(orgId).map(m => ({ name: m.user.name, role: m.role }))} />
          ) : (
            <>
              <PeopleList title={t('welcome.section.team') || 'Your team'} items={listMembers(orgId).map(m => ({ name: m.user.name, role: m.role }))} />
              {link && (
                <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                  <div className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase tracking-wider mb-3">
                    {t('welcome.section.links') || 'Connections & scopes'}
                  </div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-700 dark:text-white/90 mb-3">{t('welcome.connectedAgency') || 'Connected Agency'}</div>
                  <ScopeChips scopes={link.scopes} />
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-4 lg:space-y-5">
          {/* Relationships */}
          {isAgency ? (
            <>
              <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                <div className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase tracking-wider mb-3">
                  {t('welcome.section.clients') || 'Your artists'}
                </div>
                <ul className="text-sm space-y-2" role="list">
                  {links.map((link, idx) => (
                    <li key={idx} role="listitem" className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-colors">
                      <span className="text-slate-700 dark:text-white/90">{link.artistOrgId === orgId ? org.name : 'Connected Artist'}</span>
                      <button className="px-2.5 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:bg-white/12 text-slate-700 dark:text-slate-700 dark:text-white/90 text-xs font-semibold transition-all cursor-pointer" onClick={() => setShowArtistPanel(true)} title={t('welcome.inlineOnly') || 'Open inline panel from here'}>
                        {`Open ${org.name.split(' ')[0]} panel`}
                      </button>
                    </li>
                  ))}
                  {links.length === 0 && (
                    <li className="text-slate-400 dark:text-white/60 text-sm">{t('welcome.noArtists') || 'No artists connected yet'}</li>
                  )}
                </ul>
              </div>
              <AssignmentMatrix orgId={orgId} orgName={org.name} />
            </>
          ) : (
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
              <div className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase tracking-wider mb-3">
                {t('welcome.upcoming.14d') || 'Upcoming 14 days'}
              </div>
              {upcoming.length === 0 ? (
                <EmptyState icon={<Calendar className="w-5 h-5" />} title={t('empty.noUpcoming') || 'No upcoming events'} desc={t('empty.noUpcoming.hint') || 'Review your calendar or connect your calendar'} cta={{ label: t('welcome.cta.connectCalendar') || 'Connect calendar', onClick: () => { try { Events.welcomeCta('calendar'); } catch { }; setShowIntegrations(true); } }} />
              ) : (
                <ul className="text-sm space-y-1.5" role="list">
                  {upcoming.map((u: any, i: number) => (
                    <li key={i} role="listitem" className="flex items-center justify-between gap-2">
                      <span className="text-white/85 flex items-center gap-2">
                        <span>{new Date(u.date).toLocaleDateString()}</span>
                        <span className="text-slate-300 dark:text-slate-200 dark:text-white/30">|</span>
                        <span>{u.city}, {u.country}</span>
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-white/70">{u.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:space-y-5">
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
            <SeatsUsageBar orgId={orgId} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.01 }}
              className="glass rounded-lg border border-slate-200 dark:border-white/10 p-3 md:p-4 bg-gradient-to-r from-slate-100 dark:from-white/6 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
            >
              <div className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase tracking-wide mb-3">{t('welcome.section.kpis') || 'This month'}</div>
              <motion.div
                className="grid grid-cols-3 gap-2 text-sm text-center"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05, delayChildren: 0.3 }
                  }
                }}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.05, translateY: -2 }}
                  className="glass rounded-lg p-2 border border-slate-200 dark:border-white/10 hover:border-blue-400/30 transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-slate-500 dark:text-white/70 text-[11px] font-semibold mb-1">{t('kpi.shows') || 'Shows'}</div>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                    className="text-lg font-bold text-slate-700 dark:text-white/90"
                  >
                    {currentMonthStats.current}
                  </motion.div>
                  <div className="text-[10px] text-slate-400 dark:text-white/60 flex items-center justify-center gap-1 mt-1">
                    <span className={formatTrend(currentMonthStats.current, currentMonthStats.previous).color}>
                      {formatTrend(currentMonthStats.current, currentMonthStats.previous).symbol}
                    </span>
                    <span>{formatTrend(currentMonthStats.current, currentMonthStats.previous).text}</span>
                  </div>
                  <div className="absolute inset-0 -bottom-1 left-2 right-2 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.05, translateY: -2 }}
                  className="glass rounded-lg p-2 border border-slate-200 dark:border-white/10 hover:border-green-400/30 transition-all duration-300 cursor-pointer group relative"
                >
                  <div className="text-slate-500 dark:text-white/70 text-[11px] font-semibold mb-1">{t('kpi.net') || 'Net'}</div>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="text-lg font-bold text-slate-700 dark:text-white/90"
                  >
                    {fmtMoney ? fmtMoney(monthAgg.net) : monthAgg.net}
                  </motion.div>
                  <div className="text-[10px] text-slate-400 dark:text-white/60 flex items-center justify-center gap-1 mt-1">
                    <span className={formatTrend(monthAgg.net, monthAgg.prev?.net).color}>
                      {formatTrend(monthAgg.net, monthAgg.prev?.net).symbol}
                    </span>
                    <span>{formatTrend(monthAgg.net, monthAgg.prev?.net).text}</span>
                  </div>
                  <div className="absolute inset-0 -bottom-1 left-2 right-2 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.05, translateY: -2 }}
                  className="glass rounded-lg p-2 border border-slate-200 dark:border-white/10 hover:border-orange-400/30 transition-all duration-300 cursor-pointer group relative"
                >
                  <div className="text-slate-500 dark:text-white/70 text-[11px] font-semibold mb-1">{t('kpi.travel') || 'Travel'}</div>
                  <div className="text-lg font-bold text-slate-700 dark:text-white/90">N/A</div>
                  <div className="text-[10px] text-slate-400 dark:text-white/60">No data yet</div>
                  <div className="absolute inset-0 -bottom-1 left-2 right-2 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-white/60">
            <span></span>
            <span className="text-xs text-slate-400 dark:text-white/60">Complete setup to unlock full features</span>
          </div>
        </div>
      </div>

      {/* Recents & Changes */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.4 }
          }
        }}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.01 }}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
        >
          <div className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase tracking-wider mb-4">
            {t('welcome.recentlyViewed') || 'Recently viewed'}
          </div>
          {recentActivities.length === 0 ? (
            <EmptyState icon={<Clock className="w-5 h-5" />} title={t('empty.noRecent') || 'No recent activity'} desc="Start exploring to see your activity here" />
          ) : (
            <motion.ul
              className="text-sm space-y-1.5"
              role="list"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: 0.35 }
                }
              }}
            >
              {recentActivities.slice(0, 3).map((activity, i) => {
                const formatted = formatActivity(activity);
                return (
                  <motion.li
                    key={i}
                    role="listitem"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-colors cursor-pointer group"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ x: 4 }}
                  >
                    <span className="text-white/85 group-hover:text-white transition-colors">{formatted.text}</span>
                    <span className="text-[11px] text-slate-400 dark:text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">{formatted.time}</span>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.01 }}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
        >
          <div className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase tracking-wider mb-4">
            {t('welcome.changesSince') || 'Changes since your last visit'}
          </div>
          {newActivities.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="w-5 h-5" />} title={t('welcome.noChanges') || 'No new activity'} desc="Everything is up to date" />
          ) : (
            <motion.ul
              className="text-sm space-y-1.5"
              role="list"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: 0.4 }
                }
              }}
            >
              {newActivities.slice(0, 3).map((activity, i) => {
                const formatted = formatActivity(activity);
                return (
                  <motion.li
                    key={i}
                    role="listitem"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-colors cursor-pointer group"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ x: 4 }}
                  >
                    <motion.div
                      aria-hidden
                      className="text-accent-400"
                      whileHover={{ scale: 1.2, rotate: 12 }}
                    >
                      <Circle className="w-2 h-2 fill-current" />
                    </motion.div>
                    <span className="text-white/85 group-hover:text-white transition-colors flex-1">{formatted.text}</span>
                    <span className="text-[11px] text-slate-400 dark:text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">{formatted.time}</span>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </motion.div>
      </motion.div>

      {/* Inline modals/drawers */}
      <InviteManagerModal orgId={orgId} open={showInvite} onClose={() => setShowInvite(false)} />
      <OrgSwitcher open={showSwitchOrg} onClose={() => setShowSwitchOrg(false)} />
      <ConnectArtistDrawer open={showConnect} onClose={() => setShowConnect(false)} artistOrgId={(links.length > 0 && links[0]) ? links[0].artistOrgId : orgId} />
      <BrandingModal open={showBranding} onClose={() => setShowBranding(false)} />
      <IntegrationsModal open={showIntegrations} onClose={() => setShowIntegrations(false)} />
      {(links.length > 0 && links[0]) && <ArtistQuickPanel open={showArtistPanel} onClose={() => setShowArtistPanel(false)} artistOrgId={links[0].artistOrgId} />}
    </motion.div>
  );
};

export default OrgOverview;
