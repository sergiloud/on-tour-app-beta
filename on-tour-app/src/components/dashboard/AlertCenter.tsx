import React from 'react';
import { createPortal } from 'react-dom';
import { Card } from '../../ui/Card';
import { regionOf, teamOf } from '../../features/shows/selectors';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../ui/Toast';
import { t } from '../../lib/i18n';

type Alert = { id: string; title: string; kind: 'risk'|'urgency'|'opportunity'|'info'; date?: string; meta?: string } & Partial<{ country: string; region: 'AMER'|'EMEA'|'APAC' }>;

type Severity = 'high'|'med'|'low';
type Team = 'A'|'B';

function inferSeverity(a: Alert): Severity {
  const t = (a.title + ' ' + (a.meta||'')).toLowerCase();
  if (t.includes('overdue') || t.includes('loss') || t.includes('cancel')) return 'high';
  if (t.includes('pending') || t.includes('missing') || t.includes('travel')) return 'med';
  return 'low';
}

function inferCity(a: Alert): string | undefined {
  // naive: assume " • City" or trailing city word in title
  const parts = a.title.split('•');
  if (parts.length > 1) return parts[1]?.trim().split(' ')[0];
  const words = a.title.split(',');
  if (words.length > 1) return words[0]?.trim();
  return undefined;
}

// teamOf now shared in selectors

