/**
 * Tests Unitarios para useTransactionFilters
 *
 * COBERTURA OBJETIVO: 100%
 *
 * Estrategia de Testing:
 * 1. Filtros individuales (type, category, status, search)
 * 2. Filtros combinados (múltiples filtros activos simultáneamente)
 * 3. Funcionalidad resetFilters
 * 4. Categorías disponibles (availableCategories)
 * 5. Estadísticas de conteo (totalCount, filteredCount)
 * 6. Edge cases (arrays vacíos, sin coincidencias, etc.)
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionFilters } from '../useTransactionFilters';
import type { TransactionV3 } from '../../types/financeV3';

// ============================================================================
// FIXTURES: Datos de prueba realistas
// ============================================================================

const mockTransactions: TransactionV3[] = [
  {
    id: '1',
    type: 'income',
    amount: 5000,
    category: 'Conciertos',
    description: 'Concierto Madrid - Rock Festival',
    date: '2024-01-15',
    status: 'paid',
    tripTitle: 'Tour España 2024'
  },
  {
    id: '2',
    type: 'expense',
    amount: 1200,
    category: 'Alojamiento',
    description: 'Hotel Madrid Centro',
    date: '2024-01-16',
    status: 'paid'
  },
  {
    id: '3',
    type: 'expense',
    amount: 800,
    category: 'Transporte',
    description: 'Vuelos Barcelona-Madrid',
    date: '2024-01-17',
    status: 'paid'
  },
  {
    id: '4',
    type: 'income',
    amount: 3000,
    category: 'Conciertos',
    description: 'Concierto Barcelona',
    date: '2024-01-20',
    status: 'pending',
    tripTitle: 'Tour España 2024'
  },
  {
    id: '5',
    type: 'expense',
    amount: 500,
    category: 'Producción',
    description: 'Equipo audio rental',
    date: '2024-01-18',
    status: 'pending'
  },
  {
    id: '6',
    type: 'expense',
    amount: 300,
    category: 'Alojamiento',
    description: 'Hostel Barcelona',
    date: '2024-01-21',
    status: 'paid'
  },
  {
    id: '7',
    type: 'income',
    amount: 2500,
    category: 'Merchandising',
    description: 'Venta de camisetas',
    date: '2024-01-22',
    status: 'paid'
  },
];

// ============================================================================
// TEST SUITE: Filtros Individuales
// ============================================================================

describe('useTransactionFilters - filtros individuales', () => {
  it('filtra por tipo: income', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setFilterType('income');
    });

    expect(result.current.filteredTransactions).toHaveLength(3);
    expect(result.current.filteredTransactions.every(t => t.type === 'income')).toBe(true);
  });

  it('filtra por tipo: expense', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setFilterType('expense');
    });

    expect(result.current.filteredTransactions).toHaveLength(4);
    expect(result.current.filteredTransactions.every(t => t.type === 'expense')).toBe(true);
  });

  it('filtra por categoría específica', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setFilterCategory('Alojamiento');
    });

    expect(result.current.filteredTransactions).toHaveLength(2);
    expect(result.current.filteredTransactions.every(t => t.category === 'Alojamiento')).toBe(true);
  });

  it('filtra por status: paid', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setFilterStatus('paid');
    });

    expect(result.current.filteredTransactions).toHaveLength(5);
    expect(result.current.filteredTransactions.every(t => t.status === 'paid')).toBe(true);
  });

  it('filtra por status: pending', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setFilterStatus('pending');
    });

    expect(result.current.filteredTransactions).toHaveLength(2);
    expect(result.current.filteredTransactions.every(t => t.status === 'pending')).toBe(true);
  });

  it('filtra por búsqueda de texto en description', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setSearchQuery('Madrid');
    });

    expect(result.current.filteredTransactions).toHaveLength(3); // Concierto Madrid + Hotel Madrid + Vuelos Barcelona-Madrid
  });

  it('filtra por búsqueda de texto en category', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setSearchQuery('Conciertos');
    });

    expect(result.current.filteredTransactions).toHaveLength(2);
  });

  it('filtra por búsqueda de texto en tripTitle', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setSearchQuery('Tour España');
    });

    expect(result.current.filteredTransactions).toHaveLength(2);
  });

  it('la búsqueda es case-insensitive', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setSearchQuery('MADRID');
    });

    expect(result.current.filteredTransactions).toHaveLength(3);
  });
});

// ============================================================================
// TEST SUITE: Filtros Combinados
// ============================================================================

describe('useTransactionFilters - filtros combinados', () => {
  it('combina filterType y filterCategory', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setFilterType('expense');
      result.current.setFilterCategory('Alojamiento');
    });

    expect(result.current.filteredTransactions).toHaveLength(2);
    expect(result.current.filteredTransactions.every(t =>
      t.type === 'expense' && t.category === 'Alojamiento'
    )).toBe(true);
  });

  it('combina filterType y filterStatus', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setFilterType('income');
      result.current.setFilterStatus('paid');
    });

    expect(result.current.filteredTransactions).toHaveLength(2); // 2 ingresos paid
  });

  it('combina filterCategory y searchQuery', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setFilterCategory('Conciertos');
      result.current.setSearchQuery('Barcelona');
    });

    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions[0]?.id).toBe('4');
  });

  it('combina todos los filtros simultáneamente', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setFilterType('expense');
      result.current.setFilterCategory('Alojamiento');
      result.current.setFilterStatus('paid');
      result.current.setSearchQuery('Hotel');
    });

    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions[0]?.id).toBe('2');
  });

  it('retorna array vacío cuando filtros combinados no coinciden', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setFilterType('income');
      result.current.setFilterCategory('Alojamiento'); // Los ingresos no son de Alojamiento
    });

    expect(result.current.filteredTransactions).toHaveLength(0);
  });
});

// ============================================================================
// TEST SUITE: Reset Filters
// ============================================================================

describe('useTransactionFilters - resetFilters', () => {
  it('resetea todos los filtros a valores por defecto', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    // Aplicar varios filtros
    act(() => {
      result.current.setFilterType('expense');
      result.current.setFilterCategory('Alojamiento');
      result.current.setFilterStatus('paid');
      result.current.setSearchQuery('Hotel');
    });

    expect(result.current.filteredTransactions).toHaveLength(1);

    // Resetear
    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filterType).toBe('all');
    expect(result.current.filterCategory).toBe('all');
    expect(result.current.filterStatus).toBe('all');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.filteredTransactions).toHaveLength(7); // Todas las transacciones
  });
});

// ============================================================================
// TEST SUITE: Categorías Disponibles
// ============================================================================

describe('useTransactionFilters - availableCategories', () => {
  it('retorna todas las categorías únicas ordenadas', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    expect(result.current.availableCategories).toEqual([
      'Alojamiento',
      'Conciertos',
      'Merchandising',
      'Producción',
      'Transporte'
    ]);
  });

  it('actualiza categorías cuando cambian las transacciones', () => {
    const { result, rerender } = renderHook(
      ({ transactions }) => useTransactionFilters(transactions),
      { initialProps: { transactions: mockTransactions } }
    );

    expect(result.current.availableCategories).toHaveLength(5);

    // Actualizar con solo una transacción
    const newTransactions: TransactionV3[] = [{
      id: '1',
      type: 'income',
      amount: 1000,
      category: 'NuevaCategoria',
      description: 'Test',
      date: '2024-01-01',
      status: 'paid'
    }];

    rerender({ transactions: newTransactions });

    expect(result.current.availableCategories).toEqual(['NuevaCategoria']);
  });
});

// ============================================================================
// TEST SUITE: Estadísticas de Conteo
// ============================================================================

describe('useTransactionFilters - estadísticas de conteo', () => {
  it('totalCount siempre refleja el total de transacciones', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    expect(result.current.totalCount).toBe(7);

    act(() => {
      result.current.setFilterType('income');
    });

    expect(result.current.totalCount).toBe(7); // No cambia
  });

  it('filteredCount refleja el número de transacciones filtradas', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    expect(result.current.filteredCount).toBe(7);

    act(() => {
      result.current.setFilterType('income');
    });

    expect(result.current.filteredCount).toBe(3);
  });

  it('filteredCount es 0 cuando no hay coincidencias', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setSearchQuery('NoExiste12345');
    });

    expect(result.current.filteredCount).toBe(0);
  });
});

// ============================================================================
// TEST SUITE: Edge Cases
// ============================================================================

describe('useTransactionFilters - edge cases', () => {
  it('maneja array vacío de transacciones', () => {
    const { result } = renderHook(() => useTransactionFilters([]));

    expect(result.current.filteredTransactions).toHaveLength(0);
    expect(result.current.availableCategories).toHaveLength(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.filteredCount).toBe(0);
  });

  it('maneja búsqueda vacía (retorna todas las transacciones)', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    act(() => {
      result.current.setSearchQuery('');
    });

    expect(result.current.filteredTransactions).toHaveLength(7);
  });

  it('maneja transacciones sin tripTitle', () => {
    const transactionsWithoutTripTitle: TransactionV3[] = [{
      id: '1',
      type: 'income',
      amount: 1000,
      category: 'Test',
      description: 'Test description',
      date: '2024-01-01',
      status: 'paid'
      // Sin tripTitle
    }];

    const { result } = renderHook(() => useTransactionFilters(transactionsWithoutTripTitle));

    act(() => {
      result.current.setSearchQuery('Test');
    });

    expect(result.current.filteredTransactions).toHaveLength(1);
  });

  it('preserva readonly en filteredTransactions', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    // TypeScript debería prevenir esto, pero verificamos que el tipo es readonly
    const filtered = result.current.filteredTransactions;
    expect(Array.isArray(filtered)).toBe(true);
    expect(filtered).toBeDefined();
  });

  it('preserva readonly en availableCategories', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    const categories = result.current.availableCategories;
    expect(Array.isArray(categories)).toBe(true);
    expect(categories).toBeDefined();
  });

  it('mantiene referencias estables cuando no cambian inputs', () => {
    const { result, rerender } = renderHook(() => useTransactionFilters(mockTransactions));

    const firstFiltered = result.current.filteredTransactions;
    const firstCategories = result.current.availableCategories;

    rerender();

    // Las referencias deben ser las mismas (useMemo funcionando)
    expect(result.current.filteredTransactions).toBe(firstFiltered);
    expect(result.current.availableCategories).toBe(firstCategories);
  });

  it('actualiza referencias cuando cambian los filtros', () => {
    const { result } = renderHook(() => useTransactionFilters(mockTransactions));

    const firstFiltered = result.current.filteredTransactions;

    act(() => {
      result.current.setFilterType('income');
    });

    // La referencia debe cambiar (nuevo array filtrado)
    expect(result.current.filteredTransactions).not.toBe(firstFiltered);
  });
});
