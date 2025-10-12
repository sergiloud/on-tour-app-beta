import React from 'react';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';
import { updateLinkScopes } from '../../lib/tenants';

const ScopeToggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean)=>void; disabled?: boolean }>=({label, value, onChange, disabled})=>{
  return (
    <label className="inline-flex items-center gap-2 text-xs">
      <span className="opacity-70">{label}</span>
      <button
        type="button"
        onClick={()=>!disabled && onChange(!value)}
        className={`px-2 py-0.5 rounded border ${value ? 'bg-accent-500 text-black border-accent-400' : 'bg-white/5 text-white/80 border-white/10'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-pressed={value}
        aria-disabled={!!disabled}
      >{value ? t('common.on') || 'on' : t('common.off') || 'off'}</button>
    </label>
  );
};

const OrgLinks: React.FC = () => {
  const { org, links, refresh } = useOrg();
  if (!org) return null;
  const isAgency = org.type === 'agency';
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('org.links.title')||'Links'}</h2>
      {!links.length && <div className="text-xs opacity-70">No links</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {links.map(l => {
          const canEdit = isAgency; // edit from agency side in demo
          const scopes = l.scopes;
          return (
            <div key={l.id} className="glass rounded border border-white/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{l.id.replace(/link_/,'')}</div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${l.status==='active'?'bg-emerald-500/15 text-emerald-300 border-emerald-500/30':'bg-white/5 text-white/70 border-white/10'}`}>{l.status}</span>
              </div>
              <div className="text-xs opacity-70">Agency ↔ Artist scopes</div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-20 opacity-70">Shows</span>
                  <ScopeToggle label="read" value={true} onChange={()=>{}} disabled />
                  <ScopeToggle label="write" value={scopes.shows==='write'} onChange={(v)=>{ updateLinkScopes(l.id, { shows: v ? 'write' : 'read' }); refresh(); }} disabled={!canEdit} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-20 opacity-70">Travel</span>
                  <ScopeToggle label="read" value={true} onChange={()=>{}} disabled />
                  <ScopeToggle label="book" value={scopes.travel==='book'} onChange={(v)=>{ updateLinkScopes(l.id, { travel: v ? 'book' : 'read' }); refresh(); }} disabled={!canEdit} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-20 opacity-70">Finance</span>
                  <ScopeToggle label="none" value={scopes.finance==='none'} onChange={(v)=>{ updateLinkScopes(l.id, { finance: v ? 'none' : 'read' }); refresh(); }} disabled={!canEdit} />
                  <ScopeToggle label="read" value={scopes.finance==='read'} onChange={(v)=>{ updateLinkScopes(l.id, { finance: v ? 'read' : 'none' }); refresh(); }} disabled={!canEdit} />
                </div>
              </div>
              <div className="text-[11px] opacity-70">Export is always disabled for agencies in this demo.</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrgLinks;
