/**
 * Clear demo data from localStorage when switching to Firebase mode
 * This prevents "Malformed UTF-8" errors from encrypted demo data
 */

export function clearDemoData() {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('[ClearDemoData] Clearing demo data from localStorage...');
    
    // List of demo keys to clear
    const demoKeys = [
      // Demo auth
      'demo:currentUser',
      'demo:usersProfiles',
      'demo:usersPrefs',
      'demo:authed',
      
      // Tenants
      'demo:orgs',
      'demo:users',
      'demo:memberships',
      'demo:teams',
      'demo:agencyLinks',
      'demo:currentOrg',
      
      // Shows
      'shows-store-v3',
      
      // Contacts
      'on-tour-contacts',
      
      // Settings
      'on-tour-app-settings',
      
      // Any encrypted keys (secureStorage prefix)
      'secure:demo:currentUser',
      'secure:demo:usersProfiles',
      'secure:demo:usersPrefs',
      'secure:demo:authed',
      'secure:demo:orgs',
      'secure:demo:users',
      'secure:demo:memberships',
      'secure:demo:teams',
      'secure:demo:agencyLinks',
      'secure:demo:currentOrg',
    ];
    
    let cleared = 0;
    for (const key of demoKeys) {
      try {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key);
          cleared++;
        }
      } catch (e) {
        // Ignore individual key errors
      }
    }
    
    // Also clear any other keys that start with 'demo:' or 'secure:demo:'
    try {
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (key.startsWith('demo:') || key.startsWith('secure:demo:')) {
          localStorage.removeItem(key);
          cleared++;
        }
      }
    } catch (e) {
      // Ignore
    }
    
    console.log(`[ClearDemoData] Cleared ${cleared} demo keys from localStorage`);
    
    return cleared;
  } catch (error) {
    console.error('[ClearDemoData] Error clearing demo data:', error);
    return 0;
  }
}

/**
 * Clear ALL localStorage (nuclear option for corrupted data)
 */
export function clearAllLocalStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    console.warn('[ClearDemoData] CLEARING ALL localStorage - nuclear option!');
    const count = localStorage.length;
    localStorage.clear();
    console.log(`[ClearDemoData] Cleared ${count} total keys from localStorage`);
    return count;
  } catch (error) {
    console.error('[ClearDemoData] Error clearing localStorage:', error);
    return 0;
  }
}
