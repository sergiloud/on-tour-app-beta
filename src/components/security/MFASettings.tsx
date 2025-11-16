/**
 * MFA Settings Component
 * 
 * Multi-Factor Authentication management UI
 * 
 * Features:
 * - Enable/disable MFA
 * - Register biometric devices (TouchID, FaceID, Windows Hello)
 * - Register security keys (YubiKey, etc.)
 * - View/manage registered devices
 * - Generate/view backup codes
 * - Device removal
 */

import { useState, useEffect } from 'react';
import { webAuthnService } from '../../services/WebAuthnService';
import type { MFAEnrollmentStatus } from '../../types/webauthn';
import { useAuth } from '../../context/AuthContext';
import { logger } from '../../lib/logger';
import { t } from '../../lib/i18n';

export function MFASettings() {
  const { userId, profile } = useAuth();
  const [status, setStatus] = useState<MFAEnrollmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState('');

  useEffect(() => {
    loadMFAStatus();
  }, [userId]);

  const loadMFAStatus = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const mfaStatus = await webAuthnService.getMFAStatus(userId);
      setStatus(mfaStatus);
    } catch (err) {
      logger.error('[MFASettings] Failed to load status', err as Error);
      setError(t('settings.mfa.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDevice = async (preferPlatform: boolean = true) => {
    if (!userId) return;

    setError(null);
    setRegistering(true);

    try {
      const name = deviceName.trim() || (preferPlatform ? 'This device' : 'Security key');
      
      await webAuthnService.registerAuthenticator(
        userId,
        profile.email || '',
        profile.name || profile.email || 'User',
        name,
        preferPlatform
      );

      // Reload status
      await loadMFAStatus();
      setDeviceName('');
      
      // Generate backup codes if this is the first device
      if (!status?.enrolled) {
        await handleGenerateBackupCodes();
      }
    } catch (err) {
      logger.error('[MFASettings] Registration failed', err as Error);
      setError((err as Error).message || t('settings.mfa.register_error'));
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteDevice = async (credentialId: string) => {
    if (!userId) return;
    if (!confirm(t('settings.mfa.confirm_delete'))) return;

    try {
      await webAuthnService.deleteCredential(userId, credentialId);
      await loadMFAStatus();
    } catch (err) {
      logger.error('[MFASettings] Failed to delete device', err as Error);
      setError(t('settings.mfa.delete_error'));
    }
  };

  const handleGenerateBackupCodes = async () => {
    if (!userId) return;

    try {
      const codes = await webAuthnService.generateBackupCodes(userId);
      setBackupCodes(codes);
      setShowBackupCodes(true);
    } catch (err) {
      logger.error('[MFASettings] Failed to generate backup codes', err as Error);
      setError(t('settings.mfa.backup_codes_error'));
    }
  };

  const handleDownloadBackupCodes = () => {
    if (!backupCodes) return;

    const text = `On Tour App - Backup Codes\n\n${backupCodes.join('\n')}\n\nKeep these codes safe. Each code can only be used once.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'on-tour-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-6 text-center text-gray-500">
        {t('settings.mfa.unavailable')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('settings.mfa.title')}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('settings.mfa.description')}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Status */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {t('settings.mfa.status')}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {status.enrolled
                ? t('settings.mfa.enrolled', { count: status.devices.length })
                : t('settings.mfa.not_enrolled')}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status.enrolled
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {status.enrolled ? t('settings.mfa.active') : t('settings.mfa.inactive')}
          </span>
        </div>
      </div>

      {/* Register New Device */}
      {status.availableMethods.webauthn && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t('settings.mfa.register_device')}
          </h4>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('settings.mfa.device_name')}
              </label>
              <input
                type="text"
                id="deviceName"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder={t('settings.mfa.device_name_placeholder')}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleRegisterDevice(true)}
                disabled={registering}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registering ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('common.processing')}
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('settings.mfa.register_biometric')}
                  </>
                )}
              </button>

              <button
                onClick={() => handleRegisterDevice(false)}
                disabled={registering}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {t('settings.mfa.register_security_key')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registered Devices */}
      {status.devices.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t('settings.mfa.registered_devices')}
          </h4>
          
          <ul className="space-y-2">
            {status.devices.map((device) => (
              <li
                key={device.id}
                className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 ${
                    device.type === 'platform' 
                      ? 'text-blue-500' 
                      : 'text-purple-500'
                  }`}>
                    {device.type === 'platform' ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {device.name}
                    </p>
                    {device.lastUsed && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('settings.mfa.last_used')}: {new Date(device.lastUsed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDevice(device.id)}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  {t('common.remove')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Backup Codes */}
      {status.enrolled && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {t('settings.mfa.backup_codes')}
            </h4>
            <button
              onClick={handleGenerateBackupCodes}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {t('settings.mfa.generate_new')}
            </button>
          </div>

          {showBackupCodes && backupCodes && (
            <div className="mt-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                      {t('settings.mfa.backup_codes_warning')}
                    </h5>
                    <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-500">
                      {t('settings.mfa.backup_codes_hint')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 font-mono text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="text-gray-900 dark:text-white">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleDownloadBackupCodes}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('settings.mfa.download_codes')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
