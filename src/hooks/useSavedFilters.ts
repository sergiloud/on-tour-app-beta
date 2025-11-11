/**
 * useSavedFilters Hook - Persistent Filter Views
 *
 * Gestiona vistas de filtros guardadas con Firebase + localStorage persistence.
 * Permite a power users guardar, renombrar y eliminar configuraciones
 * de filtros personalizadas.
 *
 * FEATURES:
 * - Firebase + localStorage persistence
 * - Default presets (All, Last Month, High Value, Pending)
 * - Custom user views
 * - Rename/delete functionality
 * - Auto-apply last used view
 *
 * USO:
 * const { views, activeView, saveView, applyView, deleteView } = useSavedFilters();
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import FirestoreUserPreferencesService from '../services/firestoreUserPreferencesService';

/**
 * Vista de filtros guardada
 */
export interface SavedFilterView {
  /** ID único de la vista */
  id: string;
  /** Nombre de la vista */
  name: string;
  /** Es una vista predefinida (no se puede eliminar) */
  isPreset: boolean;
  /** Filtros aplicados */
  filters: {
    filterType: 'all' | 'income' | 'expense';
    filterCategory: string;
    filterStatus: 'all' | 'paid' | 'pending';
    searchQuery: string;
  };
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de última modificación */
  updatedAt: string;
}

/**
 * Vistas predefinidas del sistema
 */
const DEFAULT_PRESETS: SavedFilterView[] = [
  {
    id: 'preset-all',
    name: 'Todas las Transacciones',
    isPreset: true,
    filters: {
      filterType: 'all',
      filterCategory: 'all',
      filterStatus: 'all',
      searchQuery: '',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-pending',
    name: 'Pendientes de Pago',
    isPreset: true,
    filters: {
      filterType: 'all',
      filterCategory: 'all',
      filterStatus: 'pending',
      searchQuery: '',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-expenses',
    name: 'Solo Gastos',
    isPreset: true,
    filters: {
      filterType: 'expense',
      filterCategory: 'all',
      filterStatus: 'all',
      searchQuery: '',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-income',
    name: 'Solo Ingresos',
    isPreset: true,
    filters: {
      filterType: 'income',
      filterCategory: 'all',
      filterStatus: 'all',
      searchQuery: '',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'finance-saved-filter-views';
const ACTIVE_VIEW_KEY = 'finance-active-filter-view';

/**
 * Hook para gestionar vistas de filtros guardadas
 */
export function useSavedFilters() {
  const [userViews, setUserViews] = useState<SavedFilterView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string>('preset-all');
  const { userId } = useAuth();

  // Cargar vistas desde Firebase (priority) o localStorage al montar
  useEffect(() => {
    if (userId) {
      FirestoreUserPreferencesService.getUserPreferences(userId)
        .then(prefs => {
          if (prefs?.savedViews) {
            setUserViews(prefs.savedViews);
            // Sync to localStorage for backwards compat
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs.savedViews));
          }
        })
        .catch(err => console.error('[useSavedFilters] Error loading saved views from Firebase:', err));
    } else {
      // Fallback to localStorage if not logged in
      try {
        const savedViews = localStorage.getItem(STORAGE_KEY);
        if (savedViews) {
          setUserViews(JSON.parse(savedViews));
        }
      } catch (error) {
        console.error('[useSavedFilters] Error loading saved views from localStorage:', error);
      }
    }

    // Always load active view from localStorage (user preference)
    try {
      const savedActiveView = localStorage.getItem(ACTIVE_VIEW_KEY);
      if (savedActiveView) {
        setActiveViewId(savedActiveView);
      }
    } catch (error) {
      console.error('[useSavedFilters] Error loading active view:', error);
    }
  }, [userId]);

  // Guardar vistas en localStorage + Firebase cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userViews));
      
      // Sync to Firebase
      if (userId && userViews.length > 0) {
        FirestoreUserPreferencesService.saveSavedViews(userId, userViews)
          .catch(err => console.error('[useSavedFilters] Error syncing views to Firebase:', err));
      }
    } catch (error) {
      console.error('[useSavedFilters] Error saving views:', error);
    }
  }, [userViews, userId]);

  // Guardar vista activa en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_VIEW_KEY, activeViewId);
    } catch (error) {
      console.error('[useSavedFilters] Error saving active view:', error);
    }
  }, [activeViewId]);

  // Combinar presets y vistas de usuario
  const allViews = [...DEFAULT_PRESETS, ...userViews];

  // Obtener vista activa
  const activeView = allViews.find(v => v.id === activeViewId) || DEFAULT_PRESETS[0];

  /**
   * Guardar nueva vista o actualizar existente
   */
  const saveView = useCallback((name: string, filters: SavedFilterView['filters']) => {
    const newView: SavedFilterView = {
      id: `custom-${Date.now()}`,
      name,
      isPreset: false,
      filters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUserViews(prev => [...prev, newView]);
    setActiveViewId(newView.id);

    return newView;
  }, []);

  /**
   * Aplicar una vista (cambiar vista activa)
   */
  const applyView = useCallback((viewId: string) => {
    const view = allViews.find(v => v.id === viewId);
    if (view) {
      setActiveViewId(viewId);
      return view;
    }
    return null;
  }, [allViews]);

  /**
   * Renombrar vista personalizada
   */
  const renameView = useCallback((viewId: string, newName: string) => {
    setUserViews(prev =>
      prev.map(view =>
        view.id === viewId
          ? { ...view, name: newName, updatedAt: new Date().toISOString() }
          : view
      )
    );
  }, []);

  /**
   * Eliminar vista personalizada
   */
  const deleteView = useCallback((viewId: string) => {
    // No permitir eliminar presets
    if (viewId.startsWith('preset-')) {
      console.warn('[useSavedFilters] Cannot delete preset views');
      return false;
    }

    setUserViews(prev => prev.filter(view => view.id !== viewId));

    // Si se elimina la vista activa, volver a "All"
    if (activeViewId === viewId) {
      setActiveViewId('preset-all');
    }

    return true;
  }, [activeViewId]);

  /**
   * Actualizar filtros de una vista existente
   */
  const updateView = useCallback((viewId: string, filters: SavedFilterView['filters']) => {
    setUserViews(prev =>
      prev.map(view =>
        view.id === viewId
          ? { ...view, filters, updatedAt: new Date().toISOString() }
          : view
      )
    );
  }, []);

  return {
    /** Todas las vistas (presets + user) */
    allViews,
    /** Solo vistas de usuario (custom) */
    userViews,
    /** Vistas predefinidas */
    presetViews: DEFAULT_PRESETS,
    /** Vista actualmente activa */
    activeView,
    /** ID de la vista activa */
    activeViewId,
    /** Guardar nueva vista */
    saveView,
    /** Aplicar vista existente */
    applyView,
    /** Renombrar vista personalizada */
    renameView,
    /** Eliminar vista personalizada */
    deleteView,
    /** Actualizar filtros de vista */
    updateView,
  };
}
