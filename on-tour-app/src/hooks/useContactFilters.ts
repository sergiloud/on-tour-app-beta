/**
 * useContactFilters - Custom hook para manejar filtros de contactos
 * Abstrae la lógica de filtrado y ordenamiento de contactos
 */

import { useState, useMemo } from 'react';
import type { Contact, ContactFilters } from '../types/crm';
import { contactStore } from '../shared/contactStore';

export type SortBy = 'name' | 'company' | 'recent' | 'priority';

interface UseContactFiltersResult {
  filters: ContactFilters;
  setFilters: React.Dispatch<React.SetStateAction<ContactFilters>>;
  sortBy: SortBy;
  setSortBy: React.Dispatch<React.SetStateAction<SortBy>>;
  filteredContacts: Contact[];
  sortedContacts: Contact[];
  resetFilters: () => void;
  updateFilter: <K extends keyof ContactFilters>(key: K, value: ContactFilters[K]) => void;
}

const DEFAULT_FILTERS: ContactFilters = {
  search: '',
  type: 'all',
  priority: 'all',
  status: 'all',
  tags: [],
};

export const useContactFilters = (contacts: Contact[]): UseContactFiltersResult => {
  const [filters, setFilters] = useState<ContactFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortBy>('name');

  // Aplicar filtros
  const filteredContacts = useMemo(() => {
    return contactStore.search(filters);
  }, [contacts.length, filters]);

  // Aplicar ordenamiento
  const sortedContacts = useMemo(() => {
    const sorted = [...filteredContacts];

    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );

        case 'company':
          return (a.company || '').localeCompare(b.company || '');

        case 'recent': {
          const aTime = a.lastContactedAt
            ? new Date(a.lastContactedAt).getTime()
            : 0;
          const bTime = b.lastContactedAt
            ? new Date(b.lastContactedAt).getTime()
            : 0;
          return bTime - aTime;
        }

        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }

        default:
          return 0;
      }
    });

    return sorted;
  }, [filteredContacts, sortBy]);

  // Resetear filtros
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSortBy('name');
  };

  // Actualizar un filtro específico
  const updateFilter = <K extends keyof ContactFilters>(
    key: K,
    value: ContactFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    filteredContacts,
    sortedContacts,
    resetFilters,
    updateFilter,
  };
};
