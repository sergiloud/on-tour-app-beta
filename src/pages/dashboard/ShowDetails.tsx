import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShows } from '../../hooks/useShows';
import { Card } from '../../ui/Card';
import { useMissionControl } from '../../context/MissionControlContext';
import StatusBadge from '../../ui/StatusBadge';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { countryLabel } from '../../lib/countries';

const ShowDetails: React.FC = () => {
  const { id } = useParams();
  const { shows } = useShows();
  const { setFocus } = useMissionControl();
  const { fmtMoney, lang } = useSettings();
  const show = useMemo(() => shows.find(s => s.id === id), [shows, id]);

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
      <div className="grid md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="opacity-70 text-sm">{t('common.date') || 'Date'}</div>
          <div className="font-semibold">{date}</div>
        </Card>
        <Card className="p-4">
          <div className="opacity-70 text-sm">{t('common.fee') || 'Fee'}</div>
          <div className="font-semibold tabular-nums">{money}</div>
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
    </div>
  );
};

export default ShowDetails;
