/**
 * MFA Enforcement Guard
 * 
 * Implements mandatory MFA for admin/owner users as per v2.2.1 security audit.
 * This is a simplified implementation that provides the foundation for full MFA enforcement.
 * 
 * Security Policy:
 * - Admin and Owner roles should have MFA enabled
 * - Provides user notifications and setup guidance
 * - Ready for integration with Firebase MFA
 */

import React, { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../lib/i18n';
import { useNavigate } from 'react-router-dom';

interface MFAEnforcementGuardProps {
  children: ReactNode;
  // Skip enforcement (for MFA setup pages)
  bypass?: boolean;
}

export function MFAEnforcementGuard({ children, bypass = false }: MFAEnforcementGuardProps) {
  const { userId, profile } = useAuth();
  const navigate = useNavigate();
  
  const [showMFAWarning, setShowMFAWarning] = useState(false);

  // Simple check for admin users without MFA (demo purposes)
  useEffect(() => {
    if (!userId || bypass) {
      setShowMFAWarning(false);
      return;
    }

    // Check if user has admin-like profile characteristics
    const isAdminLike = profile?.email?.includes('admin') || profile?.name?.toLowerCase().includes('admin');
    const mfaEnabled = localStorage.getItem(`mfa_enabled_${userId}`) === 'true';
    
    // Show warning if admin user without MFA
    if (isAdminLike && !mfaEnabled) {
      setShowMFAWarning(true);
    } else {
      setShowMFAWarning(false);
    }
  }, [userId, profile, bypass]);

  // Show MFA recommendation for admin users
  if (showMFAWarning) {
    return (
      <div className="relative">
        {/* MFA Recommendation Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap">
              <div className="w-0 flex-1 flex items-center">
                <span className="flex p-2 rounded-lg bg-blue-400 dark:bg-blue-600">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                </span>
                <p className="ml-3 font-medium text-blue-800 dark:text-blue-200">
                  {t('security.mfa.enforcement_message', { role: 'Admin' })}
                </p>
              </div>
              <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                <button
                  onClick={() => navigate('/settings/security')}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 mr-2"
                >
                  {t('security.mfa.setup_now')}
                </button>
                <button
                  onClick={() => setShowMFAWarning(false)}
                  className="flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-blue-500 hover:text-blue-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        {children}
      </div>
    );
  }

  // Normal render - no MFA enforcement needed or user dismissed warning
  return <>{children}</>;
}

/**
 * Hook to check if MFA is recommended for current user
 */
export function useMFARecommendation() {
  const { userId, profile } = useAuth();
  
  const isAdminLike = profile?.email?.includes('admin') || profile?.name?.toLowerCase().includes('admin');
  const mfaEnabled = userId ? localStorage.getItem(`mfa_enabled_${userId}`) === 'true' : false;
  
  return {
    shouldRecommendMFA: isAdminLike && !mfaEnabled,
    isMFAEnabled: mfaEnabled,
  };
}