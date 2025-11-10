import { useState, useMemo } from 'react';
import type { TransactionV3 } from '../types/financeV3';

export type FilterType = 'all' | 'income' | 'expense';
export type FilterStatus = 'all' | 'paid' | 'pending';

/**
 * Tipo de retorno explícito del hook useTransactionFilters
 *
 * Beneficios DX:
 * - Autocompletado preciso al desestructurar el hook
 * - Contrato claro de estado y operaciones disponibles
 * - Readonly en datos derivados previene mutaciones accidentales
 * - IntelliSense mejorado en el IDE
 */
export interface UseTransactionFiltersReturn {
  // Estado actual de los filtros
  readonly filterType: FilterType;
  readonly filterCategory: string;
  readonly filterStatus: FilterStatus;
  readonly searchQuery: string;

  // Setters para actualizar filtros
  readonly setFilterType: (type: FilterType) => void;
  readonly setFilterCategory: (category: string) => void;
  readonly setFilterStatus: (status: FilterStatus) => void;
  readonly setSearchQuery: (query: string) => void;

  // Datos derivados (solo lectura)
  readonly filteredTransactions: readonly TransactionV3[];
  readonly availableCategories: readonly string[];

  // Utilidades
  readonly resetFilters: () => void;

  // Estadísticas de filtrado
  readonly totalCount: number;
  readonly filteredCount: number;
}

/**
 * Custom hook para gestionar el estado y lógica de filtrado de transacciones
 *
 * Ventajas:
 * - Encapsula toda la lógica de filtrado en un lugar reutilizable
 * - El componente no necesita saber "cómo" se filtran las transacciones
 * - Testeable de forma aislada sin renderizar componentes
 * - Fácil de extender con nuevos filtros
 * - Tipo de retorno explícito para mejor DX
 */
export function useTransactionFilters(transactions: readonly TransactionV3[]): UseTransactionFiltersReturn {
  // Estado de los filtros
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Aplicar todos los filtros
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filtrar por tipo (income/expense)
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtrar por categoría
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Filtrar por estado (paid/pending)
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Búsqueda por texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.tripTitle?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [transactions, filterType, filterCategory, filterStatus, searchQuery]);

  // Resetear todos los filtros
  const resetFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setFilterStatus('all');
    setSearchQuery('');
  };

  // Obtener categorías únicas (para dropdown de filtros)
  const availableCategories = useMemo(() => {
    const categories = new Set(transactions.map(t => t.category));
    return Array.from(categories).sort();
  }, [transactions]);

  return {
    // Estado
    filterType,
    filterCategory,
    filterStatus,
    searchQuery,

    // Setters
    setFilterType,
    setFilterCategory,
    setFilterStatus,
    setSearchQuery,

    // Datos derivados
    filteredTransactions,
    availableCategories,

    // Utilidades
    resetFilters,

    // Estadísticas de filtrado
    totalCount: transactions.length,
    filteredCount: filteredTransactions.length,
  };
}
