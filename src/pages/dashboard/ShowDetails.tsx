import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShows } from '../../hooks/useShows';
import { Card } from '../../ui/Card';
import { useMissionControl } from '../../context/MissionControlContext';
import StatusBadge from '../../ui/StatusBadge';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { countryLabel } from '../../lib/countries';
import ContractsList from '../../components/contracts/ContractsList';
import { breakdownNet } from '../../lib/computeNet';

const ShowDetails: React.FC = () => {
  const { id } = useParams();
  const { shows } = useShows();
  const { setFocus } = useMissionControl();
  const { fmtMoney, lang } = useSettings();
  const show = useMemo(() => shows.find(s => s.id === id), [shows, id]);

  const breakdown = useMemo(() => {
    if (!show) return null;
    return breakdownNet(show);
  }, [show]);

  if (!show) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-sm">
        <Card className="p-4">
          <div className="font-semibold mb-2">{t('shows.notFound') || 'Show not found'}</div>
          <Link to="/dashboard/shows" className="text-accent-400 hover:underline">{t('common.back') || 'Back'}</Link>
        </Card>
      </div>
    );
  }

  const money = fmtMoney(show.fee);
  const date = new Date(show.date).toLocaleString();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">{show.city}, {countryLabel(show.country, lang)}</h2>
        <Link to="/dashboard/shows" className="text-sm px-3 py-2 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/15">{t('common.back') || 'Back'}</Link>
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Fee */}
        <Card className="p-4">
          <div className="opacity-70 text-xs mb-1">{t('common.fee') || 'Fee'}</div>
          <div className="font-semibold text-lg tabular-nums">{money}</div>
        </Card>

        {/* VAT */}
        {breakdown && breakdown.vat > 0 && (
          <Card className="p-4 bg-green-500/10 border-green-500/20">
            <div className="opacity-70 text-xs mb-1 text-green-300">{t('shows.editor.summary.vat') || 'VAT'}</div>
            <div className="font-semibold text-lg tabular-nums text-green-400">+{fmtMoney(breakdown.vat)}</div>
            {show.vatPct && <div className="text-xs text-green-500 mt-0.5">{show.vatPct}%</div>}
          </Card>
        )}

        {/* Invoice Total */}
        {breakdown && breakdown.invoiceTotal > show.fee && (
          <Card className="p-4 bg-blue-500/10 border-blue-500/20">
            <div className="opacity-70 text-xs mb-1 text-blue-300">{t('shows.editor.summary.invoiceTotal') || 'Invoice Total'}</div>
            <div className="font-semibold text-lg tabular-nums text-blue-400">{fmtMoney(breakdown.invoiceTotal)}</div>
            <div className="text-xs text-blue-500 mt-0.5">{t('shows.editor.summary.clientPays') || 'Client pays'}</div>
          </Card>
        )}

        {/* WHT */}
        {breakdown && breakdown.wht > 0 && (
          <Card className="p-4 bg-white dark:bg-white/5">
            <div className="opacity-70 text-xs mb-1">{t('shows.editor.summary.wht') || 'WHT'}</div>
            <div className="font-semibold text-lg tabular-nums text-red-400">-{fmtMoney(breakdown.wht)}</div>
            {show.whtPct && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{show.whtPct}%</div>}
          </Card>
        )}

        {/* Net */}
        <Card className="p-4 bg-accent-500/12 border-accent-500/30">
          <div className="opacity-70 text-xs mb-1 text-accent-300">{t('shows.editor.summary.net') || 'Net'}</div>
          <div className="font-semibold text-lg tabular-nums text-accent-400">{breakdown ? fmtMoney(breakdown.net) : money}</div>
          <div className="text-xs text-accent-500 mt-0.5">{t('shows.editor.summary.artistReceives') || 'Artist receives'}</div>
        </Card>
      </div>

      {/* Other Info */}
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <Card className="p-4">
          <div className="opacity-70 text-sm">{t('common.date') || 'Date'}</div>
          <div className="font-semibold">{date}</div>
        </Card>
        <Card className="p-4">
          <div className="opacity-70 text-sm">{t('common.status') || 'Status'}</div>
          <div className="font-semibold capitalize"><StatusBadge status={show.status as any}>{show.status}</StatusBadge></div>
        </Card>
      </div>
      <div className="mt-4">
        <Card className="p-4 flex items-center justify-between">
          <div className="text-sm opacity-80">{t('common.map') || 'Map'}</div>
          <button
            className="text-sm px-3 py-2 rounded bg-accent-600 text-black hover:brightness-110"
            onClick={() => setFocus({ id: show.id, lng: show.lng, lat: show.lat })}
          >{t('common.centerMap') || 'Center map'}: {show.city}</button>
        </Card>
      </div>

      {/* Contracts Section */}
      <div className="mt-6">
        <Card className="p-6">
          <ContractsList 
            showId={show.id} 
            showName={`${show.city}, ${countryLabel(show.country, lang)}`}
          />
        </Card>
      </div>
    </div>
  );
};

export default ShowDetails;
