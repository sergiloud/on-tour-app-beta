import React, { useState } from 'react';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';

const OrgBranding: React.FC = () => {
  const { org, settings, updateSettings } = useOrg();
  const [logoUrl, setLogoUrl] = useState(settings.branding?.logoUrl || '');
  const [color, setColor] = useState(settings.branding?.color || '#9ae6b4');
  if (!org || org.type !== 'artist') return null;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('org.branding.title')||'Branding'}</h2>
      <div className="glass rounded border border-white/10 p-4 space-y-3">
        <label className="block text-sm">
          <span className="block text-xs opacity-70">Logo URL</span>
          <input className="mt-1 w-full bg-white/5 rounded px-2 py-1 border border-white/10" value={logoUrl} onChange={(e)=> setLogoUrl(e.target.value)} placeholder="https://…" />
        </label>
        <label className="block text-sm">
          <span className="block text-xs opacity-70">Color</span>
          <input type="color" className="mt-1 w-24 h-8 p-0 border border-white/10 rounded" value={color} onChange={(e)=> setColor(e.target.value)} />
        </label>
        <button className="btn" onClick={()=> updateSettings({ branding: { logoUrl, color } })}>{t('common.save')||'Save'}</button>
      </div>
    </div>
  );
};

export default OrgBranding;
