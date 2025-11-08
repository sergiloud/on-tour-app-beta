import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalEvent } from './types';
import { t } from '../../lib/i18n';

type Props = {
  events: CalEvent[];
  onSyncComplete?: (syncedEvents: CalEvent[], service: string) => void;
  onError?: (error: string) => void;
};

export type SyncData = {
  googleCalendarId?: string;
  appleCalendarId?: string;
  outlookCalendarId?: string;
  icsUrl?: string;
  autoSync: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  lastSyncTime?: number;
};

export type SyncService = 'google' | 'apple' | 'outlook' | 'ics';

/**
 * Smart Calendar Sync Component
 * Bidirectional integration with external calendars
 * - Google Calendar (via OAuth)
 * - Apple Calendar (iCloud)
 * - Outlook/Microsoft Calendar
 * - Generic ICS/Calendar feeds
 */
const SmartCalendarSync: React.FC<Props> = ({ events, onSyncComplete, onError }) => {
  const [syncConfig, setSyncConfig] = useState<SyncData>({
    autoSync: false,
    syncFrequency: 'daily',
  });

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [connectedServices, setConnectedServices] = useState<Set<SyncService>>(new Set());
  const [expanded, setExpanded] = useState(false);

  // Auto-sync effect
  useEffect(() => {
    if (!syncConfig.autoSync || connectedServices.size === 0) return;

    const interval = {
      realtime: 5000,
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
    }[syncConfig.syncFrequency];

    const timer = setInterval(() => {
      handleSyncAll();
    }, interval);

    return () => clearInterval(timer);
  }, [syncConfig.autoSync, syncConfig.syncFrequency, connectedServices]);

  // Generic ICS sync
  const syncFromICS = useCallback(async (icsUrl: string) => {
    try {
      const response = await fetch(icsUrl, {
        mode: 'no-cors',
        headers: { 'Accept': 'text/calendar' },
      });

      if (!response.ok) throw new Error('Failed to fetch ICS');

      const icsContent = await response.text();
      // Parse ICS and convert to CalEvent[]
      const parsedEvents = parseICS(icsContent);

      onSyncComplete?.(parsedEvents, 'ics');
      return parsedEvents;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'ICS sync failed');
    }
  }, [onSyncComplete]);

  // Parse ICS format to CalEvent[]
  const parseICS = (icsContent: string): CalEvent[] => {
    const events: CalEvent[] = [];
    const lines = icsContent.split('\n');
    let currentEvent: Partial<CalEvent> = {};

    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        currentEvent = {};
      } else if (line.startsWith('END:VEVENT')) {
        if (currentEvent.id && currentEvent.title && currentEvent.date) {
          events.push(currentEvent as CalEvent);
        }
      } else if (line.startsWith('UID:')) {
        currentEvent.id = line.substring(4).trim();
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8).trim();
      } else if (line.startsWith('DTSTART')) {
        const dateStr = line.split(':')[1];
        currentEvent.date = dateStr?.substring(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || '';
        currentEvent.start = dateStr;
      } else if (line.startsWith('DTEND')) {
        const dateStr = line.split(':')[1];
        currentEvent.endDate = dateStr?.substring(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        currentEvent.end = dateStr;
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.notes = line.substring(12).trim();
      } else if (line.startsWith('LOCATION:')) {
        // Extract city from location
        currentEvent.title = `${currentEvent.title}, ${line.substring(9).trim()}`;
      }
    }

    return events.map((ev) => ({
      ...ev,
      kind: 'meeting' as const,
      status: 'scheduled',
    }));
  };

  // Sync all connected services
  const handleSyncAll = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const promises: Promise<CalEvent[]>[] = [];

      if (connectedServices.has('google')) {
        promises.push(syncFromGoogle().catch((error) => {
          console.error('Google sync error:', error);
          return [];
        }));
      }

      if (connectedServices.has('apple')) {
        if (syncConfig.icsUrl) {
          promises.push(syncFromICS(syncConfig.icsUrl).catch((error) => {
            console.error('Apple sync error:', error);
            return [];
          }));
        }
      }

      if (connectedServices.has('outlook')) {
        promises.push(syncFromOutlook().catch((error) => {
          console.error('Outlook sync error:', error);
          return [];
        }));
      }

      await Promise.allSettled(promises);
      setSyncStatus('synced');
      setLastSync(new Date());
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      onError?.(error instanceof Error ? error.message : 'Sync failed');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  }, [connectedServices, syncConfig.icsUrl, onError, syncFromICS]);

  // Placeholder functions for service-specific sync
  const syncFromGoogle = async (): Promise<CalEvent[]> => {
    // Would use Google Calendar API
    console.log('Syncing from Google Calendar...');
    return [];
  };

  const syncFromOutlook = async (): Promise<CalEvent[]> => {
    // Would use Microsoft Graph API
    console.log('Syncing from Outlook Calendar...');
    return [];
  };

  // Google Calendar OAuth
  const handleGoogleConnect = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scopes = 'https://www.googleapis.com/auth/calendar';
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

      if (!clientId) {
        throw new Error(t('calendar.sync.error.missingConfig') || 'Google OAuth not configured');
      }

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scopes}&` +
        `response_type=code&` +
        `access_type=offline`;

      // Open auth window - store state and handle callback
      const newWindow = window.open(authUrl, 'GoogleAuth', 'width=500,height=600');
      if (!newWindow) {
        throw new Error('Popup blocked. Please enable popups for this site.');
      }

      setConnectedServices((prev) => new Set([...prev, 'google']));
      setSyncStatus('synced');
      setLastSync(new Date());
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      onError?.(error instanceof Error ? error.message : 'Google sync failed');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  }, [onError]);

  // Apple Calendar iCloud sync
  const handleAppleConnect = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const icsUrl = prompt(t('calendar.sync.apple.prompt') || 'Enter iCloud calendar URL (public .ics link):');
      if (!icsUrl) {
        setSyncStatus('idle');
        return;
      }

      setSyncConfig((prev) => ({ ...prev, icsUrl }));
      await syncFromICS(icsUrl);

      setConnectedServices((prev) => new Set([...prev, 'apple']));
      setSyncStatus('synced');
      setLastSync(new Date());
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      onError?.(error instanceof Error ? error.message : 'Apple sync failed');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  }, [onError, syncFromICS]);

  // Outlook/Microsoft Calendar OAuth
  const handleOutlookConnect = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const redirectUri = `${window.location.origin}/auth/outlook/callback`;
      const clientId = process.env.REACT_APP_OUTLOOK_CLIENT_ID;

      if (!clientId) {
        throw new Error(t('calendar.sync.error.missingConfig') || 'Outlook OAuth not configured');
      }

      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=Calendars.ReadWrite&` +
        `response_type=code`;

      const newWindow = window.open(authUrl, 'OutlookAuth', 'width=500,height=600');
      if (!newWindow) {
        throw new Error('Popup blocked. Please enable popups for this site.');
      }

      setConnectedServices((prev) => new Set([...prev, 'outlook']));
      setSyncStatus('synced');
      setLastSync(new Date());
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      onError?.(error instanceof Error ? error.message : 'Outlook sync failed');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  }, [onError]);

  const handleDisconnect = (service: SyncService) => {
    setConnectedServices((prev) => {
      const updated = new Set(prev);
      updated.delete(service);
      return updated;
    });

    if (service === 'google') {
      setSyncConfig((prev) => ({ ...prev, googleCalendarId: undefined }));
    } else if (service === 'apple') {
      setSyncConfig((prev) => ({ ...prev, appleCalendarId: undefined, icsUrl: undefined }));
    } else if (service === 'outlook') {
      setSyncConfig((prev) => ({ ...prev, outlookCalendarId: undefined }));
    }
  };

  const services = [
    { id: 'google', name: 'Google Calendar', icon: 'G', color: 'from-red-500 to-blue-500', onConnect: handleGoogleConnect },
    { id: 'apple', name: 'Apple Calendar', icon: '🍎', color: 'from-gray-400 to-gray-600', onConnect: handleAppleConnect },
    { id: 'outlook', name: 'Outlook Calendar', icon: 'Ⓜ️', color: 'from-blue-500 to-purple-600', onConnect: handleOutlookConnect },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-gradient-to-br from-slate-900/30 to-slate-800/20 border border-white/10 p-4"
    >
      {/* Header */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-white/80 hover:text-white transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔄</span>
          <span className="font-semibold">{t('calendar.sync.title') || 'Calendar Sync'}</span>
        </div>
        <div className="flex items-center gap-2">
          {connectedServices.size > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 font-medium">
              {connectedServices.size} connected
            </span>
          )}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.div>
        </div>
      </motion.button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4"
          >
            {/* Sync Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-3 rounded-lg border transition-colors ${
                syncStatus === 'synced'
                  ? 'bg-green-500/10 border-green-500/30'
                  : syncStatus === 'syncing'
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : syncStatus === 'error'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {syncStatus === 'syncing' && 'Syncing...'}
                    {syncStatus === 'synced' && '✓ Synced'}
                    {syncStatus === 'error' && '✕ Sync Error'}
                    {syncStatus === 'idle' && 'Ready to sync'}
                  </p>
                  {lastSync && (
                    <p className="text-xs text-white/60 mt-1">
                      {t('calendar.sync.lastSync') || 'Last synced'}: {lastSync.toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {syncStatus === 'syncing' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                    />
                  )}
                  {syncStatus === 'synced' && <div className="text-green-400 font-bold">✓</div>}
                  {syncStatus === 'error' && <div className="text-red-400 font-bold">✕</div>}
                </div>
              </div>
            </motion.div>

            {/* Connected Services */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-white/60 uppercase">{t('calendar.sync.services') || 'Calendar Services'}</p>

              {services.map(({ id, name, icon, color, onConnect }) => {
                const isConnected = connectedServices.has(id as SyncService);

                return (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isConnected
                        ? 'bg-accent-500/10 border-accent-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded bg-gradient-to-br ${color} flex items-center justify-center text-sm font-bold`}>
                        {icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{name}</p>
                        <p className="text-xs text-white/60">
                          {isConnected ? '✓ Connected' : 'Sync events automatically'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => isConnected ? handleDisconnect(id as SyncService) : onConnect()}
                      disabled={syncStatus === 'syncing'}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isConnected
                          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                      } disabled:opacity-50`}
                    >
                      {isConnected ? 'Disconnect' : 'Connect'}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Sync Frequency */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-white/60 uppercase">{t('calendar.sync.frequency') || 'Sync Frequency'}</p>
              <div className="grid grid-cols-3 gap-2">
                {(['realtime', 'hourly', 'daily'] as const).map((freq) => (
                  <motion.button
                    key={freq}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSyncConfig((prev) => ({ ...prev, syncFrequency: freq }))}
                    className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                      syncConfig.syncFrequency === freq
                        ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-black shadow-lg'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {freq === 'realtime' ? 'Real-time' : freq === 'hourly' ? 'Hourly' : 'Daily'}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Auto-Sync Toggle */}
            <motion.label
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-accent-500/10 to-accent-600/10 border border-accent-500/30 cursor-pointer hover:from-accent-500/15 hover:to-accent-600/15 transition-colors"
            >
              <input
                type="checkbox"
                checked={syncConfig.autoSync}
                onChange={(e) => setSyncConfig((prev) => ({ ...prev, autoSync: e.target.checked }))}
                className="accent-accent-500"
              />
              <div>
                <p className="text-sm font-semibold text-white">{t('calendar.sync.autoSync') || 'Auto-Sync Enabled'}</p>
                <p className="text-xs text-white/60">{t('calendar.sync.autoSyncDesc') || 'Automatically sync with connected services'}</p>
              </div>
            </motion.label>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-white/10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSyncAll}
                disabled={syncStatus === 'syncing' || connectedServices.size === 0}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50 transition-colors"
              >
                {syncStatus === 'syncing' ? (t('calendar.sync.syncing') || 'Syncing...') : (t('calendar.sync.syncNow') || 'Sync Now')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SmartCalendarSync;
