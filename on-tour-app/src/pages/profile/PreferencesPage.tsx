import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useHighContrast } from '../../context/HighContrastContext';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../lib/i18n';

const Row: React.FC<{ label: string; children: React.ReactNode }>=({label, children})=> (
  <label className="flex items-center justify-between gap-3 text-sm">
    <span className="opacity-80">{label}</span>
    <span>{children}</span>
  </label>
);

const PreferencesPage: React.FC = () => {
  const { lang, setLang, currency, setCurrency, unit, setUnit, presentationMode, setPresentationMode, comparePrev, setComparePrev, region, setRegion } = useSettings();
  const { highContrast, toggleHC } = useHighContrast();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto p-3 space-y-4">
      <h1 className="text-lg font-semibold">{t('prefs.title')||'Preferences'}</h1>
      <section className="glass rounded p-4 border border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('prefs.appearance')||'Appearance'}</h2>
        <div className="space-y-2">
          <Row label={t('prefs.language')||'Language'}>
            <select value={lang} onChange={e=> setLang(e.target.value as any)} className="bg-white/5 border border-white/12 rounded px-2 py-1">
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </Row>
          <p className="text-[11px] opacity-70">{t('prefs.help.language')||'Affects labels and date/number formatting.'}</p>
          <Row label={t('prefs.theme')||'Theme'}>
            <select value={theme} onChange={e=> setTheme(e.target.value as any)} className="bg-white/5 border border-white/12 rounded px-2 py-1">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </Row>
          <p className="text-[11px] opacity-70">{t('prefs.help.theme')||'Choose light or dark based on your environment.'}</p>
          <Row label={t('prefs.highContrast')||'High contrast'}>
            <button onClick={toggleHC} className="px-2 py-1 rounded bg-white/5 border border-white/12" aria-pressed={highContrast}>{highContrast? 'On':'Off'}</button>
          </Row>
          <p className="text-[11px] opacity-70">{t('prefs.help.highContrast')||'Improves contrast and focus rings for readability.'}</p>
        </div>
      </section>
      <section className="glass rounded p-4 border border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('finance.quicklook')||'Finance'}</h2>
        <div className="space-y-2">
          <Row label={t('prefs.finance.currency')||'Currency'}>
            <select value={currency} onChange={e=> setCurrency(e.target.value as any)} className="bg-white/5 border border-white/12 rounded px-2 py-1">
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </Row>
          <p className="text-[11px] opacity-70">{t('prefs.help.currency')||'Sets default currency for dashboards and exports.'}</p>
          <Row label={t('prefs.units')||'Distance units'}>
            <select value={unit} onChange={e=> setUnit(e.target.value as any)} className="bg-white/5 border border-white/12 rounded px-2 py-1">
              <option value="km">km</option>
              <option value="mi">mi</option>
            </select>
          </Row>
          <p className="text-[11px] opacity-70">{t('prefs.help.units')||'Used for travel distances and map overlays.'}</p>
        </div>
      </section>
      <section className="glass rounded p-4 border border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('prefs.presentation')||'Presentation'}</h2>
        <div className="space-y-2">
          <Row label={t('prefs.presentation')||'Presentation mode'}>
            <input type="checkbox" checked={presentationMode} onChange={e=> setPresentationMode(e.target.checked)} />
          </Row>
          <p className="text-[11px] opacity-70">{t('prefs.help.presentation')||'Larger text, simplified animations for demos.'}</p>
          <Row label={t('prefs.comparePrev')||'Compare vs previous'}>
            <input type="checkbox" checked={comparePrev} onChange={e=> setComparePrev(e.target.checked)} />
          </Row>
          <p className="text-[11px] opacity-70">{t('prefs.help.comparePrev')||'Shows deltas against the previous period.'}</p>
        </div>
      </section>
      <section className="glass rounded p-4 border border-white/10 space-y-3">
        <h2 className="text-sm font-semibold">{t('prefs.defaultRegion')||'Default region'}</h2>
        <div className="space-y-2">
          <Row label={t('filters.region')||'Region'}>
            <select value={region} onChange={e=> setRegion(e.target.value as any)} className="bg-white/5 border border-white/12 rounded px-2 py-1">
              <option value="all">All</option>
              <option value="AMER">Americas</option>
              <option value="EMEA">EMEA</option>
              <option value="APAC">APAC</option>
            </select>
          </Row>
          <p className="text-[11px] opacity-70">{t('prefs.help.region')||'Preselects region filters in dashboards.'}</p>
          <p className="text-xs opacity-70">{t('prefs.defaultStatuses')||'Default statuses and filters coming later in this demo.'}</p>
        </div>
      </section>
    </div>
  );
};

export default PreferencesPage;
