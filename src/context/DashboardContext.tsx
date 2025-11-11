import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import FirestoreUserPreferencesService from '../services/firestoreUserPreferencesService';

type DateRange = '30' | '60' | '90' | 'all';
type ShowStatus = 'confirmed' | 'pending' | 'offer' | 'all';

interface DashboardFilters {
    dateRange: DateRange;
    status: ShowStatus;
    searchQuery: string;
}

interface DashboardContextType {
    filters: DashboardFilters;
    setDateRange: (range: DateRange) => void;
    setStatus: (status: ShowStatus) => void;
    setSearchQuery: (query: string) => void;
    resetFilters: () => void;
}

const defaultFilters: DashboardFilters = {
    dateRange: '30',
    status: 'all',
    searchQuery: ''
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { userId } = useAuth();
    const [filters, setFilters] = useState<DashboardFilters>(() => {
        // Load from localStorage if available
        const saved = localStorage.getItem('on-tour-dashboard-filters');
        return saved ? JSON.parse(saved) : defaultFilters;
    });

    // Sync with Firebase when filters change
    useEffect(() => {
        if (userId) {
            // Debounce para no hacer demasiadas escrituras
            const timeoutId = setTimeout(() => {
                FirestoreUserPreferencesService.saveDashboardFilters(userId, {
                    dateRange: filters.dateRange,
                    status: filters.status,
                    searchQuery: filters.searchQuery
                }).catch(err => {
                    console.error('Failed to sync dashboard filters to Firebase:', err);
                });
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [userId, filters]);

    // Load from Firebase on mount
    useEffect(() => {
        if (userId) {
            FirestoreUserPreferencesService.getUserPreferences(userId)
                .then(prefs => {
                    if (prefs?.dashboard) {
                        setFilters(prefs.dashboard as any);
                        localStorage.setItem('on-tour-dashboard-filters', JSON.stringify(prefs.dashboard));
                    }
                })
                .catch(err => {
                    console.error('Failed to load dashboard filters from Firebase:', err);
                });
        }
    }, [userId]);

    const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            localStorage.setItem('on-tour-dashboard-filters', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const setDateRange = useCallback((range: DateRange) => {
        updateFilters({ dateRange: range });
    }, [updateFilters]);

    const setStatus = useCallback((status: ShowStatus) => {
        updateFilters({ status });
    }, [updateFilters]);

    const setSearchQuery = useCallback((query: string) => {
        updateFilters({ searchQuery: query });
    }, [updateFilters]);

    const resetFilters = useCallback(() => {
        setFilters(defaultFilters);
        localStorage.removeItem('on-tour-dashboard-filters');
        if (userId) {
            FirestoreUserPreferencesService.saveDashboardFilters(userId, defaultFilters).catch(err => {
                console.error('Failed to reset dashboard filters in Firebase:', err);
            });
        }
    }, [userId]);

    return (
        <DashboardContext.Provider
            value={{
                filters,
                setDateRange,
                setStatus,
                setSearchQuery,
                resetFilters
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboardFilters = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboardFilters must be used within DashboardProvider');
    }
    return context;
};

// Helper hook to get filtered shows based on dashboard filters
export const useFilteredShowsByDashboard = (shows: any[]) => {
    const { filters } = useDashboardFilters();

    return React.useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;

        let filtered = [...shows];

        // Filter by date range
        if (filters.dateRange !== 'all') {
            const days = parseInt(filters.dateRange);
            const maxDate = now + days * DAY;
            filtered = filtered.filter(show => {
                const showDate = new Date(show.date).getTime();
                return showDate >= now && showDate <= maxDate;
            });
        } else {
            // All future shows
            filtered = filtered.filter(show => new Date(show.date).getTime() >= now);
        }

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(show => show.status === filters.status);
        }

        // Filter by search query
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(show =>
                show.city?.toLowerCase().includes(query) ||
                show.venue?.toLowerCase().includes(query) ||
                show.country?.toLowerCase().includes(query)
            );
        }

        return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [shows, filters]);
};
