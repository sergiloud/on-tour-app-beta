import React from 'react';
import { t } from '../../lib/i18n';

type Props = {
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onGoToDate?: () => void;
  view: 'month'|'week'|'day'|'agenda';
  setView: (v: 'month'|'week'|'day'|'agenda') => void;
  tz: string;
  setTz: (tz: string) => void;
  weekStartsOn?: 0|1;
  setWeekStartsOn?: (v: 0|1) => void;
  filters: { kinds: { shows: boolean; travel: boolean }, status?: { confirmed: boolean; pending: boolean; offer: boolean } };
  setFilters: (f: any) => void;
  onImportIcs?: (file: File) => void;
};

const CalendarToolbar: React.FC<Props> = ({ title, onPrev, onNext, onToday, onGoToDate, view, setView, tz, setTz, weekStartsOn = 1, setWeekStartsOn, filters, setFilters, onImportIcs }) => {
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const activeKinds: string[] = [];
  if (filters.kinds.shows) activeKinds.push(t('calendar.show.shows')||'Shows');
  if (filters.kinds.travel) activeKinds.push(t('calendar.show.travel')||'Travel');
  const fileRef = React.useRef<HTMLInputElement|null>(null);
  return (
    <div className="glass rounded-md px-3 py-2 flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={onPrev} aria-label={t('calendar.prev')||'Previous'} title={(t('calendar.shortcut.pgUp')||'PgUp / Alt+←') as string}>‹</button>
          <div className="text-sm font-medium" aria-live="polite">{title}</div>
          <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={onNext} aria-label={t('calendar.next')||'Next'} title={(t('calendar.shortcut.pgDn')||'PgDn / Alt+→') as string}>›</button>
          <button className="px-2 py-1 rounded bg-accent-500 text-black shadow-glow hover:brightness-110" onClick={onToday} title={(t('calendar.shortcut.today')||'T') as string}>{t('calendar.today')||'Today'}</button>
          {/* ICS import */}
          {onImportIcs && (
            <>
              <input ref={fileRef} type="file" accept=".ics,text/calendar" className="sr-only" onChange={e=>{ const f=e.target.files?.[0]; if (f) onImportIcs(f); e.currentTarget.value=''; }} />
              <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={()=> fileRef.current?.click()} aria-label={t('calendar.import.ics')||'Import .ics'}>{t('calendar.import')||'Import'}</button>
            </>
          )}
          {onGoToDate && (
            <button
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 inline-flex items-center justify-center"
              onClick={onGoToDate}
              aria-label={t('calendar.goto')||'Go to date'}
              aria-keyshortcuts="Meta+G Ctrl+G"
              title={(t('calendar.goto')||'Go to date') + ' · ' + (t('calendar.goto.shortcut')||'⌘/Ctrl + G')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="7" y="12" width="4" height="3" rx="0.5" fill="currentColor"/>
              </svg>
            </button>
          )}
        </div>
        {/* Segmented view control */}
        <div className="hidden md:inline-flex border border-white/12 rounded overflow-hidden text-[11px]" role="radiogroup" aria-label={t('calendar.view.switch')||'Change calendar view'}>
          {(['month','week','day','agenda'] as const).map(v=> (
            <button
              key={v}
              role="radio"
              aria-checked={view===v}
              className={`px-2 py-1 ${view===v? 'bg-white/15 font-medium':'hover:bg-white/10'} transition-colors`}
              onClick={()=> setView(v)}
            >{t(`calendar.view.${v}`)||v}</button>
          ))}
        </div>
        {/* Hidden select for accessibility fallback */}
        <label className="md:hidden text-xs">
          <span className="sr-only">{t('calendar.view.switch')||'View'}</span>
          <select className="bg-white/5 rounded px-2 py-1" value={view} onChange={e=> setView(e.target.value as any)}>
            <option value="month">{t('calendar.view.month')||'Month'}</option>
            <option value="week">{t('calendar.view.week')||'Week'}</option>
            <option value="day">{t('calendar.view.day')||'Day'}</option>
            <option value="agenda">{t('calendar.view.agenda')||'Agenda'}</option>
          </select>
        </label>
        <div className="flex items-center gap-2 text-xs">
          {/* Week start selector */}
          {setWeekStartsOn && (
            <label className="inline-flex items-center gap-1">
              <span className="opacity-75">{t('calendar.weekStart')||'Week starts on'}</span>
              <select className="bg-white/5 rounded px-2 py-1" value={weekStartsOn} onChange={e=> setWeekStartsOn(Number(e.target.value) as 0|1)}>
                <option value={1}>{t('calendar.weekStart.mon')||'Mon'}</option>
                <option value={0}>{t('calendar.weekStart.sun')||'Sun'}</option>
              </select>
            </label>
          )}
          <select className="bg-white/5 rounded px-2 py-1" value={tz} onChange={e=> setTz(e.target.value)} aria-label={t('calendar.timezone')||'Time zone'}>
            <option value={localTz}>{localTz} ({t('calendar.tz.local')||'Local'})</option>
            <option value="UTC">UTC</option>
            <option value="Europe/Madrid">Europe/Madrid</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="America/Mexico_City">America/Mexico_City</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
          <label className="inline-flex items-center gap-1 opacity-80"><input type="checkbox" checked={filters.kinds.shows} onChange={e=> setFilters((f: any)=> ({ ...f, kinds: { ...f.kinds, shows: e.target.checked } }))} /> {t('calendar.show.shows')||'Shows'}</label>
          <label className="inline-flex items-center gap-1 opacity-80"><input type="checkbox" checked={filters.kinds.travel} onChange={e=> setFilters((f: any)=> ({ ...f, kinds: { ...f.kinds, travel: e.target.checked } }))} /> {t('calendar.show.travel')||'Travel'}</label>
          {/* Status chips */}
          <div className="hidden md:inline-flex items-center gap-1 ml-2">
            <span className="opacity-75">{t('calendar.status')||'Status'}:</span>
            {(['confirmed','pending','offer'] as const).map(s => (
              <button key={s} onClick={()=> setFilters((f: any)=> ({ ...f, status: { ...f.status, [s]: !f.status[s] } }))}
                className={`px-1.5 py-0.5 rounded border text-[11px] capitalize ${filters.status?.[s] ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 opacity-70'}`}>{s}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="text-[11px] opacity-70 flex items-center gap-2">
        <span>{tz}{tz===localTz? ' • '+(t('calendar.tz.localLabel')||'Local'):''}</span>
        {activeKinds.length>0 && <span>• {activeKinds.join(' + ')}</span>}
      </div>
    </div>
  );
};

export default CalendarToolbar;
