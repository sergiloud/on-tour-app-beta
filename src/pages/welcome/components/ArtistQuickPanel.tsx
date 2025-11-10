import React, { useEffect, useMemo, useRef } from 'react';
import { useOrg } from '../../../context/OrgContext';
import { t } from '../../../lib/i18n';
import { listLinks, listMembers, listTeams } from '../../../lib/tenants';

export type ArtistQuickPanelProps = {
  open: boolean;
  onClose: () => void;
  artistOrgId: string;
};

const Chip: React.FC<{ label: string; kind?: 'ok'|'warn'|'info'; title?: string }> = ({ label, kind='info', title }) => (
  <span title={title} className={`px-1.5 py-0.5 rounded text-[10px] border ${kind==='ok'?'bg-emerald-500/15 text-emerald-300 border-emerald-400/20': kind==='warn'?'bg-amber-500/15 text-amber-200 border-amber-400/25':'bg-sky-500/15 text-sky-200 border-sky-400/25'}`}>{label}</span>
);

const ArtistQuickPanel: React.FC<ArtistQuickPanelProps> = ({ open, onClose, artistOrgId }) => {
  const { orgId, org } = useOrg();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(()=>{ if (open) setTimeout(()=> titleRef.current?.focus(), 0); }, [open]);
  const link = useMemo(()=> orgId ? listLinks(orgId).find(l => l.artistOrgId === artistOrgId) : undefined, [orgId, artistOrgId]);

  // Get artist info dynamically
  const artistInfo = useMemo(() => {
    const artistMembers = listMembers(artistOrgId);
    const artistName = artistMembers.length > 0 ? (artistMembers[0]?.user.name || 'Artist') : 'Artist';
    const initial = artistName.charAt(0).toUpperCase();
    return { name: artistName, initial };
  }, [artistOrgId]);

  const managers = useMemo(()=>{
    if (!orgId) return [] as string[];
    const artistTeams = listTeams(artistOrgId);
    const team = artistTeams.length > 0 ? artistTeams[0] : null;
    const members = listMembers(orgId);
    return team ? team.members.map(id => members.find(m => m.user.id === id)?.user.name || id) : [];
  }, [orgId, artistOrgId]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="artist-quickpanel-title" className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[92vw] max-w-md glass rounded-l-lg border-l border-white/15 shadow-2xl p-4 overflow-y-auto">
        <h2 id="artist-quickpanel-title" ref={titleRef} tabIndex={-1} className="text-base font-semibold">{t('welcome.artist.quickpanel.title')||'Artist snapshot'}</h2>
        {org?.type !== 'agency' ? (
          <p className="text-sm opacity-80 mt-2">{t('welcome.artist.quickpanel.onlyAgency')||'This panel is available for agencies only.'}</p>
        ) : (
          <div className="mt-3 text-sm space-y-3">
            <div>
              <div className="text-xs opacity-70 mb-1">{t('welcome.artist.quickpanel.artist')||'Artist'}</div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-[12px] flex items-center justify-center" aria-hidden>{artistInfo.initial}</span>
                <span className="font-medium">{artistInfo.name}</span>
              </div>
            </div>

            <div>
              <div className="text-xs opacity-70 mb-1">{t('welcome.section.links')||'Connections & scopes'}</div>
              {link ? (
                <div className="flex flex-wrap gap-1.5">
                  <Chip label={`${t('scopes.shows')||'Shows'}: ${link.scopes.shows}`} kind={link.scopes.shows==='write'?'ok':'info'} />
                  <Chip label={`${t('scopes.travel')||'Travel'}: ${link.scopes.travel}`} kind={link.scopes.travel==='book'?'ok':'info'} />
                  <Chip label={`${t('scopes.finance')||'Finance'}: ${link.scopes.finance}`} kind={link.scopes.finance==='read'?'warn':'info'} />
                </div>
              ) : (
                <p className="text-xs opacity-70">{t('welcome.artist.quickpanel.noLink')||'No link to this artist yet.'}</p>
              )}
            </div>

            <div>
              <div className="text-xs opacity-70 mb-1">{t('welcome.section.team')||'Your team'}</div>
              {managers.length === 0 ? (
                <p className="text-xs opacity-70">{t('empty.noPeople')||'No people yet'}</p>
              ) : (
                <ul className="text-sm space-y-1.5" role="list">
                  {managers.map((name, i)=> (
                    <li key={i} role="listitem" className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-[11px] flex items-center justify-center" aria-hidden>{(name||' ').charAt(0).toUpperCase()}</span>
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="btn-ghost" onClick={onClose}>{t('common.close')||'Close'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistQuickPanel;
