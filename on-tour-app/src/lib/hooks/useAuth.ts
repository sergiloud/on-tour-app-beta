/**
 * Authentication Context and Hooks
 * Gestión de autenticación y token JWT
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  username: string | null;
  email: string | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  onUnauthorized?: () => void;
}

export function AuthProvider({ children, onUnauthorized }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken) {
      try {
        apiClient.setAuthToken(storedToken);
        setTokenState(storedToken);

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserId(user.id);
          setUsername(user.username);
          setEmail(user.email);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to restore auth:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await apiClient.post<{
          token: string;
          user: {
            id: string;
            username: string;
            email: string;
          };
        }>('/auth/login', { username, password });

        if (response.statusCode !== 200 || !response.data) {
          throw new Error(response.error || 'Login failed');
        }

        const { token: newToken, user } = response.data;

        // Store token and user
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(user));

        // Update API client
        apiClient.setAuthToken(newToken);

        // Update state
        setTokenState(newToken);
        setUserId(user.id);
        setUsername(user.username);
        setEmail(user.email);
        setIsAuthenticated(true);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    apiClient.clearAuth();

    setTokenState(null);
    setUserId(null);
    setUsername(null);
    setEmail(null);
    setIsAuthenticated(false);
  }, []);

  const setToken = useCallback((newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    apiClient.setAuthToken(newToken);
    setTokenState(newToken);
    setIsAuthenticated(true);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await apiClient.post<{
        token: string;
      }>('/auth/refresh', {});

      if (response.statusCode !== 200 || !response.data) {
        throw new Error('Token refresh failed');
      }

      const newToken = response.data.token;
      setToken(newToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      onUnauthorized?.();
    }
  }, [setToken, logout, onUnauthorized]);

  const value: AuthContextType = {
    isAuthenticated,
    userId,
    username,
    email,
    token,
    isLoading,
    login,
    logout,
    setToken,
    refresh
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acceder al contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook para verificar si el usuario está autenticado
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook para obtener datos del usuario actual
 */
export function useCurrentUser() {
  const { userId, username, email } = useAuth();
  return { userId, username, email };
}
