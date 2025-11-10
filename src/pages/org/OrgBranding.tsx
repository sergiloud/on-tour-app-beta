import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Save, ArrowRight } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';

const OrgBranding: React.FC = () => {
  const { org, settings, updateSettings } = useOrg();
  const [logoUrl, setLogoUrl] = useState(settings.branding?.logoUrl || '');
  const [color, setColor] = useState(settings.branding?.color || '#9ae6b4');
  const [saved, setSaved] = useState(false);

  if (!org || org.type !== 'artist') {
    return (
      <motion.div className="max-w-[1400px] mx-auto px-3 md:px-4 flex items-center justify-center py-12" layoutId="org-branding">
        <p className="text-xs text-slate-500 dark:text-white/70">Branding settings available for artists only</p>
      </motion.div>
    );
  }

  const handleSave = () => {
    updateSettings({ branding: { logoUrl, color } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-4 pb-8" layoutId="org-branding">
      {/* Header */}
      <div className="glass rounded-lg border border-slate-200 dark:border-white/10 p-3 md:p-4 bg-gradient-to-r from-slate-100 dark:from-white/6 to-white/3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
            <div>
              <h1 className="text-sm md:text-base font-semibold tracking-tight text-slate-700 dark:text-white/90">
                {t('org.branding.title') || 'Branding'}
              </h1>
              <p className="text-xs text-slate-400 dark:text-white/60 mt-1">Customize your artist profile appearance</p>
            </div>
          </div>

          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 border border-accent-500/30 hover:border-accent-500/50 hover:from-accent-500/35 hover:via-accent-500/25 hover:to-accent-600/20 text-accent-200 font-semibold text-xs transition-all duration-300 shadow-lg shadow-accent-500/10"
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? 'Saved!' : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      {/* Branding Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg border border-slate-200 dark:border-white/10 p-3 md:p-4 bg-gradient-to-r from-slate-100 dark:from-white/6 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center border border-accent-500/20">
              <Palette className="w-4 h-4 text-accent-300" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-white/90">Logo</h3>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-slate-500 dark:text-white/70 mb-2 block uppercase tracking-wide">Logo URL</span>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-white/8 border border-slate-200 dark:border-white/10 focus:border-accent-500/30 text-sm text-white placeholder-slate-400 dark:placeholder-slate-400 dark:placeholder-white/40 transition-all focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 dark:text-white/60 mt-2">Enter the URL of your logo image</p>
          </label>

          {logoUrl && (
            <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center h-24">
              <img src={logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
            </div>
          )}
        </motion.div>

        {/* Color Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-lg border border-slate-200 dark:border-white/10 p-3 md:p-4 bg-gradient-to-r from-slate-100 dark:from-white/6 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center border border-accent-500/20">
              <Palette className="w-4 h-4 text-accent-300" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-white/90">Primary Color</h3>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-slate-500 dark:text-white/70 mb-3 block uppercase tracking-wide">Brand Color</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-16 p-1 rounded-lg border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 cursor-pointer transition-colors"
              />
              <div>
                <p className="text-sm font-mono text-slate-700 dark:text-white/90">{color}</p>
                <p className="text-[11px] text-slate-400 dark:text-white/60 mt-1">Your brand's primary color</p>
              </div>
            </div>
          </label>

          <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-white/70 font-semibold">Preview</span>
              <motion.div
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: color }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Button (Mobile) */}
      <motion.button
        onClick={handleSave}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="lg:hidden w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 border border-accent-500/30 hover:border-accent-500/50 text-accent-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-500/10"
      >
        <Save className="w-3.5 h-3.5" />
        {saved ? 'Saved!' : 'Save Changes'}
      </motion.button>

      {/* Info Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="glass rounded-lg border border-slate-200 dark:border-white/10 p-3 md:p-4 bg-gradient-to-r from-slate-100 dark:from-white/6 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center flex-shrink-0 mt-0.5 border border-accent-500/20">
            <Palette className="w-4 h-4 text-accent-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-700 dark:text-white/90 mb-1">Pro Tip</h3>
            <p className="text-xs text-slate-500 dark:text-white/70">Your branding settings will be visible on your public artist profile and shared with your network.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrgBranding;

