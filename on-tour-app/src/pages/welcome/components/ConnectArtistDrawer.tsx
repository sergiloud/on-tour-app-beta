import React, { useEffect, useMemo, useRef } from 'react';
import { ORG_ARTIST_DANNY, addOrGetLink, listLinks } from '../../../lib/tenants';
import { useOrg } from '../../../context/OrgContext';
import { t } from '../../../lib/i18n';
import { Events } from '../../../lib/telemetry';

export const ConnectArtistDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { orgId, org } = useOrg();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(()=>{ if (open) setTimeout(()=> titleRef.current?.focus(), 0); }, [open]);
  const existing = useMemo(()=> (orgId ? listLinks(orgId) : []).find(l => l.artistOrgId === ORG_ARTIST_DANNY), [orgId]);
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="connect-artist-title" className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[92vw] max-w-md glass rounded-l-lg border-l border-white/15 shadow-2xl p-4 overflow-y-auto">
        <h2 id="connect-artist-title" ref={titleRef} tabIndex={-1} className="text-base font-semibold">{t('welcome.cta.connectArtist') || 'Connect artist'}</h2>
        {org?.type !== 'agency' ? (
          <p className="text-sm opacity-80 mt-2">{t('welcome.connect.artist.onlyAgency') || 'Only agencies can link to artists in this demo.'}</p>
        ) : existing ? (
          <div className="mt-3 text-sm">
            <p className="opacity-85">{t('welcome.connect.artist.already') || 'Already connected with Danny Avila.'}</p>
            <p className="text-xs opacity-70 mt-1">{t('welcome.connect.artist.scopesHint') || 'You can adjust scopes from Organization → Links later.'}</p>
            <div className="mt-4 text-right">
              <button className="px-3 py-1.5 rounded bg-accent-500 text-black text-sm shadow-glow" onClick={onClose}>{t('common.done') || 'Done'}</button>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-sm">
            <p className="opacity-85">{t('welcome.connect.artist.prompt') || 'Link your agency to artist Danny Avila to manage shows, travel and reports.'}</p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="btn-ghost" onClick={onClose}>{t('common.cancel') || 'Cancel'}</button>
              <button
                className="px-3 py-1.5 rounded bg-accent-500 text-black text-sm shadow-glow"
                onClick={()=>{
                  try { addOrGetLink(orgId, ORG_ARTIST_DANNY); Events.welcomeCta('link'); } catch {}
                  onClose();
                }}
              >{t('welcome.connect.artist.cta') || 'Connect with Danny'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectArtistDrawer;
