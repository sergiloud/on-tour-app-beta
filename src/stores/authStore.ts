/**
 * Zustand Store: Authentication
 * 
 * Replaces AuthContext with modern Zustand implementation
 * Handles user authentication, session management, and auth state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logger } from '../lib/logger';

export interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  role?: 'admin' | 'user' | 'guest';
  organizationId?: string;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'facebook' | 'github') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  
  // Helpers
  hasRole: (role: User['role']) => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Login with email/password
        login: async (email, password) => {
          set({ isLoading: true, error: null });
          
          try {
            // TODO: Replace with actual Firebase auth
            // const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Demo implementation
            const user: User = {
              id: 'demo-user-' + Date.now(),
              email,
              name: email.split('@')[0],
              role: 'user'
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            
            logger.info('[AuthStore] User logged in', { userId: user.id });
          } catch (error) {
            set({ 
              error: error as Error, 
              isLoading: false,
              isAuthenticated: false 
            });
            logger.error('[AuthStore] Login failed', error as Error);
            throw error;
          }
        },

        // Login with OAuth provider
        loginWithProvider: async (provider) => {
          set({ isLoading: true, error: null });
          
          try {
            // TODO: Replace with actual Firebase auth
            // const result = await signInWithPopup(auth, getProvider(provider));
            
            // Demo implementation
            const user: User = {
              id: 'demo-' + provider + '-' + Date.now(),
              email: `demo@${provider}.com`,
              name: `Demo ${provider} User`,
              photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
              role: 'user'
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            
            logger.info('[AuthStore] User logged in with provider', { 
              userId: user.id, 
              provider 
            });
          } catch (error) {
            set({ 
              error: error as Error, 
              isLoading: false,
              isAuthenticated: false 
            });
            logger.error('[AuthStore] Provider login failed', error as Error, { provider });
            throw error;
          }
        },

        // Logout
        logout: async () => {
          try {
            // TODO: Replace with actual Firebase auth
            // await signOut(auth);
            
            set({ 
              user: null, 
              isAuthenticated: false,
              error: null
            });
            
            logger.info('[AuthStore] User logged out');
          } catch (error) {
            set({ error: error as Error });
            logger.error('[AuthStore] Logout failed', error as Error);
            throw error;
          }
        },

        // Set user (for external auth flows)
        setUser: (user) => {
          set({ 
            user, 
            isAuthenticated: !!user,
            error: null
          });
        },

        // Set loading state
        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        // Set error
        setError: (error) => {
          set({ error });
        },

        // Check if user has specific role
        hasRole: (role) => {
          const { user } = get();
          return user?.role === role;
        },

        // Check if user is admin
        isAdmin: () => {
          const { user } = get();
          return user?.role === 'admin';
        },
      }),
      {
        name: 'auth-store-v1',
        version: 1,
        // Only persist user data, not loading/error states
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;

// Convenience hooks
export const useUser = () => useAuthStore(selectUser);
export const useIsAuthenticated = () => useAuthStore(selectIsAuthenticated);
export const useAuthLoading = () => useAuthStore(selectIsLoading);
export const useAuthError = () => useAuthStore(selectError);

/**
 * Example usage:
 * 
 * // In a component
 * const user = useAuthStore(state => state.user);
 * const login = useAuthStore(state => state.login);
 * const isAuthenticated = useAuthStore(state => state.isAuthenticated);
 * 
 * // Or use convenience hooks
 * const user = useUser();
 * const isAuthenticated = useIsAuthenticated();
 * 
 * // Actions
 * await login('user@example.com', 'password');
 * await loginWithProvider('google');
 * await logout();
 * 
 * // Permission checks
 * const isAdmin = useAuthStore(state => state.isAdmin());
 * const hasAdminRole = useAuthStore(state => state.hasRole('admin'));
 */
