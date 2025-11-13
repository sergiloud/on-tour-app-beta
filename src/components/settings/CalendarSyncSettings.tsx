/**
 * Calendar Sync Settings Component
 * 
 * UI for configuring Apple Calendar / iCloud calendar synchronization
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, RefreshCw, Check, AlertCircle, Info, ExternalLink, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { t } from '../../lib/i18n';
import * as calendarSyncApi from '../../services/calendarSyncApi';
import type { Calendar, SyncStatus } from '../../services/calendarSyncApi';

export function CalendarSyncSettings() {
  const [connected, setConnected] = useState(false);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SyncStatus>({ enabled: false });
  const [showInstructions, setShowInstructions] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  
  const { success, error } = useToast();

  // Load sync status on mount
  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      const data = await calendarSyncApi.getCalendarSyncStatus('current-user-id'); // TODO: Get from auth
      setStatus(data);
      setConnected(data.enabled);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleConnect = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await calendarSyncApi.connectToCalendar(
        {
          provider: 'icloud',
          email,
          password,
        },
        'current-user-id' // TODO: Get from auth context
      );

      setCalendars(data.calendars);
      setCredentials(data.credentials);
      setConnected(true);
      success('✓ Connected to iCloud Calendar');
    } catch (err) {
      error(
        err instanceof Error ? err.message : 'Failed to connect to iCloud'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEnableSync = async (direction: 'import' | 'export' | 'bidirectional') => {
    if (!selectedCalendar || !credentials) return;

    setLoading(true);
    try {
      await calendarSyncApi.enableCalendarSync(
        selectedCalendar,
        direction,
        credentials,
        'current-user-id' // TODO: Get from auth context
      );

      success('✓ Calendar sync enabled successfully');
      await loadSyncStatus();
    } catch (err) {
      error(
        err instanceof Error ? err.message : 'Failed to enable sync'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const { result } = await calendarSyncApi.syncNow('current-user-id'); // TODO: Get from auth

      success(
        `✓ Synced: ${result.imported} imported, ${result.exported} exported`
      );
      await loadSyncStatus();
    } catch (err) {
      error(
        err instanceof Error ? err.message : 'Sync failed'
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleDisable = async () => {
    try {
      await calendarSyncApi.disableCalendarSync('current-user-id'); // TODO: Get from auth

      setConnected(false);
      setStatus({ enabled: false });
      success('Calendar sync disabled');
    } catch (err) {
      error('Failed to disable sync');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-600/10 flex items-center justify-center border border-white/5">
            <Apple className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Apple Calendar Sync
            </h2>
            <p className="text-sm text-slate-500 dark:text-white/60">
              Sync with iCloud shared calendars
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-sm text-accent-500 hover:text-accent-400 flex items-center gap-1"
        >
          <Info className="w-4 h-4" />
          Setup Guide
        </button>
      </div>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass rounded-2xl border border-white/10 p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Setup Instructions</h3>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-white/80">
                <div>
                  <h4 className="font-medium text-white mb-2">1. Generate App-Specific Password</h4>
                  <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Go to <a href="https://appleid.apple.com" target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:underline inline-flex items-center gap-1">appleid.apple.com <ExternalLink className="w-3 h-3" /></a></li>
                    <li>Sign in with your Apple ID</li>
                    <li>Navigate to Security → App-Specific Passwords</li>
                    <li>Click "Generate password"</li>
                    <li>Enter "On Tour App" as the label</li>
                    <li>Copy the generated password</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">2. Connect Calendar</h4>
                  <p>Use your iCloud email and the app-specific password (not your regular password) to connect.</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Never use your main Apple ID password. Only use app-specific passwords.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Form */}
      {!connected ? (
        <ConnectionForm onConnect={handleConnect} loading={loading} />
      ) : (
        <div className="space-y-6">
          {/* Connected Status */}
          <div className="glass rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Connected to iCloud</p>
                {status.lastSync && (
                  <p className="text-xs text-white/60">
                    Last synced: {new Date(status.lastSync).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={handleDisable}
                className="text-sm text-red-400 hover:text-red-300 transition"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Calendar Selection */}
          {calendars.length > 0 && !status.enabled && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">Select Calendar to Sync</h3>
              <div className="space-y-2">
                {calendars.map((cal) => (
                  <label
                    key={cal.url}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition"
                  >
                    <input
                      type="radio"
                      name="calendar"
                      value={cal.url}
                      checked={selectedCalendar === cal.url}
                      onChange={(e) => setSelectedCalendar(e.target.value)}
                      className="text-accent-500 focus:ring-accent-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{cal.displayName}</p>
                      {cal.description && (
                        <p className="text-xs text-white/60">{cal.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Sync Direction */}
              {selectedCalendar && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Sync Direction</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEnableSync('import')}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white transition disabled:opacity-50"
                    >
                      Import Only
                    </button>
                    <button
                      onClick={() => handleEnableSync('export')}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white transition disabled:opacity-50"
                    >
                      Export Only
                    </button>
                    <button
                      onClick={() => handleEnableSync('bidirectional')}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-sm text-white transition disabled:opacity-50"
                    >
                      Both Ways
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sync Now Button */}
          {status.enabled && (
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="w-full px-4 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Connection Form Component
function ConnectionForm({ onConnect, loading }: { onConnect: (email: string, password: string) => void; loading: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
          iCloud Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@icloud.com"
          className="w-full px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
          App-Specific Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="xxxx-xxxx-xxxx-xxxx"
          className="w-full px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
          Generate an app-specific password from appleid.apple.com
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full px-4 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Connecting...' : 'Connect to iCloud'}
      </button>
    </form>
  );
}