export const AlertCenter: React.FC<{ open: boolean; onClose: () => void; items: Alert[] }>=({ open, onClose, items }) => {
  const toast = useToast();
  // Masking removed: always show full text
  const redact = React.useCallback((s: any) => String(s), []);
  const [q, setQ] = React.useState('');
  const [kind, setKind] = React.useState<'all'|Alert['kind']>('all');
  const [severity, setSeverity] = React.useState<'all'|Severity>('all');
  const [region, setRegion] = React.useState<'all'|'AMER'|'EMEA'|'APAC'>('all');
  const [team, setTeam] = React.useState<'all'|Team>('all');

  // decorate alerts with derived fields
  const decorated = React.useMemo(()=>{
    return items.map(a => {
      const sev = inferSeverity(a);
      const reg = a.region || (a.country ? regionOf(a.country) : undefined);
      const teamGuess = teamOf(a.id);
      return { ...a, _sev: sev as Severity, _region: reg as any, _team: teamGuess as Team } as any;
    });
  }, [items]);

  const filtered = React.useMemo(()=>{
    const lower = q.trim().toLowerCase();
    return decorated.filter((a: any) =>
      (kind==='all' || a.kind===kind) &&
      (severity==='all' || a._sev===severity) &&
      (region==='all' || a._region===region) &&
      (team==='all' || a._team===team) &&
      (!lower || a.title.toLowerCase().includes(lower))
    );
  }, [q, kind, severity, region, team, decorated]);

  const toCSV = () => {
    const headers = ['id','title','kind','severity','region','team','date','meta'];
  const rows = filtered.map((a: any) => [a.id, redact(a.title), a.kind, a._sev||'', a._region||'', a._team||'', a.date||'', redact(a.meta||'')]);
    const csv = [headers, ...rows].map(r => r.map(v => '"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'alerts.csv'; a.click();
    setTimeout(()=> URL.revokeObjectURL(url), 500);
  };

  const [copiedSlack, setCopiedSlack] = React.useState(false);
  const toSlack = async () => {
    // Build a Slack Block Kit message payload and copy to clipboard
    const blocks = filtered.slice(0, 20).flatMap((a: any) => ([
  { type: 'section', text: { type: 'mrkdwn', text: `*${redact(a.title)}*  ·  ${a.kind.toUpperCase()}  ·  ${a._sev?.toUpperCase()||''}` } },
  { type: 'context', elements: [ { type: 'mrkdwn', text: `${a.date||''} ${a.meta? '• '+redact(a.meta) : ''}  ${a._region? '• '+a._region : ''}  ${a._team? '• Team '+a._team : ''}` } ] },
      { type: 'divider' }
    ]));
    const payload = { blocks };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast.success(t('alerts.slackCopied'));
      setCopiedSlack(true); setTimeout(()=> setCopiedSlack(false), 2500);
    } catch {
      const w = window.open('', '_blank');
      if (w && w.document) {
        const pre = w.document.createElement('pre');
        pre.textContent = JSON.stringify(payload, null, 2);
        w.document.body.appendChild(pre);
      }
      toast.info(t('alerts.copyManual'));
    }
  };

  const dialogRef = React.useRef<HTMLDivElement|null>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(()=>{
    if (open) {
      // capture the element that had focus
      openerRef.current = (document.activeElement as HTMLElement) || null;
      // focus first input after mount
      setTimeout(() => {
        try { dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus(); } catch {}
      }, 0);
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
      window.addEventListener('keydown', onKey);
      return () => { window.removeEventListener('keydown', onKey); };
    } else if (!open && openerRef.current) {
      try { openerRef.current.focus(); } catch {}
    }
    return undefined;
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="alert-center-title" aria-describedby="alert-center-desc" className="fixed inset-0 z-[var(--z-modal)]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div ref={dialogRef} className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[92vw] max-w-3xl glass rounded-xl border border-white/12 shadow-2xl overflow-hidden text-[12px]">
        <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div id="alert-center-title" className="text-[14px] font-semibold">{t('alerts.title')}</div>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[11px]" id="alert-center-desc">{filtered.length} / {items.length} alerts</span>
          </div>
          <div className="flex items-center gap-2 text-[12px]" aria-label="Filters and actions">
            <input className="bg-white/5 rounded px-2 py-1" placeholder={t('common.search')+ '…'} value={q} onChange={e=> setQ(e.target.value)} />
            <select className="bg-white/5 rounded px-2 py-1" value={kind} onChange={e=> setKind(e.target.value as any)}>
              <option value="all">All</option>
              <option value="risk">Risk</option>
              <option value="urgency">Urgency</option>
              <option value="opportunity">Opportunity</option>
              <option value="info">Info</option>
            </select>
            <select className="bg-white/5 rounded px-2 py-1" value={severity} onChange={e=> setSeverity(e.target.value as any)}>
              <option value="all">{t('alerts.anySeverity')}</option>
              <option value="high">High</option>
              <option value="med">Medium</option>
              <option value="low">Low</option>
            </select>
            <select className="bg-white/5 rounded px-2 py-1" value={region} onChange={e=> setRegion(e.target.value as any)}>
              <option value="all">{t('alerts.anyRegion')}</option>
              <option value="AMER">AMER</option>
              <option value="EMEA">EMEA</option>
              <option value="APAC">APAC</option>
            </select>
            <select className="bg-white/5 rounded px-2 py-1" value={team} onChange={e=> setTeam(e.target.value as any)}>
              <option value="all">{t('alerts.anyTeam')}</option>
              <option value="A">Team A</option>
              <option value="B">Team B</option>
            </select>
            <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={toCSV}>Export CSV</button>
            <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={toSlack}>{copiedSlack ? t('alerts.copied') : t('alerts.copySlack')}</button>
            <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={onClose} aria-label={t('common.close')}>{t('common.close')}</button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-auto p-3 grid gap-2">
          {filtered.map((a: any) => (
            <Card key={a.id} className="p-2 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium">{redact(a.title)}</div>
                <div className="text-[11px] opacity-70">{a.date} {a.meta ? `• ${redact(a.meta)}` : ''} {a._region ? `• ${a._region}` : ''} {a._team ? `• Team ${a._team}` : ''}</div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 capitalize">{a.kind}</span>
            </Card>
          ))}
          {filtered.length===0 && <div className="text-[12px] opacity-70">{t('alerts.noAlerts')}</div>}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AlertCenter;
