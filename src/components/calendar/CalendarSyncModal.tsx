/**
 * Calendar Sync Modal - Quick sync configuration from calendar view
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Check, AlertCircle, Apple, Calendar as CalendarIcon, Link, Info } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { t } from '../../lib/i18n';
import * as calendarSyncApi from '../../services/calendarSyncApi';
import type { Calendar, SyncStatus } from '../../services/calendarSyncApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarSyncModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<'connect' | 'select' | 'syncing'>('connect');
  const [provider, setProvider] = useState<'icloud' | 'google' | 'caldav'>('icloud');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [calendarUrl, setCalendarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>('');
  const [credentials, setCredentials] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  
  const { success, error, info } = useToast();

  // Load sync status on mount
  useEffect(() => {
    if (isOpen) {
      loadSyncStatus();
    }
  }, [isOpen]);

  const loadSyncStatus = async () => {
    try {
      const status = await calendarSyncApi.getCalendarSyncStatus('current-user-id'); // TODO: Get from auth
      setSyncStatus(status);
      if (status.enabled) {
        setStep('syncing');
      }
    } catch (err) {
      // Not configured yet
    }
  };

  const handleConnect = async () => {
    if (provider === 'caldav' && !calendarUrl) {
      error('Please enter calendar URL');
      return;
    }
    
    if ((provider === 'icloud' || provider === 'google') && (!email || !password)) {
      error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const serverUrl = provider === 'caldav' ? calendarUrl : undefined;
      const data = await calendarSyncApi.connectToCalendar(
        {
          provider,
          email,
          password,
          serverUrl,
        },
        'current-user-id' // TODO: Get from auth
      );

      setCalendars(data.calendars);
      setCredentials(data.credentials);
      setStep('select');
      success('✓ Connected successfully');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableSync = async (direction: 'import' | 'export' | 'bidirectional') => {
    if (!selectedCalendar) {
      error('Please select a calendar');
      return;
    }

    setLoading(true);
    try {
      await calendarSyncApi.enableCalendarSync(
        selectedCalendar,
        direction,
        credentials,
        'current-user-id' // TODO: Get from auth
      );

      success('✓ Calendar sync enabled');
      setStep('syncing');
      await loadSyncStatus();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to enable sync');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setLoading(true);
    
    // Create wrapper for ToastContext compatibility
    const toastWrapper = (message: string, opts?: { tone?: 'info' | 'success' | 'error'; timeout?: number }) => {
      const type = opts?.tone === 'success' ? 'success' : opts?.tone === 'error' ? 'error' : 'info';
      const duration = opts?.timeout ?? 3000;
      if (type === 'success') {
        success(message, duration);
      } else if (type === 'error') {
        error(message, duration);
      } else {
        info(message, duration);
      }
    };
    
    try {
      const { result } = await calendarSyncApi.syncNow('current-user-id', toastWrapper);
      success(`✓ Synced: ${result.imported} imported, ${result.exported} exported`);
      await loadSyncStatus();
    } catch (err) {
      // Error already shown by syncNow()
      error(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await calendarSyncApi.disableCalendarSync('current-user-id'); // TODO: Get from auth
      success('Calendar sync disabled');
      setStep('connect');
      setSyncStatus(null);
      setCalendars([]);
      setSelectedCalendar('');
      setEmail('');
      setPassword('');
      setCalendarUrl('');
    } catch (err) {
      error('Failed to disable sync');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center border border-accent-500/20">
                <RefreshCw className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Calendar Sync</h2>
                <p className="text-xs text-white/60">
                  {step === 'connect' && 'Connect your calendar'}
                  {step === 'select' && 'Select calendar to sync'}
                  {step === 'syncing' && 'Sync active'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Step: Connect */}
          {step === 'connect' && (
            <div className="space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setProvider('icloud')}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                      provider === 'icloud'
                        ? 'border-accent-500 bg-accent-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <Apple className="w-5 h-5" />
                    <span className="text-xs font-medium">iCloud</span>
                  </button>
                  <button
                    onClick={() => setProvider('google')}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                      provider === 'google'
                        ? 'border-accent-500 bg-accent-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <CalendarIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Google</span>
                  </button>
                  <button
                    onClick={() => setProvider('caldav')}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                      provider === 'caldav'
                        ? 'border-accent-500 bg-accent-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <Link className="w-5 h-5" />
                    <span className="text-xs font-medium">CalDAV</span>
                  </button>
                </div>
              </div>

              {/* CalDAV URL */}
              {provider === 'caldav' && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Calendar URL
                  </label>
                  <input
                    type="url"
                    value={calendarUrl}
                    onChange={(e) => setCalendarUrl(e.target.value)}
                    placeholder="https://caldav.example.com/calendars/..."
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    <Info className="w-3 h-3 inline mr-1" />
                    Enter your CalDAV server URL
                  </p>
                </div>
              )}

              {/* Email/Password for iCloud & Google */}
              {(provider === 'icloud' || provider === 'google') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={provider === 'icloud' ? 'you@icloud.com' : 'you@gmail.com'}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      {provider === 'icloud' ? 'App-Specific Password' : 'App Password'}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="xxxx-xxxx-xxxx-xxxx"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                    <p className="text-xs text-white/50 mt-1">
                      <Info className="w-3 h-3 inline mr-1" />
                      {provider === 'icloud' 
                        ? 'Generate at appleid.apple.com → Security → App-Specific Passwords'
                        : 'Generate at myaccount.google.com → Security → 2-Step Verification → App passwords'
                      }
                    </p>
                  </div>
                </>
              )}

              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          )}

          {/* Step: Select Calendar */}
          {step === 'select' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Select Calendar to Sync
                </label>
                <p className="text-xs text-white/50 mb-3">
                  Choose an event calendar (task/reminder calendars are filtered out)
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
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
                      <CalendarIcon className="w-4 h-4 text-accent-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{cal.displayName}</p>
                        {cal.description && (
                          <p className="text-xs text-white/60 truncate">{cal.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Sync Direction
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleEnableSync('import')}
                    disabled={loading || !selectedCalendar}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white transition disabled:opacity-50"
                  >
                    Import
                  </button>
                  <button
                    onClick={() => handleEnableSync('export')}
                    disabled={loading || !selectedCalendar}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white transition disabled:opacity-50"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleEnableSync('bidirectional')}
                    disabled={loading || !selectedCalendar}
                    className="px-3 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-sm text-white transition disabled:opacity-50"
                  >
                    Both
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep('connect')}
                className="w-full px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition"
              >
                Back
              </button>
            </div>
          )}

          {/* Step: Syncing */}
          {step === 'syncing' && syncStatus && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Sync Active</p>
                    {syncStatus.lastSync && (
                      <p className="text-xs text-white/60">
                        Last synced: {new Date(syncStatus.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {syncStatus.calendarName && (
                <div className="text-sm text-white/80">
                  <span className="text-white/60">Calendar:</span> {syncStatus.calendarName}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSyncNow}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>

              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm transition"
              >
                Disconnect
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
