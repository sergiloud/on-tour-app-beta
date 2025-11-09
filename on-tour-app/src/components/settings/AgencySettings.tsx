import React, { useState } from 'react';
import { useSettings, AgencyConfig, AgencyTerritoryMode, ContinentCode } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';

const emptyDraft = (type: 'booking'|'management') => ({ name:'', commissionPct:15, territoryMode:'worldwide' as AgencyTerritoryMode, type, continents: [] as ContinentCode[], countries: [] as string[] });

export const AgencySettings: React.FC = () => {
  const { bookingAgencies, managementAgencies, addAgency, updateAgency, removeAgency } = useSettings();
  const [draftBooking, setDraftBooking] = useState(emptyDraft('booking'));
  const [draftMgmt, setDraftMgmt] = useState(emptyDraft('management'));
  const [countriesBooking, setCountriesBooking] = useState('');
  const [countriesMgmt, setCountriesMgmt] = useState('');
  const [expanded, setExpanded] = useState<'booking'|'management'|null>(null);
  const [message, setMessage] = useState<string>('');
  const [confirmId, setConfirmId] = useState<string|null>(null);

  // Localized labels evaluated at render-time so language switches update
  const continents: { code: ContinentCode; label: string }[] = [
    { code:'NA', label: t('settings.continent.NA') },
    { code:'SA', label: t('settings.continent.SA') },
    { code:'EU', label: t('settings.continent.EU') },
    { code:'AF', label: t('settings.continent.AF') },
    { code:'AS', label: t('settings.continent.AS') },
    { code:'OC', label: t('settings.continent.OC') },
  ];

  const territoryModes: { value: AgencyTerritoryMode; label: string }[] = [
    { value:'worldwide', label: t('settings.territory.worldwide') },
    { value:'continents', label: t('settings.territory.continents') },
    { value:'countries', label: t('settings.territory.countries') }
  ];

  function submit(draft: ReturnType<typeof emptyDraft>, extra:{ countriesStr?: string }, setDraft: any, setCountries: any) {
    const base: any = { ...draft };
    if (draft.territoryMode === 'countries') base.countries = (extra.countriesStr||'').split(/[,\s]+/).map(c=>c.trim().toUpperCase()).filter(Boolean);
    if (draft.territoryMode === 'continents') base.continents = draft.continents || [];
    if (draft.territoryMode !== 'continents') delete base.continents;
    if (draft.territoryMode !== 'countries') delete base.countries;
    // Validate countries if present: must be ISO2 (A-Z length 2)
    if (base.countries && Array.isArray(base.countries)) {
      const bad = base.countries.filter((c:string)=> !/^[A-Z]{2}$/.test(c));
      if (bad.length) {
        setMessage(t('settings.agencies.countries.invalid'));
        return;
      }
    }
    const res = addAgency(base);
    if (res.ok) {
      setDraft(emptyDraft(draft.type)); setCountries(''); setMessage('');
    } else if (res.reason === 'limit') {
      setMessage(t('settings.agencies.limitReached'));
    }
  }

  const renderList = (list: AgencyConfig[]) => (
    <ul className="space-y-2" aria-live="polite">
      {list.map(a=> (
        <li key={a.id} className="p-2 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <strong className="text-[11px] uppercase tracking-wide">{a.name}</strong>
            <span className="opacity-70">{a.commissionPct}%</span>
            <span className="ml-auto opacity-60">{a.territoryMode}</span>
            <button aria-label={t('settings.agencies.remove')} className="px-2 py-0.5 rounded bg-red-500/70 text-white hover:bg-red-500" onClick={()=> setConfirmId(a.id)}>×</button>
          </div>
          {a.territoryMode==='continents' && a.continents?.length ? (<div className="opacity-70">{a.continents.join(', ')}</div>) : null}
          {a.territoryMode==='countries' && a.countries?.length ? (<div className="opacity-70 break-all">{a.countries.join(', ')}</div>) : null}
        </li>
      ))}
      {list.length===0 && <li className="text-[11px] opacity-60">{t('settings.agencies.none')}</li>}
    </ul>
  );

  const AgencyForm: React.FC<{ draft: ReturnType<typeof emptyDraft>; setDraft: any; countries: string; setCountries: any; type: 'booking'|'management' }> = ({ draft, setDraft, countries, setCountries, type }) => (
    <div className="space-y-2 border rounded p-3 bg-slate-100 dark:bg-white/5 border-white/10">
      <div className="flex gap-2 items-end">
        <label className="flex-1 text-xs">
          <span className="block mb-1 opacity-70">{t('settings.agencies.name')}</span>
          <input className="w-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded px-2 py-1 text-sm" value={draft.name} onChange={e=> setDraft({ ...draft, name:e.target.value })} />
        </label>
        <label className="w-28 text-xs">
          <span className="block mb-1 opacity-70">{t('settings.agencies.commission')}</span>
            <input type="number" min={0} max={100} className="w-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded px-2 py-1 text-sm" value={draft.commissionPct} onChange={e=> setDraft({ ...draft, commissionPct:Number(e.target.value) })} />
        </label>
      </div>
      <label className="text-xs block">
        <span className="block mb-1 opacity-70">{t('settings.agencies.territoryMode')}</span>
        <select className="bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded px-2 py-1 text-sm" value={draft.territoryMode} onChange={e=> setDraft({ ...draft, territoryMode: e.target.value as AgencyTerritoryMode })}>
          {territoryModes.map(m=> <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </label>
      {draft.territoryMode==='continents' && (
        <div className="flex flex-wrap gap-2 text-xs">
          {continents.map(c=> {
            const active = (draft as any).continents?.includes(c.code);
            return <button type="button" key={c.code} onClick={()=>{
              const set = new Set(draft.continents||[]);
              if (set.has(c.code)) set.delete(c.code); else set.add(c.code);
              setDraft({ ...draft, continents: Array.from(set) });
            }} className={`px-2 py-1 rounded border ${active? 'bg-accent-500 text-black border-transparent':'bg-slate-200 dark:bg-white/10 border-slate-200 dark:border-white/10 hover:bg-white/15'}`}>{c.label}</button>;
          })}
        </div>
      )}
      {draft.territoryMode==='countries' && (
        <label className="block text-xs">
          <span className="block mb-1 opacity-70">{t('settings.agencies.countries')}</span>
          <textarea className="w-full h-16 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded px-2 py-1 text-xs" value={countries} onChange={e=> setCountries(e.target.value)} placeholder="US CA ES..." />
        </label>
      )}
      <div className="flex gap-2">
        <button disabled={!draft.name} onClick={()=> submit(draft, { countriesStr: countries }, setDraft, setCountries)} className="px-3 py-1.5 rounded bg-accent-500 text-black disabled:opacity-40 text-xs">{type==='booking'? t('settings.agencies.addBooking') : t('settings.agencies.addManagement')}</button>
        <button type="button" onClick={()=>{ setDraft(emptyDraft(type)); setCountries(''); }} className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 text-xs">{t('settings.agencies.reset')}</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* lightweight message area for a11y announcements */}
      <div role="status" aria-live="polite" className="text-xs text-amber-300" hidden={!message}>{message}</div>
      <section>
        <header className="flex items-center gap-3 mb-2">
          <h3 className="text-sm font-semibold tracking-wide">{t('settings.agencies.booking')}</h3>
          <button className="text-[11px] underline opacity-70 hover:opacity-100" onClick={()=> setExpanded(expanded==='booking'?null:'booking')}>
            {expanded==='booking'? t('settings.agencies.hideForm') : t('settings.agencies.add')}
          </button>
          <span className="text-[11px] opacity-60 ml-auto">{bookingAgencies.length}/3</span>
        </header>
        {expanded==='booking' && <AgencyForm draft={draftBooking} setDraft={setDraftBooking} countries={countriesBooking} setCountries={setCountriesBooking} type="booking" />}
        {renderList(bookingAgencies)}
      </section>
      <section>
        <header className="flex items-center gap-3 mb-2">
          <h3 className="text-sm font-semibold tracking-wide">{t('settings.agencies.management')}</h3>
          <button className="text-[11px] underline opacity-70 hover:opacity-100" onClick={()=> setExpanded(expanded==='management'?null:'management')}>
            {expanded==='management'? t('settings.agencies.hideForm') : t('settings.agencies.add')}
          </button>
          <span className="text-[11px] opacity-60 ml-auto">{managementAgencies.length}/3</span>
        </header>
        {expanded==='management' && <AgencyForm draft={draftMgmt} setDraft={setDraftMgmt} countries={countriesMgmt} setCountries={setCountriesMgmt} type="management" />}
        {renderList(managementAgencies)}
      </section>

      {/* confirm delete dialog */}
      {confirmId && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-slate-200 dark:border-white/10 rounded p-4 w-full max-w-sm">
            <h4 className="font-semibold mb-2 text-sm">{t('shows.editor.delete.confirmTitle')}</h4>
            <p className="text-xs opacity-80 mb-3">{t('shows.editor.delete.confirmBody')}</p>
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 text-xs" onClick={()=> setConfirmId(null)}>{t('common.cancel')}</button>
              <button className="px-3 py-1.5 rounded bg-red-500 text-white text-xs" onClick={()=>{ if (confirmId) removeAgency(confirmId); setConfirmId(null); setMessage(t('settings.agencies.remove')); }}>{t('shows.editor.delete.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencySettings;
