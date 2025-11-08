import React from 'react';
import { motion } from 'framer-motion';
import { Link, Lock, Eye, Edit2, CheckCircle2 } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';
import { updateLinkScopes } from '../../lib/tenants';

const ScopeToggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean)=>void; disabled?: boolean }>=({label, value, onChange, disabled})=>{
  return (
    <motion.button
      onClick={()=>!disabled && onChange(!value)}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
        value
          ? 'bg-accent-500/15 text-accent-300 border-accent-500/30 hover:border-accent-500/50'
          : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-pressed={value}
      aria-disabled={!!disabled}
    >
      {label}
    </motion.button>
  );
};

const OrgLinks: React.FC = () => {
  const { org, links, refresh } = useOrg();
  if (!org) return null;
  const isAgency = org.type === 'agency';

  return (
    <div className="px-4 sm:px-6 flex flex-col gap-4 lg:gap-5 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-md hover:shadow-accent-500/5">
        <div className="relative px-6 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  {t('org.links.title') || 'Connections'}
                </h1>
                <p className="text-xs text-white/60 mt-1">Manage your partner links and access scopes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Links Grid */}
      {!links.length ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm transition-all duration-300 p-12 text-center"
        >
          <Link className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm text-white/70 mb-1">No active connections</p>
          <p className="text-xs text-white/50">Links will appear here once established</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {links.map((l, idx) => {
            const canEdit = isAgency;
            const scopes = l.scopes;
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300"
              >
                <div className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center">
                        <Link className="w-4 h-4 text-accent-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{l.id.replace(/link_/, '')}</p>
                        <p className="text-xs text-white/50 mt-0.5">Partnership link</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${
                      l.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : 'bg-white/5 text-white/70 border-white/10'
                    }`}>
                      {l.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                      <span className="capitalize">{l.status}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-white/60 leading-relaxed">
                    {isAgency ? 'Manage access permissions for connected artists' : 'Permissions granted to your partner'}
                  </p>

                  {/* Scopes Section */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    {/* Shows */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-blue-400" />
                        <label className="text-xs font-semibold text-white">Shows</label>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <ScopeToggle label="Read" value={true} onChange={()=>{}} disabled />
                        <ScopeToggle
                          label="Write"
                          value={scopes.shows === 'write'}
                          onChange={(v) => {
                            updateLinkScopes(l.id, { shows: v ? 'write' : 'read' });
                            refresh();
                          }}
                          disabled={!canEdit}
                        />
                      </div>
                    </div>

                    {/* Travel */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Edit2 className="w-4 h-4 text-purple-400" />
                        <label className="text-xs font-semibold text-white">Travel</label>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <ScopeToggle label="Read" value={true} onChange={()=>{}} disabled />
                        <ScopeToggle
                          label="Book"
                          value={scopes.travel === 'book'}
                          onChange={(v) => {
                            updateLinkScopes(l.id, { travel: v ? 'book' : 'read' });
                            refresh();
                          }}
                          disabled={!canEdit}
                        />
                      </div>
                    </div>

                    {/* Finance */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-red-400" />
                        <label className="text-xs font-semibold text-white">Finance</label>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <ScopeToggle
                          label="None"
                          value={scopes.finance === 'none'}
                          onChange={(v) => {
                            updateLinkScopes(l.id, { finance: v ? 'none' : 'read' });
                            refresh();
                          }}
                          disabled={!canEdit}
                        />
                        <ScopeToggle
                          label="Read"
                          value={scopes.finance === 'read'}
                          onChange={(v) => {
                            updateLinkScopes(l.id, { finance: v ? 'read' : 'none' });
                            refresh();
                          }}
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <p className="text-[11px] text-white/50 leading-relaxed border-t border-white/10 pt-3">
                    {isAgency
                      ? '💡 Agencies can manage scope permissions. Export access is always restricted in this demo.'
                      : '🔒 Contact your partner to adjust these permissions'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
      >
        <div className="flex items-start gap-3">
          <Link className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white mb-1">Connection Scopes</p>
            <p className="text-xs text-white/60 leading-relaxed">
              Control what data and features your partners can access. Permissions are managed from the agency side.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrgLinks;
